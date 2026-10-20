# Frontend / backend integration contract

Prefix `/api/v1`. Roles: `admin`, `faculty`, `student` (lowercase). Lists `{data:[…],total,page,limit}`; items `{data:{…}}`; deletes `204`; errors `{message,code,errors?,details?,requestId}` (superset of what the current React client reads: `message`). IDs: `_id` (24-hex). Session: httpOnly cookie, requests use `credentials:'include'`.

## Decisions both teams must confirm before merging
| # | Decision | Proposal (used in all docs) | Impact |
|---|---|---|---|
| 1 | Auth transport | httpOnly `sid` cookie, `SameSite=Lax`, `Secure` in prod; same-site deployment (or reverse proxy). If client and API are on different sites: `SameSite=None; Secure` plus a CSRF token header | Client: keep `credentials:'include'`; Server: CORS allow-list `CLIENT_ORIGIN` with credentials |
| 2 | Registration | `POST /auth/register` creates `status:'pending'`; admin approves; admin role can never self-register | Client: change success text from "You can now sign in" to "awaiting approval"; handle `403 ACCOUNT_PENDING` on login |
| 3 | Documents | Upload is `multipart/form-data` (`file`, `name`, `category`); no `url` field; open via `GET /documents/:id/download` | Client: replace the "File URL" field with a file input and a Download button |
| 4 | Reference IDs | `studentId` = **StudentProfile** `_id`; `facultyId` = FacultyProfile `_id`; `GET /auth/me` returns `profileId`. Free-text "Student ID/Course ID" inputs become pickers | Client forms |
| 5 | Sections | Attendance, grades, assignments, timetable, enrollment use `sectionId` (a course alone is ambiguous). Attendance/grades also accept `studentId`+`courseId` and resolve the single active enrollment (409 `AMBIGUOUS_ENROLLMENT` otherwise) | Client: add a Section picker |
| 6 | Aliases returned/accepted | students: `department` (code), `year`=currentYear; courses/faculty: `department` (code); departments: `head` (employeeId in, name out) plus `headId`; library: `copies`=copiesTotal; enrollments: `semester`=`term` | Server DTO layer |
| 7 | Money | API: decimal rupees (≤2 dp) in `amount`; storage: integer paise; INR only; ledger is append-only; fix mistakes with reversal | Client: format with `Intl.NumberFormat('en-IN')` |
| 8 | Dates | Calendar fields `YYYY-MM-DD`; instants ISO-8601 UTC (`dueDate`, `submittedAt`) | both |
| 9 | Pagination | Default `limit=25`, max 100, `page` from 1, `q` search, `sort=field` / `-field`. Current client shows only page 1 | Client: add paging or pass `limit=100` |
| 10 | Delete semantics | `DELETE` on students/faculty/courses/departments = soft deactivate (`status`/`isActive`), hidden from default lists; other resources hard delete; fees/audit have no delete | Client: wording |
| 11 | Terms | `YYYY-YY-ODD|EVEN`, e.g. `2026-27-ODD` | both |
| 12 | Notifications | Server-generated only; client lists, `PATCH /notifications/:id/read`, `POST /notifications/read-all` | |
| 13 | Analytics/search/export shapes | See API.md §Misc; CSV only; cells beginning `= + - @` are prefixed with `'` | |
| 14 | Rate limiting | `429 RATE_LIMITED` + `Retry-After`; client shows retry message | |
| 15 | Missing client screens | `POST /auth/reset-password` (reset link target), sections, library issues, achievements, ticket replies, audit log viewer | Client backlog |
| 16 | Transactions | Off by default (works on standalone Mongo); switch on with a replica set | Backend |
