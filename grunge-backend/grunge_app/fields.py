"""Custom serializer fields used throughout the API."""

from rest_framework import serializers


class UUIDHyperlinkedIdentityField(serializers.HyperlinkedIdentityField):
    """HyperlinkedIdentityField that looks up by ``uuid`` instead of ``pk``.

    The ``source`` is set to ``"*"`` so that the field can access the
    serializer object directly, which allows us to emit URLs for objects
    that aren't saved yet (e.g. when validating input).
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("source", "*")
        kwargs.setdefault("lookup_field", "uuid")
        kwargs.setdefault("lookup_url_kwarg", "uuid")
        super().__init__(*args, **kwargs)


class UUIDHyperlinkedRelatedField(serializers.HyperlinkedRelatedField):
    """Like ``UUIDHyperlinkedIdentityField`` but used for *related* objects."""

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("lookup_field", "uuid")
        kwargs.setdefault("lookup_url_kwarg", "uuid")
        super().__init__(*args, **kwargs)
