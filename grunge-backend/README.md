# Grunge Rock Development Application

A minimal Django project showcasing a music catalogue with artists,
albums, tracks, and playlists. It includes a browsable admin interface
and a versioned REST API.

## Quickstart

```bash
python -m venv --upgrade-deps venv # Use to create a virtual environment
venv\Scripts\activate      # Windows, use `venv/Scripts/activate` or Linus Source  env/bin/activate

python -m pip install -r requirements.txt # used to install the  all requirements 
python manage.py migrate     # apply the migrations on DB
python manage.py loaddata initial_data 
python manage.py createsuperuser   # optional "used to create superuser"
python manage.py runserver   # run the backend server
``` 

Visit <http://localhost:8000/admin/> to log into the admin, or
<http://localhost:8000/api/v1/> for the API.

## Docker

A containerised development environment is provided:

```bash
# build the image (runs collectstatic during build)
docker compose build

# start the application; migrations run automatically
docker compose up
```

The web service will be reachable at the same URLs as above. You can
enter the container with `docker compose exec web sh` if you need to
run additional management commands.

## Testing & development
## This project uses a Makefile to simplify common development commands.

# Run all tests:

- make test

# Run tests and stop on first failure:

- make testfast

# Run linters and tests together:

- make ready

# Format code:

- make format

## Notes

- Playlists are now supported via the API and admin.
- Models use UUIDs for public identifiers.
- The project follows standard Django conventions; look in
  `grunge_app` for models, views, serializers and tests.

For production deployment see the comments in `settings.py`.


## Notes

- Playlists are now supported via the API and admin.
- Models use UUIDs for public identifiers.
- The project follows standard Django conventions; look in
  `grunge_app` for models, views, serializers and tests.

For production deployment see the comments in `settings.py`.


