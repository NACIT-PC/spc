# Render default-path shim: manual Docker services look for ./Dockerfile.
# Blueprint deploys keep using backend/Dockerfile (see render.yaml).
# ponytail: same steps as backend/Dockerfile — change both together.
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/pyproject.toml backend/README.md ./
RUN pip install --no-cache-dir -e .

COPY backend/ ./

RUN python manage.py collectstatic --noinput

EXPOSE 8000

# ponytail: migrate + reseed demo data at boot (sqlite is ephemeral on free tier); Postgres persists
CMD ["sh", "-c", "python manage.py migrate && (python manage.py loaddata demo_providers || true) && exec gunicorn catalogue.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
