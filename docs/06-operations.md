# 06: Operations

## Local

```bash
# Docker (recommended): http://localhost:8080
docker compose up --build
docker compose logs -f api
docker compose down        # keep dev DB
docker compose down -v     # wipe dev DB (reseeds on next up)

# Without Docker (Python 3.13+)
cd backend
python -m venv .venv && .venv/Scripts/pip install -e .  # .venv/bin/pip on macOS/Linux
.venv/Scripts/python manage.py migrate
.venv/Scripts/python manage.py loaddata demo_providers
.venv/Scripts/python manage.py runserver   # then open frontend/index.html
```

## Environment variables

| Var | Default | Set it when |
| --- | --- | --- |
| `DJANGO_API_KEY` | `django-insecure-dev-only` | Always in production: 32+ random chars; also signs JWTs |
| `DJANGO_DEBUG` | `True` | `False` in production (also gates demo-open CORS) |
| `DATABASE_URL` | local `db.sqlite3` | Postgres (e.g. Neon free tier) for persistence |
| `CORS_ALLOWED_ORIGINS` | `[]` | Production frontend origin(s), comma-separated |
| `DJANGO_ADMIN_PASSWORD` | `admin12345` | Real staff password on any hosted instance |
| `PORT` | `8000` | Injected by Render; leave alone |

`.env` files are gitignored and blocked by repo policy, so copy the table above,
don't commit one.

## CI (`.github/workflows/ci.yml`)

Runs on every push + PR: **backend** (`manage.py check` + 7 tests on Python
3.13) · **frontend** (`node --check` on all four scripts) · **docker**
(image build, `compose config`, boot container and assert health + seed counts
+ 401 guard). A commented `deploy` job fires a Render deploy hook on `main` —
enable with a `RENDER_DEPLOY_HOOK` secret.

## Deploy

- **API → Render**: Blueprint `render.yaml` (Docker). Fill `DJANGO_API_KEY`,
  `DJANGO_ADMIN_PASSWORD`, `CORS_ALLOWED_ORIGINS`; add `DATABASE_URL` for
  Postgres, else ephemeral SQLite reseeds each deploy.
- **Frontend → Vercel**: import repo, preset Other, root directory `frontend/`.
  Replace the `YOUR-APP-NAME` placeholder in `frontend/api.js` with the live
  API URL (`?api=` override works meanwhile). Preview deployments aren't in
  CORS, so test them with `?demo`.

## Testing the API (Postman CLI)

```bash
postman collection run <collection>.json --no-report-events
```

Covers health, seed counts, filters, register/login guards, authed create,
self-verify refusal, staff verify, refresh, delete. Retarget via the
collection's `baseUrl` variable.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Port 8000/8080 in use | Stray `runserver`: `netstat -ano \| findstr :8000`, `taskkill //F //PID <n>` |
| Cards don't load | DevTools Network: API URL, status code; backend logs (`compose logs api`) |
| CORS error on Vercel | `CORS_ALLOWED_ORIGINS` must list the exact Vercel URL; `DEBUG` must be `False` to need it |
| Login 400 on register | Password needs 8+ chars; duplicate usernames rejected |
| Data gone after Render redeploy | Expected on free SQLite: attach Postgres |
| Slow first load on Render | Free tier sleeps; warm `/api/health/` before demos, keep offline screenshots |
