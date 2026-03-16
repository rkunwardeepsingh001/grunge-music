import logging

from django.contrib.auth.models import User
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Album, Artist, Playlist, Track
from .serializers import (
    AlbumSerializer,
    ArtistSerializer,
    PlaylistSerializer,
    SignupSerializer,
    TrackSerializer,
)

logger = logging.getLogger(__name__)


class SignupView(generics.CreateAPIView):
    """
    API view for user signup.

    Allows unauthenticated users to create a new account.
    """
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]


class BaseAPIViewSet(viewsets.ModelViewSet):
    """Common configuration shared by all viewsets.
    Lookups use the uuid field rather than numeric PK.
    """

    lookup_field = "uuid"
    lookup_url_kwarg = "uuid"
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return queryset filtered by user unless admin.
        """
        qs = super().get_queryset()

        # admin can see all data
        if self.request.user.is_staff:
            return qs

        # filter only user data if model has user field
        if hasattr(qs.model, "user"):
            return qs.filter(user=self.request.user)

        return qs

    def perform_create(self, serializer):
        """
        Attach logged-in user when model has user field.
        """
        model = serializer.Meta.model

        if hasattr(model, "user"):
            serializer.save(user=self.request.user)
        else:
            serializer.save()


class ArtistViewSet(BaseAPIViewSet):
    """
    ViewSet for Artist model.

    Supports filtering by name.
    """
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    filterset_fields = ("name",)


class AlbumViewSet(BaseAPIViewSet):
    """
    ViewSet for Album model.

    Supports filtering by:
    - artist uuid
    - album name

    Optimized with select_related and prefetch_related.
    """
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    filterset_fields = ("artist__uuid", "name")

    def get_queryset(self):
        logger.info("Album queryset requested")
        qs = super().get_queryset()
        qs = qs.select_related("artist").prefetch_related("tracks")
        logger.info("Album queryset optimized with select_related + prefetch_related")
        return qs


class TrackViewSet(BaseAPIViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    filterset_fields = ("album__uuid", "name")

    def get_queryset(self):
        """
        Optimize album queryset.
        """
        logger.info("Track querryset requested ")
        qs = super().get_queryset()
        qs = qs.select_related("album", "album__artist")
        logger.info("Track queryset optimized with select_related")
        return qs


class PlaylistViewSet(BaseAPIViewSet):
    """
    ViewSet for Track model.

    Supports filtering by:
    - album uuid
    - track name

    Optimized with select_related.
    """

    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    filterset_fields = ("name",)

    def get_queryset(self):
        """
        Optimize playlist queryset.
        """
        logger.info("Playlist queryset requested")
        qs = super().get_queryset()
        qs = qs.prefetch_related("playlist_tracks__track")
        logger.info("Playlist queryset optimized with prefetch_related")
        return qs
