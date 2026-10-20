# API Reference (Stage 1)

Base path: `/api`. JSON in/out. Errors: `{ "error": { "message": "...", "details": [...] } }`.
Protected routes need `Authorization: Bearer <accessToken>`.

## Health
`GET /health` -> `200 { status: "ok" }`

## Auth
| Method | Path | Auth | Body | Result |
|---|---|---|---|---|
| POST | /auth/login | none | `{email, password}` | 200 `{user, accessToken, refreshToken, tokenType}`; 401 bad credentials; 423 locked; 429 rate limited |
| POST | /auth/refresh | none | `{refreshToken}` | 200 new token pair (old refresh token becomes invalid); 401 |
| POST | /auth/logout | any user | - | 204; revokes all tokens |
| POST | /auth/change-password | any user | `{currentPassword, newPassword}` | 200 new token pair; 400; all other sessions revoked |
| GET | /auth/me | any user | - | 200 `{user}` |

## Users (admin only; others get 403)
| Method | Path | Body / Query | Result |
|---|---|---|---|
| POST | /users | `{name, email, password, role}` role: admin, faculty, student, staff | 201 `{user}`; 409 duplicate email |
| GET | /users | `page` (>=1), `limit` (1-100, default 20), `sort` (createdAt, name, email, role), `order` (asc, desc), `role`, `isActive` (true, false), `q` (name/email substring) | 200 `{data, meta:{page,limit,total,totalPages}}` |
| GET | /users/:id | - | 200 `{user}`; 400 bad id; 404 |
| PATCH | /users/:id | any of `{name, role, isActive}` | 200 `{user}`; admins cannot demote/deactivate themselves or the last active admin; role/status change revokes that user's tokens |
| POST | /users/:id/reset-password | `{newPassword}` | 204; revokes that user's tokens, clears lockout |

## Planned (not implemented yet)
Students, faculty assignments, courses/enrollment, attendance, grades, fees, private document upload/download, restricted exports.
