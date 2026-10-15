# 05: Workflows

## Browse → contact

```mermaid
sequenceDiagram
  participant U as Organiser
  participant F as Frontend
  participant A as API
  participant D as DB
  U->>F: Open page, type search / pick filters
  F->>A: GET /api/providers/ (follow next links)
  A->>D: Filtered query
  D-->>A: Rows
  A-->>F: {count, results[]}
  F-->>U: Cards (+ loading / empty / error states)
  U->>F: WhatsApp button
  F-->>U: wa.me link with normalised number
```

Filtering after page 1 is client-side over the full list, which is why the
frontend follows every `next` link before rendering.

## Submit a listing

```mermaid
sequenceDiagram
  participant U as Signed-in user
  participant F as Frontend
  participant A as API
  U->>F: Fill listing dialog, submit
  F->>A: POST /providers/ (Bearer)
  A-->>F: 401 → show "sign in first"
  A-->>F: 201 (is_verified=false, forced server-side)
  F->>F: Reload list, confirm "live as unverified"
```

`is_verified:true` in a PATCH body is accepted by the parser and ignored by
the serializer, which is covered by test.

## Staff verify

```mermaid
sequenceDiagram
  participant S as Staff
  participant F as admin.html
  participant A as API
  S->>F: Open Admin
  F->>A: GET /auth/me/
  A-->>F: {is_staff: true} (else: staff-only notice, no data)
  F->>A: GET /providers/ (all pages)
  S->>F: Verify / Delete / Add provider
  F->>A: POST verify/ · DELETE · POST /providers/
  F->>F: Reload queue + counts
```

Django `/admin/` (same staff account) remains the fallback for direct edits.

## Cold boot / deploy

```mermaid
flowchart LR
  boot[Container boot] --> mig[migrate]
  mig --> seed[loaddata demo_providers<br/>fixed UUIDs = idempotent]
  seed --> adminSeed[0004 creates admin<br/>if no superuser yet]
  adminSeed --> serve[exec gunicorn on $PORT]
  serve --> health[Render health check<br/>GET /api/health/]
```

Compose dev boot is the same shape with `runserver` instead of gunicorn.
