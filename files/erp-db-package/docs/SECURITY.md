# Security design

This is a design and checklist for the Express developer. Nothing here is implemented in this package except schema-level controls (validation, `strict:'throw'`, hidden fields, unique indexes, append-only hooks, `access/policies.js`). Treat every unchecked item as a to-do.

## 1. Authentication
- Passwords: **argon2id**; policy ≥10 chars, reject common/breached passwords; never log or return hashes (`passwordHash` is `select:false`).
- Sessions: login creates a 32-byte random token → httpOnly cookie `sid` (`Secure` in production, `SameSite=Lax`, `Path=/api`); only `HMAC-SHA256(token, SESSION_TOKEN_PEPPER)` is stored in `Session`. Absolute TTL (`SESSION_TTL_HOURS`) + idle timeout (`SESSION_IDLE_MINUTES`) checked via `lastSeenAt`; TTL index purges rows. Logout and password change revoke sessions. Rotate the token on login (prevent fixation).
- Brute force: per-IP and per-account rate limits; lock after `LOGIN_MAX_ATTEMPTS` for `LOCKOUT_MINUTES` (`423`). Same error and timing for unknown email vs wrong password.
- Registration: students/faculty only, `pending` until an admin approves; admin accounts are created by seed/CLI/admin UI only.
- Password reset: single-use token (32 random bytes, hashed in `PasswordResetToken`, 30-min TTL), generic `202` response, email link points to the client; reset revokes all sessions.
- CSRF: `SameSite=Lax` + reject state-changing requests whose `Origin`/`Referer` is not `CLIENT_ORIGIN`; if cross-site deployment is chosen, add a double-submit CSRF token. CORS: exact-origin allow-list, `credentials:true`, never `*`.

## 2. Authorization
- Deny by default. Every route declares `(resource, action)`; middleware calls `can()` then every query is built with `scopeFilter()` (`server/src/access/policies.js`). Never trust role/profile ids from the request body; load them from the session.
- Object-level checks on every `:id` route (IDOR): return `404` when the caller may not see it.
- Frontend route guards are UX only; all enforcement is server-side.
- Field-level: strip `dob`, guardian data, `internal` ticket replies, unpublished grades, `storageKey` for unauthorised roles (serializer allow-lists per role).
- Mass assignment: Zod/Joi allow-list per route plus `strict:'throw'` in Mongoose. NoSQL injection: validate types, reject keys starting with `$` or containing `.`, `mongoose.set('sanitizeFilter',true)` (already in `config/db.js`).
- Private student records (profile, attendance, grades, fees, documents, achievements): students see only their own; faculty only students in sections they teach; admin all. Staff reads of student detail/documents/fees are audited with `studentId`.

## 3. Secrets management
- Only `server/.env.example` (placeholders) is committed; `.env*` is git-ignored. No credentials in code, docs, seed, client bundle, or logs. Only `VITE_API_BASE_URL` (a public URL) belongs in the client.
- Generate secrets with a CSPRNG (`openssl rand -hex 32`); separate values per environment; rotate on staff change or suspected leak (rotating `SESSION_TOKEN_PEPPER` logs everyone out).
- Production: platform secret store (e.g. cloud secret manager), not files on disk. MongoDB: dedicated least-privilege user per environment (readWrite on the app DB only; audit collection insert+find only), TLS, IP allow-list, authentication enabled, no `0.0.0.0` exposure, encrypted backups, restore tested.
- Run `npm audit`, pin lockfiles, enable secret scanning (e.g. gitleaks) in CI. If a secret was ever committed, treat it as compromised and rotate it.

## 4. Private file handling
- Files are stored **outside** any static/public directory (`PRIVATE_UPLOAD_DIR`, or a private object-storage bucket with no public ACL) under an opaque random `storageKey`. MongoDB stores metadata only; the `Document` schema has no URL field and `storageKey` is never serialised.
- Upload pipeline: authenticated route → multer/busboy with `MAX_UPLOAD_BYTES` → sniff real type from magic bytes (allow pdf/jpeg/png only; ignore client MIME/extension) → compute SHA-256 → write to a temp file then move → `scanStatus:'pending'` → malware scan (ClamAV or service) → only `clean` files are downloadable. Sanitise `originalName` (never used as a path).
- Download: `GET /documents/:id/download` → authz check → audit → stream with `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`. If using object storage, issue pre-signed URLs only from this endpoint, ≤60 s, single object; never persist or return permanent URLs.
- Soft delete sets `deletedAt` and removes access immediately; a job purges bytes after the retention period. Encrypt volumes/buckets at rest; restrict OS permissions (`0700`) on the upload dir; exclude it from Git (done in `.gitignore`).
- Exports (CSV) are generated on the fly, not stored; prefix cells beginning `= + - @` to prevent spreadsheet formula injection.

## 5. Audit logging
- Collection `AuditLog` is append-only (model hooks block update/delete; additionally grant the app user insert+find only, and ship logs to external storage for tamper evidence).
- Record: login success/failure/lockout, logout, password change/reset, user status/role change, student/faculty create/update/delete, enrollment, attendance edits, grade create/update/publish, fee entries/reversals, document upload/download/delete, staff reads of private student records, report exports, denied (`403`) attempts on sensitive resources.
- Each entry: actor, role, action (`resource.verb`), resource id, `studentId`, outcome, IP, user-agent, `requestId`, redacted `changes` (field names + old/new for non-sensitive fields only; never passwords, tokens, file bytes, full DOB).
- Retention: define a policy (suggested ≥1 year for audit, shorter for notifications/sessions); restrict `/audit-logs` to admins. Application logs use the same `requestId` and exclude PII/secrets.

## 6. Other controls
helmet headers, HTTPS/HSTS, JSON body limit (≈100 KB), request-schema validation, pagination caps (`limit≤100`), generic `500` messages, dependency updates, and a data-protection review (consent, minimisation, retention, subject access) under the law that applies to your institution (for India, the DPDP Act 2023) — obtain legal advice; this document is not legal advice.
