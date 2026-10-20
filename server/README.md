# College ERP Backend

Node.js + Express + MongoDB (Mongoose) API. Work is delivered in stages; see **Status** below.

## Requirements
- Node.js 18+ (developed on 22)
- MongoDB 6+ reachable via `MONGODB_URI`
- Tests use `mongodb-memory-server` (downloads a MongoDB binary on first run; needs network once)

## Setup
```bash
cp .env.example .env        # then edit: set MONGODB_URI and two different JWT secrets (32+ chars)
npm install
ADMIN_NAME="Admin" ADMIN_EMAIL=admin@yourcollege.edu ADMIN_PASSWORD='ChooseAStr0ngOne' npm run create-admin
npm run dev                 # or: npm start
npm test
```
Generate secrets: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Layout
```
src/config      env validation (fails fast, never prints values), db connection
src/middleware authenticate/authorize, zod validation, error handler
src/models      Mongoose models (registered once in models/index.js)
src/modules     auth/, users/  (routes -> controller -> service, each with validation)
src/utils       AppError, pagination (limit cap + sort allowlist), token helpers
scripts         create-admin.js
tests           jest + supertest against an isolated in-memory MongoDB
```

## Security design
- No public registration; only admins create accounts.
- bcrypt password hashes (never returned); password policy 10-72 chars with upper/lower/digit.
- Short-lived access JWT + rotating refresh JWT. `tokenVersion` on the user makes logout,
  password change, role change and deactivation revoke all existing tokens. Refresh uses an
  atomic compare-and-increment, so a refresh token works once even under concurrent requests.
- Login lockout (atomic counter), login rate limit, equalised timing for unknown emails.
- Every request body/query/param validated with zod (`.strict()` bodies reject unknown fields).
- Lists: `limit` max 100, `sort` restricted to an allowlist, search input regex-escaped.
- Unique index on `users.email`; duplicate-key errors map to HTTP 409.

## Status
| Module | State |
|---|---|
| Auth, Users, config, error handling, tests | Implemented (Stage 1) |
| Students, Faculty, Courses/Enrollment, Attendance, Grades, Fees, Private documents, Exports | **Not yet implemented** (next stages) |

Tests are written but **have not been executed** in the authoring environment (no package
install access). Run `npm install && npm test` and fix anything that surfaces.
