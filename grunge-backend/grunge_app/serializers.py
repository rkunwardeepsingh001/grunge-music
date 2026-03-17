import logging

from django.contrib.auth.models import User
from furl import furl
from rest_framework import serializers
from rest_framework.reverse import reverse as drf_reverse

from .fields import UUIDHyperlinkedIdentityField
from .models import Album, Artist, Playlist, PlaylistTrack, Track

logger = logging.getLogger(__name__)


class SignupSerializer(serializers.ModelSerializer):
    """
    Serializer used for user signup.

    Creates a new Django User using username, email, and password.
    Password is write-only for security reasons.
    """

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        """
        Create a new user using Django's create_user method.
        """
        logger.info("SignupSerializer create() called")
        try:
            user = User.objects.create_user(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"],
            )

            logger.info(f"User created successfully: {user.username}")
            return user

        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise


class TrackAlbumArtistSerializer(serializers.ModelSerializer):
    """
    Minimal Artist serializer used inside Album/Track serializers.
    """
    uuid = serializers.ReadOnlyField()
    url = UUIDHyperlinkedIdentityField(view_name="artist-detail")

    class Meta:
        model = Artist
        fields = ("uuid", "url", "name")


class TrackAlbumSerializer(serializers.ModelSerializer):
    """
    Album serializer used inside Track serializer.
    Includes nested artist representation.
    """
    uuid = serializers.ReadOnlyField()
    url = UUIDHyperlinkedIdentityField(view_name="album-detail")
    artist = TrackAlbumArtistSerializer()

    class Meta:
        model = Album
        fields = ("uuid", "url", "name", "artist")


class AlbumTrackSerializer(serializers.ModelSerializer):
    """
    Track serializer used inside Album serializer.
    """
    uuid = serializers.ReadOnlyField()
    url = UUIDHyperlinkedIdentityField(view_name="track-detail")

    class Meta:
        model = Track
        fields = ("uuid", "url", "name", "number")


class AlbumArtistSerializer(serializers.ModelSerializer):
    """
    Artist serializer used inside Album serializer.
    """
    uuid = serializers.ReadOnlyField()
    url = UUIDHyperlinkedIdentityField(view_name="artist-detail")

    class Meta:
        model = Artist
        fields = ("uuid", "url", "name")


class AlbumSerializer(serializers.ModelSerializer):
    """
    Serializer for Album model.

    Supports:
    - Read nested artist
    - Write using artist_uuid
    """
    uuid = serializers.ReadOnlyField()
    url = UUIDHyperlinkedIdentityField(view_name="album-detail")
    artist = AlbumArtistSerializer(read_only=True)
    artist_uuid = serializers.SlugRelatedField(
        slug_field="uuid",
        queryset=Artist.objects.all(),
        source="artist",
        write_only=True,
        required=False,  # ← stops "field is required" on PATCH
    )

    class Meta:
        model = Album
        fields = ("uuid", "url", "name", "year", "artist", "artist_uuid")

    def validate(self, data):
        """
        Ensure artist is provided when creating album.
        """

        logger.info("Validating AlbumSerializer")
        if not self.instance and "artist" not in data:
            logger.warning("Artist missing while creating album")
            raise serializers.ValidationError(
                {"artist_uuid": "This field is required."}
            )
        return data


class TrackSerializer(serializers.ModelSerializer):
    """
    Serializer for Track model.

    - Read: nested album
    - Write: album_uuid
    """

    uuid = serializers.ReadOnlyField()
    url = UUIDHyperlinkedIdentityField(view_name="track-detail")

    # Read: returns nested object
    album = TrackAlbumSerializer(read_only=True)
    # Write: accepts album uuid string
    album_uuid = serializers.SlugRelatedField(
        slug_field="uuid",
        queryset=Album.objects.all(),
        source="album",
        write_only=True,
    )

    class Meta:
        model = Track
        fields = ("uuid", "url", "name", "number", "album", "album_uuid")


class PlaylistTrackRepresentationSerializer(serializers.ModelSerializer):
    """
    Serializer used to represent PlaylistTrack relation.
    """
    uuid = serializers.ReadOnlyField(source="track.uuid")
    order = serializers.ReadOnlyField()

    class Meta:
        model = PlaylistTrack
        fields = ("uuid", "order")


class PlaylistSerializer(serializers.ModelSerializer):
    """
    Serializer for Playlist model.

    Supports:
    - Writing tracks using UUID list
    - Returning ordered track UUID list
    """

    uuid = serializers.ReadOnlyField()
    tracks = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True,
    )

    class Meta:
        model = Playlist
        fields = ("uuid", "name", "tracks")
        read_only_fields = ["user"]

    def to_representation(self, instance):
        """
        Return track UUIDs in order.
        """
        logger.info("Serializing playlist representation")
        rep = super().to_representation(instance)
        rep["tracks"] = [
            pt.track.uuid for pt in instance.playlist_tracks.order_by("order")
        ]
        return rep

    def _set_tracks(self, playlist, track_uuids):
        """
        Replace playlist tracks with new ordered list.
        """
        logger.info("Setting playlist tracks")
        playlist.playlist_tracks.all().delete()
        for order, uuid in enumerate(track_uuids, start=1):
            track = Track.objects.get(uuid=uuid)
            PlaylistTrack.objects.create(playlist=playlist, track=track, order=order)

    def create(self, validated_data):
             """
        Create playlist and assign tracks.
        """
        # track_
        track_uuids = validated_data.pop("tracks", [])
        playlist = Playlist.objects.create(**validated_data)
        if track_uuids:
            self._set_tracks(playlist, track_uuids)
        logger.info("Playlist created")
        return playlist

    def update(self, instance, validated_data):
             """
        update playlist and assign tracks.
        """
        # track_
        logger.info("Updating playlist")
        track_uuids = validated_data.pop("tracks", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if track_uuids is not None:
            self._set_tracks(instance, track_uuids)
        logger.info("Playlist updated")
        return instance


class ArtistSerializer(serializers.ModelSerializer):
    """
    Serializer for Artist model.

    Adds albums_url which links to filtered album list.
    """
    uuid = serializers.ReadOnlyField()
    url = UUIDHyperlinkedIdentityField(view_name="artist-detail")
    albums_url = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = ("uuid", "url", "name", "albums_url")
        read_only_fields = ["user"]

    def get_albums_url(self, artist):
        """
        Generate URL to fetch albums for this artist.
        """
        logger.info("Generating albums_url for artist")
        path = drf_reverse("album-list", request=self.context["request"])
        return furl(path).set({"artist_uuid": artist.uuid}).url
