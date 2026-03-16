.PHONY: check lint format test testfast ready dumpinitialdata

check:
	python3 manage.py check

format:
	isort --atomic --skip-glob="venv/*" grunge_app
	black --exclude="venv/" grunge_app

lint:
	flake8 grunge_app
	black --check --exclude="venv/" grunge_app

test:
	python3 manage.py test

testfast:
	python3 manage.py test --failfast

ready: check lint testfast

# collect static files for deployment
collectstatic:
	python3 manage.py collectstatic --noinput

dumpinitialdata:
	python manage.py dumpdata --natural-foreign --natural-primary \
		--exclude=admin.logentry --all --indent=2 > grunge_app/fixtures/initial_data.json
