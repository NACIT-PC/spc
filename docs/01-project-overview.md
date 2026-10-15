# 01: Project overview

**Service Provider Catalogue (SPC)** · Group 2, NACIT Programming Club

A small web app helping event organisers in Malawi discover service providers
(decorators, caterers, MCs, photographers, sound, venues). Browse, filter by
category/city/text, contact via WhatsApp or phone. Signed-in users can submit
listings (live as *unverified*); staff verify them in a review queue.

## Status honesty (read first)

- Requirements are **provisional**: stakeholder interviews have not happened.
- This is a **demo-grade** build, not production: open registration, no email
  verification, demo secrets in repo defaults, SQLite default.
- Seed data is **fictional**. Never present listings as real or verified unless
  the team actually checked them.
- See `06-operations.md` before putting anything on the public internet.

## Technology stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | HTML + CSS + vanilla JS, no build step | Zero toolchain; every page is directly openable |
| Backend | Django 6.1 + DRF 3.18 | ORM, routing, serializers, admin in one box |
| Auth | SimpleJWT 5.5 (Bearer access + refresh) | No sessions to manage for the API |
| Database | SQLite default; Postgres via `DATABASE_URL` | Zero-config demo; real persistence when needed |
| Prod server | gunicorn + WhiteNoise | One container serves API + admin static |
| Local stack | `docker-compose.yml`: Postgres + API + nginx frontend | `docker compose up --build`, nothing else to install |
| Hosting | Vercel (frontend static) + Render (API Blueprint) | Free tiers; see `06-operations.md` |
| CI | GitHub Actions: backend tests, frontend syntax, Docker build + boot test | `.github/workflows/ci.yml` |

Python `>=3.13` (`backend/pyproject.toml` is the single source of deps).

## Features

- Public catalogue: list, search, category/city filters, provider details dialog
- Contact actions: WhatsApp (`wa.me`) and `tel:` links with Malawi number normalisation
- Accounts: register / login / refresh, tokens in `localStorage`, refresh-once on 401
- Submissions: any signed-in user can list a business (unverified until staff review)
- Staff review queue (`admin.html` + Django `/admin/`): verify / delete listings
- Paginated API (20/page); the frontend follows `next` links so filters see everything

## Project structure

```text
spc/
├── frontend/            # index.html (catalogue), login.html, admin.html
│                        # api.js (shared), app.js, auth.js, admin.js, styles.css
├── backend/
│   ├── catalogue/       # settings.py, urls.py, wsgi.py
│   ├── providers/       # models, serializers, views, urls, admin,
│   │                    # tests, fixtures/demo_providers.json, migrations/
│   ├── Dockerfile       # prod image (gunicorn, migrate+seed at boot)
│   └── README.md
├── docker-compose.yml   # db (Postgres) + api (dev server) + web (nginx :8080)
├── render.yaml          # Render Blueprint for the API
├── .github/workflows/ci.yml
└── docs/                # you are here
```

## Getting started

```bash
docker compose up --build   # app at http://localhost:8080
```

No-Docker path and every operation after that: `06-operations.md`.
API contract: `03-api-reference.md`. How the pieces fit: `02-architecture.md`.
