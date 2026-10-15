# Service Provider Catalogue (SPC)

Group 2, NACIT Programming Club — a searchable catalogue helping event organisers
in Malawi discover service providers (decorators, caterers, MCs, photographers…).

## Run it in 60 seconds (Docker only)

```bash
docker compose up --build
```

- App: **http://localhost:8080** (all ports localhost-only)
- API: http://localhost:8000/api (health: `/api/health/`)
- Sign in: create an account on the login page; staff review queue at **Admin**
  (staff account: `admin` / `admin12345` — change `DJANGO_ADMIN_PASSWORD` anywhere real)

Stop: `docker compose down`. Full reset (wipes the dev database): `docker compose down -v`.

## Run it without Docker

Backend needs Python 3.13+:

```bash
cd backend
python -m venv .venv && .venv/Scripts/pip install -e .   # .venv/bin/pip on macOS/Linux
.venv/Scripts/python manage.py migrate
.venv/Scripts/python manage.py loaddata demo_providers
.venv/Scripts/python manage.py runserver
```

Then open `frontend/index.html` (`?demo` works with no backend at all).

## Layout

| Path | What |
| --- | --- |
| `frontend/` | Static catalogue: `index.html`, `login.html`, `admin.html`, vanilla JS, no build step |
| `backend/` | Django + DRF API (`catalogue/`, `providers/`), tests, demo fixture — see `backend/README.md` |
| `docker-compose.yml` | Local stack: Postgres + API + nginx frontend |
| `backend/Dockerfile` | Production image (gunicorn) used by `render.yaml` on Render |
| `render.yaml` | Render Blueprint for the hosted API |
| `.github/workflows/ci.yml` | CI: backend tests, frontend syntax, Docker build + boot test |

## Useful commands

```bash
docker compose logs -f api        # follow API logs
docker compose up --build api     # rebuild after backend changes
.venv/Scripts/python manage.py test   # backend suite (from backend/)
postman collection run <file> --no-report-events  # API E2E (see backend/README.md)
```

Sample data is fictional. Status honesty applies: requirements are provisional until
stakeholder interviews happen — see the docs bundle for the full picture.

## Docs

`docs/` — 01 overview · 02 architecture · 03 API reference · 04 frontend guide ·
05 workflows · 06 operations (env vars, CI, deploy, troubleshooting).
