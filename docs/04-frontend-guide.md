# 04: Frontend guide

Three pages, four scripts, no build step. `api.js` loads first everywhere
(`defer` order) and provides `API_URL`, `DEMO`, token helpers, and `apiFetch`.

## Pages

| Page | For | Notes |
| --- | --- | --- |
| `index.html` (+`app.js`) | Everyone | Search, category chips, city filter, cards, details dialog, submit-listing dialog, compact sign-in row (Admin link appears for staff) |
| `login.html` (+`auth.js`) | Signing in | Login + create-account card, Enter submits, redirects to catalogue; bounces already-signed-in users away |
| `admin.html` (+`admin.js`) | Staff | Review queue: counts, full provider details, Verify / Delete / Add provider; guests and non-staff get a plain explanation, not the data |

## `api.js` contract (for anyone touching the scripts)

- `API_URL`: `?api=` wins → `localhost`/`127.0.0.1`/`file://` get the local API → anything else uses the Render placeholder in the file.
- `DEMO` (`?demo`): skip the network entirely, use built-in sample rows.
- Tokens live in `localStorage` (`spc_tokens`: username/access/refresh).
- `apiFetch(path, options)`: attaches `Bearer`, refreshes once on 401 and
  retries, then clears the session and calls `syncAuthUI()` **only if the page
  defines it**: shared code never crashes a page without that function.

## Flows

- **Submit a listing** (`app.js`): category dropdown is built from the loaded
  rows (`categoryIdByName`: name → UUID); 401 shows "sign in first"; success
  reloads the list. Disabled in `?demo`.
- **Admin verify/delete/add** (`admin.js`): staff check via `/auth/me/` before
  any data renders; verify is one POST; delete confirms via native `confirm()`.
- **Phone display**: raw digits go over the wire; `toInternational` normalises
  `0…`/9-digit/`00…` forms to `265…` for `wa.me` and `tel:+` links.

## Styling

One `styles.css`, CSS variables in `:root` (`--primary`, `--whatsapp`,
`--radius`…). Reuse `.btn` (+`--brand/--quiet/--whatsapp/--phone`), `.card`,
`dialog` + `.details`, `.form-grid` for forms. Mobile-first breakpoints at
640px/960px; `prefers-reduced-motion` disables animation.
