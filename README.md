# CISA KEV — vulnerability dashboard (MERN)

Express + Mongo backend and a **React (Vite) + Ant Design** dashboard in `frontend/`. Data comes only from your APIs (Mongo), not from the JSON at runtime.

If you keep a separate tutorial repo for reference, keep it **outside** this folder so paths never get mixed up.

**Dataset:** https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json (download locally; you don’t have to commit the file).

**Needs:** Node 18+, MongoDB (local / Atlas / `docker compose up -d` in this repo for Mongo 7 on 27017). Default DB `kev_catalog` — see `backend/.env.example`.

---

### Backend

```bash
cd backend
cp .env.example .env          # Windows: copy .env.example .env
npm install
npm run ingest -- data/known_exploited_vulnerabilities.json
npm run dev
```

API base: `http://localhost:5000`. `CORS_ORIGIN` in `.env` should include the UI origin (default example uses `http://localhost:5173`).

`npm run ingest` wipes `vulnerabilities` and bulk-inserts from the JSON. Compass import is fine if you match the same collection/fields.

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173`. Dev server **proxies** `/api` → `http://127.0.0.1:5000` (see `frontend/vite.config.js`). For a production build pointing at another host, set `VITE_API_BASE` (see `frontend/.env.example`).

**Screens**

- **Dashboard** — stats cards + charts (ransomware split, top vendors, entries by month, CWE counts) from `/api/stats/*`.
- **Vulnerabilities** — Ant `Table` with required columns, pagination, filters (search, vendor, product, ransomware, date range). Row click opens a drawer with full text fields.

---

### API summary (`/api`)

- `GET /api/health`
- `GET /api/vulnerabilities` — `page`, `limit` (max 100), optional `vendor`, `product`, `ransomware`, `dateFrom`, `dateTo`, `search`
- `GET /api/vulnerabilities/:cveId`
- `GET /api/stats/summary`, `.../top-vendors`, `.../cwe-distribution`, `.../additions-by-month`

List response: `{ success, data, meta: { page, limit, total, totalPages } }`.

---

### Data model (short)

One Mongo document per `vulnerabilities[]` entry. Dates stored as UTC from `YYYY-MM-DD`. Trimmed strings; `knownRansomwareCampaignUse` defaults to `Unknown`; `cwes` string array; also `shortDescription`, `requiredAction`, `notes`, `catalogVersion`, `ingestedAt`. Unique index on `cveID`; other indexes for filters/sorts. Re-import overwrites the collection.

---

### Submit

Public repo, README steps work on a clean machine, public resume link, test links in a private window, use the employer’s form (not email).
