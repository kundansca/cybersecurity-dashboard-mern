# CISA KEV dashboard (MERN)

Small full-stack app for the CISA **Known Exploited Vulnerabilities** catalog: data lives in MongoDB, the API only reads from the database, and the React UI shows a dashboard plus a filterable CVE table.

**Dataset (download yourself — do not rely on the repo for the file):**  
https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json  

Save it anywhere you like. The import script below expects a path to that JSON (or drop it under `backend/data/` if you use the default path).

**What you need installed:** Node 18+, MongoDB running locally or on Atlas.

---

## 1. MongoDB

Point `MONGODB_URI` at your instance. Default database name is `kev_catalog` (override with `MONGODB_DB_NAME` if you want).

---

## 2. Backend

```bash
cd backend
cp .env.example .env
# On Windows: copy .env.example .env
npm install
```

**Import (wipes the `vulnerabilities` collection, then inserts one document per array entry):**

```bash
npm run ingest -- path/to/known_exploited_vulnerabilities.json
```

If the file is at `backend/data/known_exploited_vulnerabilities.json`, you can run:

```bash
npm run ingest
```

**Start the API:**

```bash
npm run dev
```

Server listens on `PORT` from `.env` (default 5000). Set `CORS_ORIGIN` to your frontend URL (e.g. `http://localhost:5173`).

---

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server proxies `/api` to the backend (see `frontend/vite.config.js`). For a production build against another host, set `VITE_API_BASE` (see `frontend/.env.example`).

**Screens**

- **Dashboard** — counts and charts (ransomware split, top vendors, new entries by month, CWE frequency) from `/api/stats/*`.
- **Vulnerabilities** — paginated table (CVE, vendor, product, title, dates, ransomware). Filters: text search, vendor, product, ransomware flag, date-added range. Row click opens extra fields in a drawer.

---

## 4. API (all under `/api`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness check |
| GET | `/api/vulnerabilities` | Paginated list. Query: `page`, `limit` (max 100), optional `vendor`, `product`, `ransomware`, `dateFrom`, `dateTo`, `search` |
| GET | `/api/vulnerabilities/:cveId` | Single CVE |
| GET | `/api/stats/summary` | Totals, ransomware breakdown, catalog version(s) in DB, min/max `dateAdded` |
| GET | `/api/stats/top-vendors` | Optional `limit` (capped) |
| GET | `/api/stats/cwe-distribution` | Optional `limit` |
| GET | `/api/stats/additions-by-month` | Optional `limit` |

List shape: `{ success, data, meta: { page, limit, total, totalPages } }`. Errors: `{ success: false, error: { message, ... } }`.

---

## 5. Design notes (for reviewers)

- **Storage:** One Mongo document per object in the JSON `vulnerabilities` array — not one giant blob for the whole feed.
- **Dates:** CISA uses `YYYY-MM-DD` strings; they are parsed to UTC midnight so range filters do not shift by timezone.
- **Missing fields:** Strings default to empty where it makes sense; `knownRansomwareCampaignUse` defaults to `Unknown`; `cwes` is always a string array (possibly empty).
- **Indexes:** Unique on `cveID`, plus indexes on fields used for sorting and filters (vendor/product, dates, ransomware).
- **List queries:** Projection + `skip`/`limit` + a separate `countDocuments` with the same filter — nothing loads the full collection for a page of results.
- **Stats:** Mongo aggregation pipelines (`$facet` on summary, `$unwind` for CWE counts, etc.).

Re-importing replaces all rows in `vulnerabilities` so a fresh run matches whatever JSON file you passed in.

---

## 6. Before you submit

Confirm a clean clone: `npm install` in both folders, ingest once, backend + frontend start, and the UI loads data. If the repo is public, double-check no secrets in `.env` (only `.env.example` should describe variables).
