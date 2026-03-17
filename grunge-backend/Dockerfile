# # Dockerfile for the Grunge Rock Django application
# #
# # Build an image suitable for development or simple deployment.  The
# # container runs using the same Python version the project supports and
# # installs packages from requirements.txt.  All application source is
# # copied into /app so commands such as migrations or ``runserver`` can be
# # executed within the container.

# FROM python:3.10-slim

# # prevent .pyc files and ensure stdout/err are unbuffered
# ENV PYTHONDONTWRITEBYTECODE=1 \
#   PYTHONUNBUFFERED=1

# WORKDIR /app

# # install dependencies
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt
# RUN pip install --upgrade pip setuptools wheel

# # copy project code
# COPY . .

# # ensure our entrypoint can execute inside the container
# # RUN chmod +x docker-entrypoint.sh      ##

# # collect static assets
# RUN python manage.py collectstatic --noinput

# # entrypoint handles migrations before running the command
# # ENTRYPOINT ["/app/docker-entrypoint.sh"]     ##

# # default to the development server; override in production
# # CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# # CMD gunicorn config.wsgi:application --bind 0.0.0.0:8000   # added for CI
# CMD ["gunicorn", "grunge.wsgi:application", "--bind", "0.0.0.0:8000"]








# FROM python:3.10

# WORKDIR /app

# COPY requirements.txt .

# RUN pip install --upgrade pip
# RUN pip install -r requirements.txt

# # FIX for pkg_resources
# RUN pip install setuptools

# COPY . .

# RUN python manage.py collectstatic --noinput
# CMD python manage.py migrate && \
#     python manage.py collectstatic --noinput && \
#     gunicorn grunge.wsgi:application --bind 0.0.0.0:8000

# # CMD ["gunicorn", "grunge.wsgi:application", "--bind", "0.0.0.0:8000"]








FROM python:3.10

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

RUN mkdir -p /app/static

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD sh -c "python manage.py migrate && gunicorn grunge.wsgi:application --bind 0.0.0.0:8000"