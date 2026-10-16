# 01: Project overview

**Service Provider Catalogue (SPC)** · Group 2, NACIT Programming Club

A small web app helping event organisers in Malawi discover service providers
(decorators, caterers, MCs, photographers, sound, venues). Browse, filter by
category/city/text, contact via WhatsApp or phone. Signed-in users can submit
listings (live as *unverified*); staff verify them in a review queue.

Working title: Service Provider Catalogue. Short name: **SPC**. A student club
demo: the name and pages must never imply official endorsement by any business,
directory, or government body.

## Problem statement

Event organisers find decorators, caterers, MCs, and similar providers through
word of mouth, Facebook groups, and WhatsApp statuses. That information is
scattered, hard to compare, and impossible to search in one place. SPC gathers
sample listings into a single searchable catalogue with direct contact links.

The current listings are provisional sample data, not verified supply. The
catalogue is useful the moment its data is real; until then it demonstrates the
journey, not the directory.

## Target users

- **Event organiser**: planning a wedding, funeral, conference, or party, needs
  a suitable provider in a particular city, and wants to compare options before
  making contact.
- **Small service provider**: wants to be discoverable and receive enquiries
  without depending on social-media reach or word of mouth.

## Example user journey

> "I need a decorator in Blantyre for a wedding. What are my options?"

The catalogue should: show providers matching decor + Blantyre; display what
each one offers with an indicative price range; and open a working WhatsApp or
phone contact. It must not claim any listing is verified unless staff actually
checked it, and must not present sample data as real businesses.

## MVP scope

| Included | Excluded until validated |
| --- | --- |
| Browse, search, category/city filters | Customer accounts beyond basic login |
| Provider details + WhatsApp/phone contact | Payments, bookings, escrow |
| Signed-in submissions (live as unverified) | Ratings, reviews, public comments |
| Staff verify/delete + Django admin | Provider self-service dashboards |
| Health endpoint, tests, Docker, CI | Analytics, commercial verification workflow |

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

## Demo-ready checklist

The demo is ready when every line is true and evidenced:

- The catalogue loads from the API (or `?demo`) with no console errors
- Each filter and search returns exactly the matching sample records
- At least one contact action opens the correct WhatsApp/phone destination
- A submission goes live as unverified; a staff verify flips the badge
- Tests are recorded as passed from an actual run, never assumed
- Backup screenshots or a recording exist in case free-tier hosting sleeps

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Scope grows past the MVP | Extra features wait in the post-MVP list; the demo path freezes first |
| Free-tier hosting sleeps or cold-starts | Warm `/api/health/` before presenting; keep offline backup |
| CORS or host config blocks the API | Test the deployed frontend against the deployed API; list exact origins |
| SQLite data lost on redeploy | Attach Postgres for anything that must persist |
| Sample data mistaken for real listings | Label demo data; never show the verified badge without a real check |
| Beginner blockers stall integration | Small tasks, pairing, early help; the smallest end-to-end path first |

## Open questions

Resolve these with evidence, not guesses:

- What do organisers actually need on a card before making contact?
- Which details are providers comfortable publishing?
- Postgres now, or is ephemeral SQLite enough for the next demo?
- What counts as "verified": a phone call, a visit, a document?
- Who owns moderation once listings are real?

## Disclaimer

SPC is a demonstration information tool built by students. Its listings are
fictional samples, not a verified directory; its explanations of the system
are not guarantees about any real business. Contact details shown anywhere
must be permissioned or placeholders. Verify providers and use official
channels before relying on anything here for a real event.

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
