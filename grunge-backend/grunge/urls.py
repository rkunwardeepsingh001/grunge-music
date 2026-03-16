"""Root URL configuration for the grunge project.

Routes are split between the admin interface and the API.  The API
itself is versioned and registered through a DRF router.
"""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic.base import RedirectView
from rest_framework.routers import DefaultRouter

from grunge_app.views import AlbumViewSet, ArtistViewSet, PlaylistViewSet, TrackViewSet

from django.conf.urls.static import static

from grunge_app.views import SignupView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = []

# redirect root to admin (useful both in development and production)
urlpatterns += [
    re_path(r"^$", RedirectView.as_view(url="/admin/", permanent=False)),
]

if settings.DEBUG:
    # when debugging we might want an explicit permanent redirect
    urlpatterns += [
        re_path(r"^$", RedirectView.as_view(url="/admin/", permanent=True)),
    ]

if settings.DJANGO_ADMIN_ENABLED if hasattr(settings, "DJANGO_ADMIN_ENABLED") else True:
    urlpatterns += [path("admin/", admin.site.urls)]

if settings.DJANGO_API_ENABLED if hasattr(settings, "DJANGO_API_ENABLED") else True:
    router = DefaultRouter(trailing_slash=False)
    router.register("artists", ArtistViewSet)
    router.register("albums", AlbumViewSet)
    router.register("tracks", TrackViewSet)
    router.register("playlists", PlaylistViewSet)

    urlpatterns += [path("api/<version>/", include(router.urls))]


urlpatterns += [
    path("signup/", SignupView.as_view()),

    path("login/", TokenObtainPairView.as_view()),
    path("refresh/", TokenRefreshView.as_view()),
]



if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
