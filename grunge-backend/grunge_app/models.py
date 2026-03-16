"""Data models for the grunge catalog application.

This module exposes three top‑level models (Artist, Album and Track), all of
which inherit from ``UUIDModel``.  The UUID base class provides a natural
primary key for use in the public API and for easier fixture handling.
"""

import logging
from uuid import uuid4

from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext as _

logger = logging.getLogger(__name__)


class UUIDManager(models.Manager):
    """Manager that looks up objects by their UUID natural key."""

    def get_by_natural_key(self, uuid):
        return self.get(uuid=uuid)


class UUIDModel(models.Model):
    """Abstract base model holding a unique ``uuid`` field."""

    uuid = models.UUIDField(verbose_name="UUID", default=uuid4, unique=True)
    objects = UUIDManager()

    class Meta:
        abstract = True

    def natural_key(self):
        "Return the tuple used for natural key serialization."
        return (self.uuid,)


class Artist(UUIDModel):
    """A musical artist (e.g. "Pearl Jam")."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_artist")

    name = models.CharField(max_length=100, help_text=_("The artist name"))

    class Meta:
        ordering = ("name",)
        indexes = (models.Index(fields=("name",)),)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        logger.info(f"Saving Artist: {self.name}")
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("admin:grunge_app_artist_change", kwargs={"object_id": self.pk})


class Album(UUIDModel):
    """A record released by an artist."""

    name = models.CharField(max_length=100, help_text=_("The album name"))
    year = models.PositiveSmallIntegerField(
        help_text=_("The year the album was released"),
        validators=[MinValueValidator(1900), MaxValueValidator(9999)],
    )
    artist = models.ForeignKey(
        Artist,
        help_text=_("The artist that produced the album"),
        related_name="albums",
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ("artist", "year", "name")
        indexes = (models.Index(fields=("artist", "year", "name")),)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("admin:grunge_app_album_change", kwargs={"object_id": self.pk})


class Track(UUIDModel):
    """A single track that belongs to an album."""

    name = models.CharField(max_length=100, help_text=_("The track name"))
    album = models.ForeignKey(
        Album,
        help_text=_("The album this track appears on"),
        related_name="tracks",
        on_delete=models.CASCADE,
    )
    number = models.PositiveSmallIntegerField(
        help_text=_("The track number on the album")
    )

    class Meta:
        ordering = ("number", "name")
        indexes = (models.Index(fields=("number", "name")),)
        constraints = (
            models.UniqueConstraint(
                fields=("album", "number"), name="unique_album_number"
            ),
        )

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        logger.info(f"Saving Track: {self.name}")
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("admin:grunge_app_track_change", kwargs={"object_id": self.pk})


class Playlist(UUIDModel):
    """A curated list of tracks."""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_playlists"
    )
    name = models.CharField(max_length=100, help_text="The playlist name")
    tracks = models.ManyToManyField(
        Track,
        through="PlaylistTrack",
        related_name="playlists",
        blank=True,
        help_text="Tracks that appear in this playlist (in order).",
    )

    class Meta:
        ordering = ("name",)
        indexes = (models.Index(fields=("name",)),)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        logger.info(f"Saving Playlist: {self.name}")
        super().save(*args, **kwargs)


class PlaylistTrack(models.Model):
    """Intermediate model for the ordered many-to-many relationship.

    ``order`` determines the position of ``track`` inside ``playlist``.
    ``unique_together`` ensures the same track cannot appear twice, and
    a constraint forces every position to be unique within the playlist.
    """

    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name="playlist_tracks",
    )
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    order = models.PositiveSmallIntegerField(
        help_text="1-based position",
        validators=[MinValueValidator(1)],
    )

    class Meta:
        ordering = ("order",)
        unique_together = ("playlist", "track")
        constraints = [
            models.UniqueConstraint(
                fields=("playlist", "order"),
                name="unique_playlist_order",
            ),
        ]

    def __str__(self):
        return f"{self.order}. {self.track.name}"

    def save(self, *args, **kwargs):
        logger.info(
            f"Adding track {self.track} to playlist {self.playlist} at {self.order}"
        )
        super().save(*args, **kwargs)
