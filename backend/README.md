# SPC Backend (Django + DRF)

## Setup
```bash
python -m venv .venv
.venv/Scripts/pip install -e .   # Windows; use .venv/bin/pip on macOS/Linux
python manage.py migrate
python manage.py loaddata demo_providers
python manage.py runserver
```
API: `http://127.0.0.1:8000/api/` — health at `/api/health/`.
Frontend: open `frontend/index.html` with `?demo` for fixture-free preview, or
`?api=http://127.0.0.1:8000/api` to point it at any backend.

## Env vars (use a local `.env`; never commit it)
| Var | Default | Purpose |
| --- | ------- | ------- |
| `DJANGO_API_KEY` | `django-insecure-dev-only` | Secret key + JWT signing. Set a 32+ char secret anywhere real. |
| `DJANGO_DEBUG` | `True` | Set `False` in production. |
| `DATABASE_URL` | local `db.sqlite3` | Postgres URL when ready (e.g. Neon free tier). |
| `CORS_ALLOWED_ORIGINS` | none (open only when `DEBUG=True`) | Comma-separated frontend origins, e.g. `https://your-app.vercel.app`. |

## Auth
`POST /api/auth/register/` → `POST /api/auth/token/` (access + refresh) →
`Authorization: Bearer <access>`. Reads are public; creating/editing providers
needs login. New listings go live as `is_verified=false`; only staff can verify.

## Pages
- `frontend/index.html` — public catalogue + submit-a-listing dialog.
- `frontend/login.html` — sign in / create account (passwords need 8+ characters).
- `frontend/admin.html` — staff-only review queue (verify / delete listings).
- Staff access: `.venv/Scripts/python manage.py createsuperuser`, then sign in
  with that account — an **Admin** link appears on the catalogue, and Django's
  own `/admin/` works too.

## Deploy
- Backend: Render Blueprint via `render.yaml` (Docker). Set `DJANGO_API_KEY`,
  `DJANGO_DEBUG=False`, `CORS_ALLOWED_ORIGINS`, and `DATABASE_URL` if using Postgres.
  Free tier uses ephemeral SQLite reseeded from `demo_providers` at boot.
- Frontend: any static host (e.g. Vercel). Point it at the live API with
  `?api=https://<your-api>.onrender.com/api` or edit `API_URL` in `app.js`.

## Docker operations (compose stack at repo root)

```bash
docker compose up --build       # full app: db + api + frontend
docker compose up --build api   # rebuild after backend changes only
docker compose logs -f api      # follow API logs
docker compose down             # stop, keep dev database
docker compose down -v          # stop + wipe dev database (reseeds on next up)
```

Single-image runs (no compose, SQLite fallback inside the container):

```bash
docker build -t spc-api ./backend
docker run -p 127.0.0.1:8000:8000 -e DJANGO_API_KEY=<32+chars> -e DJANGO_DEBUG=False spc-api
```

## API E2E (Postman CLI)

```bash
postman collection run path/to/collection.json --no-report-events
```

Covers health, seed counts, filters, register/login guards, authed create,
self-verify refusal, staff verify, refresh, delete. Point it at another host by
editing the collection's `baseUrl` variable.
