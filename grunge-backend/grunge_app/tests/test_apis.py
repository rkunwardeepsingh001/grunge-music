from furl import furl
from rest_framework import status
from rest_framework.reverse import reverse as drf_reverse

from . import BaseAPITestCase

# ARTIST TESTS


class ArtistTests(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.artist_name = self.artist1.name
        self.artist_uuid = self.artist1.uuid

    def test_list_artists(self):
        url = drf_reverse("artist-list", kwargs={"version": self.version})
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["count"], 2)

    def test_search_artists(self):
        url = drf_reverse("artist-list", kwargs={"version": self.version})
        url = furl(url).set({"name": self.artist_name}).url
        r = self.client.get(url)
        self.assertEqual(r.data["count"], 1)

    def test_get_artist(self):
        url = drf_reverse(
            "artist-detail",
            kwargs={"version": self.version, "uuid": self.artist_uuid},
        )
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)


# ALBUM TESTS


class AlbumTests(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.album_name = self.album1.name
        self.album_uuid = self.album1.uuid
        self.artist_uuid = self.artist1.uuid

    def test_list_albums(self):
        url = drf_reverse("album-list", kwargs={"version": self.version})
        r = self.client.get(url)
        self.assertEqual(r.data["count"], 2)

    def test_search_albums(self):
        url = drf_reverse("album-list", kwargs={"version": self.version})
        url = furl(url).set({"name": self.album_name}).url
        r = self.client.get(url)
        self.assertEqual(r.data["count"], 1)

    def test_get_album(self):
        url = drf_reverse(
            "album-detail",
            kwargs={"version": self.version, "uuid": self.album_uuid},
        )
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)


# TRACK TESTS


class TrackTests(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.track_name = self.track1.name
        self.track_uuid = self.track1.uuid
        self.album_uuid = self.album1.uuid

    def test_list_tracks(self):
        url = drf_reverse("track-list", kwargs={"version": self.version})
        r = self.client.get(url)
        self.assertEqual(r.data["count"], 2)

    def test_search_tracks(self):
        url = drf_reverse("track-list", kwargs={"version": self.version})
        url = furl(url).set({"name": self.track_name}).url
        r = self.client.get(url)
        self.assertEqual(r.data["count"], 1)

    def test_get_track(self):
        url = drf_reverse(
            "track-detail",
            kwargs={"version": self.version, "uuid": self.track_uuid},
        )
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)


# PLAYLIST TESTS


class PlaylistTests(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.playlist_name = self.playlist1.name
        self.playlist_uuid = self.playlist1.uuid
        self.track_uuid = self.track1.uuid

    def test_list_playlists(self):
        url = drf_reverse("playlist-list", kwargs={"version": self.version})
        r = self.client.get(url)
        self.assertEqual(r.data["count"], 1)

    def test_search_playlists(self):
        url = drf_reverse("playlist-list", kwargs={"version": self.version})
        url = furl(url).set({"name": self.playlist_name}).url
        r = self.client.get(url)
        self.assertEqual(r.data["count"], 1)

    def test_get_playlist(self):
        url = drf_reverse(
            "playlist-detail",
            kwargs={"version": self.version, "uuid": self.playlist_uuid},
        )
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_create_playlist(self):
        url = drf_reverse("playlist-list", kwargs={"version": self.version})
        payload = {"name": "New playlist", "tracks": [str(self.track2.uuid)]}
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_update_playlist(self):
        url = drf_reverse(
            "playlist-detail",
            kwargs={"version": self.version, "uuid": self.playlist_uuid},
        )
        payload = {"name": "Updated", "tracks": [str(self.track2.uuid)]}
        r = self.client.patch(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_delete_playlist(self):
        url = drf_reverse(
            "playlist-detail",
            kwargs={"version": self.version, "uuid": self.playlist_uuid},
        )
        r = self.client.delete(url)
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
