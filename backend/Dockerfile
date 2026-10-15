FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml README.md ./
RUN pip install --no-cache-dir -e .

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

# ponytail: migrate + reseed demo data at boot (sqlite is ephemeral on free tier); Postgres persists
CMD ["sh", "-c", "python manage.py migrate && (python manage.py loaddata demo_providers || true) && exec gunicorn catalogue.wsgi:application --bind localhost:${PORT:-8000}"]
