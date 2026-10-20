# REST API — `/api/v1`

Status: **specification** for the Express developer; no server code is included in this package. Field names match `docs/DATABASE.md` and the React client in `client/src/features/modules.js`. Shared decisions: `docs/INTEGRATION.md`.

## Conventions
- JSON everywhere (`Content-Type: application/json`), except document upload (`multipart/form-data`) and downloads/exports.
- Auth: httpOnly cookie `sid` set by login. Every route except `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` requires it.
- Roles: `admin` (A), `faculty` (F), `student` (S). "own" = caller's records only; "taught" = F's sections; "enrolled" = S's sections.
- Lists: `GET …?page=1&limit=25&q=text&sort=-createdAt` → `{"data":[…],"total":120,"page":1,"limit":25}`. Items: `{"data":{…}}`. Create → `201` + item. Update → `200` + item. Delete → `204`.
- Unknown body fields → `422` (mass-assignment guard). Client-supplied `_id`, `role` (except register), `rollNo`, `receiptNo`, `*ById` are ignored/rejected.

### Errors
```json
{"message":"Section is full","code":"SECTION_FULL","errors":[{"field":"sectionId","message":"…"}],"details":{},"requestId":"req_8f3a"}
```
| HTTP | code | meaning |
|---|---|---|
| 400 | BAD_REQUEST | malformed JSON/query |
| 401 | UNAUTHENTICATED | no/expired session |
| 403 | FORBIDDEN, ACCOUNT_PENDING, ACCOUNT_SUSPENDED | role/ownership denied, account not active |
| 404 | NOT_FOUND | missing **or not visible to caller** (no existence leak) |
| 409 | CONFLICT, DUPLICATE, SECTION_FULL, ALREADY_ENROLLED, TIMETABLE_CLASH, OVERPAYMENT, ALREADY_REVERSED, AMBIGUOUS_ENROLLMENT, NOT_ENROLLED | state conflict |
| 413/415 | PAYLOAD_TOO_LARGE, UNSUPPORTED_MEDIA_TYPE | uploads |
| 422 | VALIDATION_ERROR, INVALID_ENROLLMENT, PREREQUISITE_NOT_MET, INVALID_SECTION | semantic validation |
| 423 | ACCOUNT_LOCKED | too many failed logins |
| 429 | RATE_LIMITED | `Retry-After` header |
| 500 | INTERNAL | no internals leaked |

## Auth & profile
| Method | Path | Roles | Body → Result |
|---|---|---|---|
| POST | `/auth/register` | public | `{name,email,password(≥8… policy ≥10),role:"student"\|"faculty"}` → `201 {data:{_id,email,status:"pending"}}` |
| POST | `/auth/login` | public | `{email,password}` → `200 {data:{_id,name,email,role,phone,profileId}}` + `Set-Cookie: sid` |
| POST | `/auth/logout` | any | → `204` (session revoked) |
| GET | `/auth/me` | any | → `{data:{_id,name,email,role,phone,profileId}}` |
| POST | `/auth/forgot-password` | public | `{email}` → always `202 {message:"If the account exists…"}` |
| POST | `/auth/reset-password` | public | `{token,newPassword}` → `204` |
| PUT | `/auth/password` | any | `{currentPassword,newPassword}` → `204`; revokes other sessions |
| GET / DELETE | `/auth/sessions`, `/auth/sessions/:id` | any (own) | list / revoke |
| PUT | `/users/me` | any | `{name?,phone?}` → `{data:user}` |
| GET / POST | `/users` | A | list; create user (any role) |
| PATCH | `/users/:id/status` | A | `{status:"active"\|"suspended"}` → `{data:user}` |
```http
POST /api/v1/auth/login
{"email":"demo.student01@college.example","password":"<your seed password>"}
→ 200 {"data":{"_id":"6650f0c2a1b2c3d4e5f60001","name":"Demo Student 01","email":"demo.student01@college.example","role":"student","profileId":"6650f0c2a1b2c3d4e5f60101"}}
```

## Resources (paths are exactly what the client calls)
Create-body fields: `*` required. Responses include `_id`, `createdAt`, `updatedAt` plus listed read-only fields.

| Resource | Path | A | F | S | Create body | Read-only extras |
|---|---|---|---|---|---|---|
| Students | `/students`, `/students/me` | CRUD | R taught | R own | `name*,email*,password*,department*(code),program*,admissionYear*,year,dob,guardianName,guardianPhone` | `rollNo,userId,departmentId,semester,status` |
| Faculty | `/faculty` | CRUD | R own | R basic | `name*,email*,password*,department*,designation*` | `employeeId,departmentId,status` |
| Departments | `/departments` | CRUD | R | R | `name*,code*,head?` | `headId,headName` |
| Courses | `/courses` | CRUD | R | R | `code*,title*,department*,credits*,level?,description?,prerequisiteIds?` | `departmentId` |
| Sections | `/sections` | CRUD | R,U taught | R enrolled | `courseId*,term*,name*,facultyId*,capacity*,room?` | `enrolledCount` |
| Enrollments | `/enrollments`, `POST /enrollments/:id/drop` | CRUD | R taught | R own | `studentId*,sectionId*` | `courseId,term,semester,status` |
| Attendance | `/attendance` | CRUD | C,R,U taught | R own | single: `studentId*,sectionId*\|courseId*,date*,status*,period?,remarks?`; bulk: `{sectionId,date,period,records:[{studentId,status}]}` | `markedById` |
| Grades | `/grades` | CRUD | C,R,U taught | R own published | `studentId*,sectionId*\|courseId*,marks*,component?,maxMarks?,grade?` | `published,gradePoints` |
| Assignments | `/assignments` | CRUD | CRUD taught | R enrolled | `title*,sectionId*,dueDate*,description?,maxMarks?,allowLate?,attachmentIds?` | `courseId,facultyId` |
| Submissions | `/submissions`, `PATCH /submissions/:id/grade` | R,U | R,grade taught | C,R,U own | `assignmentId*,content*\|attachmentIds*` | `studentId,isLate,version,status,marks,feedback` |
| Timetable | `/timetable` | CRUD | R taught | R enrolled | `sectionId*,day*(Mon–Sat),period*(1–8),room*` | `courseId,facultyId,term` |
| Calendar | `/calendar-events` | CRUD | R | R | `title*,date*,type*(exam\|holiday\|event\|deadline),endDate?,audience?,description?` | |
| Library books | `/library/books` | CRUD | R | R | `title*,author*,copies*,isbn?,category?,shelf?` | `copiesAvailable` |
| Library issues | `/library/issues`, `POST /library/issues/:id/return`, `POST /library/issues/:id/renew` | CRUD | R own | R own | `bookId*,borrowerId*(user),dueAt?` | `status,fineMinor` |
| Fees ledger | `/fees/ledger`, `GET /fees/balance/:studentId`, `POST /fees/ledger/:id/reverse` | C,R | — | R own | `studentId*,type*(charge\|payment),amount*,description*,term*`, payment also `method*,reference?,idempotencyKey?` ; charge also `category?,dueDate?` | `direction,receiptNo,balance` |
| Announcements | `/announcements` | CRUD | C,R,U own | R | `title*,body*,audience?,departmentIds?,publishAt?,expiresAt?,pinned?` | `authorId` |
| Notifications | `/notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all` | R,U own | R,U own | R,U own | server-created only | `message,type,link,readAt` |
| Documents | `/documents`, `/documents/:id/download` | R,D all | C,R,D own | C,R,D own | multipart: `file*,name*,category?,accessLevel?` | `originalName,mimeType,sizeBytes,scanStatus` |
| Tickets | `/tickets`, `POST /tickets/:id/replies` | CRUD | C,R,U own | C,R,U own | `subject*,message*,priority?,category?`; reply `{body,internal?}` | `ticketNo,status,replies` |
| Achievements | `/achievements` | CRUD | R,verify taught | C,R,U own | `title*,date*,category?,description?,evidenceDocumentId?` | `status` |
| Audit logs | `/audit-logs` | R | — | — | filters: `actorId,action,resourceType,studentId,from,to` | |

### Key examples
```http
POST /api/v1/enrollments            {"studentId":"…0101","sectionId":"…0301"}
→ 201 {"data":{"_id":"…","studentId":"…0101","sectionId":"…0301","courseId":"…0201","term":"2026-27-ODD","semester":"2026-27-ODD","status":"enrolled"}}
→ 409 {"message":"Section is full","code":"SECTION_FULL","requestId":"…"}

POST /api/v1/timetable              {"sectionId":"…0301","day":"Mon","period":1,"room":"R-101"}
→ 409 {"message":"Timetable clash detected","code":"TIMETABLE_CLASH","details":{"clashes":[{"type":"faculty","slotId":"…"}]}}

POST /api/v1/attendance             {"sectionId":"…0301","date":"2026-10-12","period":1,"records":[{"studentId":"…0101","status":"present"},{"studentId":"…0102","status":"absent"}]}
→ 200 {"data":{"upserted":2,"modified":0}}     (re-posting the same tuple updates; it never duplicates)

POST /api/v1/fees/ledger            {"studentId":"…0101","term":"2026-27-ODD","type":"payment","amount":20000,"method":"bank_transfer","reference":"DEMO-REF-0001","idempotencyKey":"pay-2026-10-17-001"}
→ 201 {"data":{"_id":"…","type":"payment","direction":"credit","amount":20000,"receiptNo":"RCT-2026-000001"}}
GET  /api/v1/fees/balance/…0101     → {"data":{"studentId":"…0101","currency":"INR","balance":30000,"status":"due"}}

POST /api/v1/documents  (multipart: file=@marksheet.pdf, name="Semester 1 marksheet", category="marksheet")
→ 201 {"data":{"_id":"…","name":"Semester 1 marksheet","mimeType":"application/pdf","sizeBytes":182340,"scanStatus":"pending"}}   // no URL
GET  /api/v1/documents/:id/download → 200 binary, Content-Disposition: attachment, X-Content-Type-Options: nosniff, Cache-Control: private, no-store
```
Attendance rules: `403` if F doesn't teach the section; `422` for future dates; `409 AMBIGUOUS_ENROLLMENT` when `courseId` resolves to several enrollments. Grades: `422` if `marks>maxMarks`.

## Misc
- `GET /analytics/summary` → `{"data":{"cards":[{"label":"Students","value":"1,240"}],"series":[{"name":"CSE","value":420}]}}`. Scoped by role (A: students/faculty/courses/outstanding fees, series = students per department; F: sections, students, pending submissions, attendance %, series = attendance by section; S: attendance %, pending assignments, fee balance, series = marks per course).
- `GET /search?q=` (min 2 chars) → `{"data":[{"type":"student","id":"…","title":"Demo Student 01 (2026CSE-0001)"}]}`; types `student|faculty|course|book|announcement|assignment`; results filtered by `scopeFilter` per type.
- `GET /reports/export?type=students|faculty|attendance|grades|fees|library&format=csv` → `text/csv` attachment. A: all; F: `attendance`,`grades` for taught sections; S: `403`. Exports are audited (`report.export`).
- `GET /health` (outside the prefix is acceptable) → `{"status":"ok"}`; must not reveal DB details.
