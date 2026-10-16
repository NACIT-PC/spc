# 03: API reference

Base URL: `http://127.0.0.1:8000/api` locally (`?api=` override in the frontend).
List responses are paginated: `{count, next, previous, results}` (20/page).
Auth: `Authorization: Bearer <access>` (SimpleJWT; refresh via `/auth/token/refresh/`).

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health/` | open | `{"API Status": "ok", …}`: deploy health check |
| GET | `/api/categories/` | open | All categories (paginated) |
| GET | `/api/providers/` | open | Providers; filters `?category=Name` (exact, case-insensitive), `?city=…`, `?q=…` (name + description) |
| POST | `/api/providers/` | login | Create; needs `name, category_id, city, price_range, description, phone` |
| GET | `/api/providers/<uuid>/` | open | One provider (404 if missing) |
| PATCH/PUT | `/api/providers/<uuid>/` | login | Edit; `is_verified` is silently ignored |
| DELETE | `/api/providers/<uuid>/` | login | Delete → 204 |
| POST | `/api/providers/<uuid>/verify/` | staff | Set `is_verified=true` |
| POST | `/api/auth/register/` | open, 10/min | `username` + password (8+ chars) → 201 |
| POST | `/api/auth/token/` | open, 10/min | `{username, password}` → `{access, refresh}` |
| POST | `/api/auth/token/refresh/` | open, 10/min | `{refresh}` → new `{access}` |
| GET | `/api/auth/me/` | login | `{username, is_staff}` |

Guards at a glance: anon write → 401 · non-staff verify → 403 · bad login → 401 ·
duplicate username → 400.

## Examples

```bash
# List + filter
curl 'http://127.0.0.1:8000/api/providers/?city=Blantyre&q=decor'

# Register, log in, submit (phone/WhatsApp as strings, category by ID)
curl -X POST localhost:8000/api/auth/register/ -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo-pass-12345"}'
TOKEN=$(curl -s -X POST localhost:8000/api/auth/token/ -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo-pass-12345"}' | python -c "import sys,json; print(json.load(sys.stdin)['access'])")
CID=$(curl -s localhost:8000/api/categories/ | python -c "import sys,json; print(json.load(sys.stdin)['results'][0]['id'])")
curl -X POST localhost:8000/api/providers/ -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d "{
    \"name\":\"Example Decor\", \"category_id\":\"$CID\", \"city\":\"Blantyre\",
    \"description\":\"Wedding decor\", \"price_range\":\"mid\",
    \"phone\":\"265991234567\", \"whatsapp\":\"265991234567\"}"
```

## Provider object

```json
{
  "id": "uuid",
  "name": "Example Decor",
  "category": { "id": "uuid", "name": "Decor" },
  "city": "Blantyre",
  "description": "…",
  "price_range": "Indicative range: mid",
  "phone": "265991234567",
  "whatsapp": "265991234567",
  "is_verified": false,
  "created_at": "2026-10-14T12:00:00Z"
}
```

Write with `category_id` (UUID); read back nested `category`. `id`,
`is_verified`, `created_at` are never user-settable.
