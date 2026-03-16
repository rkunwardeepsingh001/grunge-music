"""Admin registration for the grunge app.

The original example contained a number of custom helper functions and
inline classes; we keep the admin deliberately simple here so that new
contributors aren't overwhelmed.  Basic list displays and searchable fields
are provided.
"""

from django.contrib import admin

from .models import Album, Artist, Playlist, PlaylistTrack, Track


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name", "uuid")


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ("name", "artist", "year")
    search_fields = ("name", "uuid", "artist__name")
    list_select_related = ("artist",)


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ("name", "album", "artist_name")
    search_fields = ("name", "uuid", "album__name")
    list_select_related = ("album", "album__artist")

    def artist_name(self, obj):
        return obj.album.artist.name

    artist_name.short_description = "Artist"


class PlaylistTrackInline(admin.TabularInline):
    """Inline used by ``PlaylistAdmin`` to edit tracks in a playlist.

    Displays a small table allowing the user to choose a track and assign an
    ordering number.  The ordering is used to render the playlist in the
    correct sequence.
    """

    model = PlaylistTrack
    extra = 1
    ordering = ("order",)
    fields = ("track", "order")


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    """Admin interface for managing playlists.

    Playlists are simple objects with a name and an ordered set of tracks.
    ``PlaylistTrackInline`` is used to maintain the many-to-many ordering.
    """

    list_display = ("name",)
    search_fields = ("name",)
    inlines = [PlaylistTrackInline]
