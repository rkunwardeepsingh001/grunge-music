from django.apps import AppConfig


class GrungeAppConfig(AppConfig):
    """Configuration for the ``grunge_app`` application."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "grunge_app"
    verbose_name = "Grunge music catalogue"
