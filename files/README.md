# College ERP — Database & API Contract Package

MongoDB + Mongoose data layer, REST contract (`/api/v1`) and security notes for a College ERP / Student Management System with roles **admin**, **faculty**, **student**. The React client lives in `client/`; the Express app is built separately.

**Verification status:** schemas, services, seed and tests are syntax-checked only. They have **not** been run against a MongoDB instance in this package's authoring environment, so no database is claimed to be connected or operational. Follow "Verify your setup" below.

## Layout
```
README.md  .gitignore
docs/{API.md, DATABASE.md, SECURITY.md, INTEGRATION.md}
server/.env.example  package.json
server/src/{models,services,access,config,seed}/   server/scripts/   server/tests/
```

## Prerequisites
Node.js ≥ 20, npm, and one MongoDB option (7.x or 8.x; Atlas is fine): local install, Docker, or Atlas.

## Configure a local development database
Option A — Docker, single-node replica set (supports transactions):
```bash
docker run -d --name erp-mongo -p 127.0.0.1:27017:27017 mongo:7 --replSet rs0 --bind_ip_all
docker exec erp-mongo mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"127.0.0.1:27017"}]})'
```
Use `MONGODB_URI=mongodb://127.0.0.1:27017/?replicaSet=rs0`. (If the replica-set host name is unreachable from your machine, add `directConnection=true` to the URI.)
Option B — plain local `mongod` (standalone): `MONGODB_URI=mongodb://127.0.0.1:27017`, keep `USE_TRANSACTIONS=false`.
Option C — Atlas free cluster: use its connection string in `.env` only, add your IP to the access list, create a dev-only DB user.
Local databases are unauthenticated by default: bind to `127.0.0.1` only.

## Setup
```bash
cd server
cp .env.example .env          # then edit placeholders; never commit .env
npm install
npm run db:check              # prints "OK: connected…" only if a real connection succeeds
npm run db:indexes            # create/sync all indexes
```

## Environment variables (`server/.env.example`)
`NODE_ENV, PORT, CLIENT_ORIGIN, MONGODB_URI, MONGODB_DB_NAME (dev DB names end in _dev), USE_TRANSACTIONS, SESSION_TOKEN_PEPPER, SESSION_TTL_HOURS, SESSION_IDLE_MINUTES, LOGIN_MAX_ATTEMPTS, LOCKOUT_MINUTES, PRIVATE_UPLOAD_DIR, MAX_UPLOAD_BYTES, SMTP_*, MAIL_FROM, ALLOW_SEED, SEED_PASSWORD`. Client: `VITE_API_BASE_URL` only (`client/.env`).

## Seed fictional demo data (safely)
1. Use a throwaway database: `MONGODB_DB_NAME=college_erp_dev`, and set `ALLOW_SEED=true` in `server/.env`.
2. Optionally set `SEED_PASSWORD` (≥12 chars); otherwise a random one is printed once.
3. `npm run seed` (fresh DB) or `npm run seed:reset` (wipes this dev DB's collections first).
The script refuses to run when `NODE_ENV=production`, `ALLOW_SEED` isn't `true`, the DB name doesn't end in `_dev/_test/_local`, the URI looks like a hosted cluster (needs `--allow-remote`), or the DB already has users. Demo logins: `demo.admin@college.example`, `demo.faculty1@college.example`, `demo.student01@college.example` (all `.example` = non-routable).

## Tests
`cd server && npm test` — Node's built-in runner; validates schemas, indexes, money conversion and the policy matrix without a database. API/integration tests belong with the Express app.

## Run
This package has no HTTP server. When the Express app exists, mount routes under `/api/v1`, call `connect()` from `server/src/config/db.js`, and follow `docs/API.md`. Client: `cd client && cp .env.example .env && npm install && npm run dev` (set `VITE_API_BASE_URL=http://localhost:5000`).

## Troubleshooting
- `MONGODB_URI is not set` → create `server/.env`.
- `ECONNREFUSED`/server selection timeout → MongoDB not running, wrong port, or Docker port not published.
- `Transaction numbers are only allowed on a replica set member or mongos` → you are on a standalone server; use Option A or keep `USE_TRANSACTIONS=false`.
- `E11000 duplicate key` → a unique rule fired (roll number, enrollment, attendance tuple, ISBN…) — expected; the API maps it to `409`.
- Index build errors after changing a schema → `npm run db:indexes` (dev DB: drop the collection first).
- `SEED REFUSED: …` → read the message; the guard is working as designed.
- Browser shows CORS/cookie errors → set `CLIENT_ORIGIN` exactly, use `credentials:'include'`, same-site or `SameSite=None; Secure`.

## Read before merging
`docs/INTEGRATION.md` lists the 16 decisions both developers must confirm.
