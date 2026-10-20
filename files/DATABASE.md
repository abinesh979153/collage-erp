# Database design (MongoDB + Mongoose)

Code: `server/src/models/*.js`. Conventions: ids are ObjectIds serialised as 24-hex strings in `_id`; references are named `<thing>Id`; calendar dates are `YYYY-MM-DD` strings (timezone-proof); instants are ISO-8601 UTC `Date`s; terms look like `2026-27-ODD`; money is stored as integer paise (`amountMinor`). Schemas use `strict:'throw'` (unknown fields are rejected). All collections have `createdAt/updatedAt` unless stated.
Roles: `A`=admin, `F`=faculty, `S`=student. "Own" = records tied to the caller; "taught" = sections the faculty member teaches; "enrolled" = sections the student is enrolled in. Authoritative matrix: `server/src/access/policies.js`.

## Relationships
```
User 1-0..1 StudentProfile | FacultyProfile          Department 1-* Course 1-* Section *-1 FacultyProfile
StudentProfile 1-* Enrollment *-1 Section            Enrollment 1-* AttendanceRecord, Grade
Section 1-* TimetableSlot, Assignment 1-* Submission *-1 StudentProfile
StudentProfile 1-* FeeLedgerEntry, Achievement       User 1-* Document, Notification, Ticket, BookIssue *-1 Book
User 1-* Session, PasswordResetToken, AuditLog(actor)
```

## Models
**User** — `email` String req, **unique**, lowercase; `passwordHash` String req, `select:false` (argon2id); `role` enum admin|faculty|student req; `name` 2-120 req; `phone` optional; `status` pending|active|suspended (default pending); `failedLoginCount`, `lockUntil`, `lastLoginAt`, `passwordChangedAt`, `mustChangePassword`. Indexes: email(unique), role, status, text(name,email). Access: A all; F/S read/update own name+phone only. Hash/lock fields are never serialised.

**StudentProfile** — `userId`→User req **unique**; `rollNo` req **unique** `^\d{4}[A-Z]{2,6}-\d{4}$` (generated server-side, never client-supplied); `departmentId`→Department req; `program` enum; `admissionYear` 2000-2100; `currentYear` 1-6; `currentSemester` 1-12; `dob`, `guardianName`, `guardianPhone` (private); `status` active|graduated|suspended|withdrawn. Indexes: userId, rollNo (unique); {departmentId,currentYear,status}. Access: A CRUD; F read for taught sections (no dob/guardian); S read own.

**FacultyProfile** — `userId` **unique**; `employeeId` req **unique** `FAC-0000`; `departmentId` req; `designation` enum; `specializations` ≤10; `joinedOn`; `status` active|on_leave|retired|resigned. Index {departmentId,status}. Access: A CRUD; F read own; S read basic (name, department, designation).

**Department** — `code` req **unique** `^[A-Z]{2,6}$`; `name` req **unique**; `headId`→FacultyProfile; `isActive`. Access: A CRUD; F/S read.

**Course** — `code` req **unique** `^[A-Z]{2,6}\d{3}$`; `title` 3-150; `departmentId` req; `credits` int 1-10; `level` ug|pg; `prerequisiteIds`[Course] ≤8; `isActive`. Indexes: code(unique), {departmentId,isActive}, text. Access: A CRUD; F/S read.

**Section** — `courseId`, `term`, `name` (`A`, `B1`…), `facultyId`, `capacity` 1-300, `enrolledCount` (≤capacity, maintained only by `$inc` with a capacity guard), `room`, `status` open|closed|archived. **Unique** {courseId,term,name}; index {facultyId,term}. Access: A CRUD; F read/update taught; S read enrolled.

**Enrollment** — `studentId`, `sectionId`, `courseId` (denormalised from section), `term`, `status` enrolled|dropped|completed|failed|withdrawn, `enrolledAt`, `droppedAt`. **Unique** {studentId,sectionId}; **partial unique** {studentId,courseId,term} where status=enrolled (blocks two sections of one course); index {sectionId,status}. Rules enforced in `services/enrollment.js`: active student, open section, active course, prerequisites completed, no timetable clash, seat claimed atomically. Access: A CRUD; F read taught; S read own.

**AttendanceRecord** — `enrollmentId`, `studentId`, `sectionId`, `courseId` (denormalised, set by server from the enrollment), `date` YYYY-MM-DD, `period` 0-8 (0 = whole session), `status` present|absent|late|excused, `markedById`, `remarks`. **Unique {enrollmentId,date,period}** = one mark per student per section per day per period (re-marking is an update, not an insert). Indexes {sectionId,date,period}, {studentId,date}. Rules: only the section's faculty (or A) may write; faculty edits allowed for 7 days (configurable), later edits A only; date cannot be in the future; every edit is audited. Access: A CRUD; F create/read/update taught; S read own.

**Grade** — `enrollmentId`, `studentId`, `sectionId`, `courseId`, `component` internal1|internal2|assignment|midterm|practical|final, `maxMarks`, `marks` (0..maxMarks), `grade` O|A+|A|B+|B|C|P|F|AB, `gradePoints` 0-10, `published`, `publishedAt`, `gradedById`. **Unique** {enrollmentId,component}; indexes {studentId,published}, {sectionId,component}. Students see only `published:true`. Access: A CRUD; F create/read/update taught; S read own published.

**Announcement** — `title`, `body`, `audience` all|students|faculty, `departmentIds`, `authorId`, `status` draft|published|archived, `publishAt`, `expiresAt` (> publishAt), `pinned`. Index {status,audience,publishAt:-1}. Access: A CRUD; F create + edit own, read audience; S read audience.

**Notification** — `recipientId`, `message` ≤500, `type`, `link{resource,id}`, `readAt`. Index {recipientId,readAt,createdAt:-1}; TTL 180 days. Created only by the server. Access: each user reads/marks own.

**TimetableSlot** — `sectionId`, `courseId`/`facultyId`/`term` (derived from section by server), `day` Mon-Sat, `period` 1-8 (times in `config/periods.js`), `room`, `notes`. **Unique** {sectionId,term,day,period}, {facultyId,term,day,period}, {room,term,day,period}. Access: A CRUD; F read taught; S read enrolled.

**CalendarEvent** — `title`, `description`, `type` exam|holiday|event|deadline, `date`, `endDate` (≥date), `audience`, `departmentIds`, `createdById`. Indexes {date,endDate}, {type,date}. Access: A CRUD; F/S read by audience.

**Assignment** — `title`, `description`, `courseId`, `sectionId`, `facultyId`, `dueDate`, `maxMarks`, `allowLate`, `attachmentIds`[Document]≤5, `status` draft|published|closed. Indexes {sectionId,dueDate}, {facultyId,status}. Access: A CRUD; F CRUD taught; S read enrolled (published only).

**Submission** — `assignmentId`, `studentId`, `sectionId`, `content` ≤20000 or `attachmentIds` (one required), `submittedAt`, `isLate`, `version`, `status` submitted|graded|returned, `marks`, `feedback`, `gradedById`, `gradedAt`. **Unique** {assignmentId,studentId}. Late submissions rejected unless `allowLate`. Access: S create/read/update own before grading; F read/grade taught; A read/update.

**Document** (metadata only) — `ownerId`, `studentId`, `name`, `category`, `accessLevel` private|staff_visible, `storageKey` (opaque random hex, **unique**, `select:false`, never serialised), `originalName`, `mimeType` pdf|jpeg|png, `sizeBytes` ≤10 MiB, `sha256`, `scanStatus` pending|clean|infected|failed, `deletedAt` (soft delete). **No URL field.** Download only through `GET /documents/:id/download`. Access: owner read/create/delete own; A read/delete all; F create/read own; staff may read only `staff_visible` documents of students they teach.

**FeeLedgerEntry** (append-only) — `studentId`, `term`, `type` charge|payment|waiver|adjustment|reversal, `direction` debit|credit (charge⇒debit, payment/waiver⇒credit), `category`, `description`, `amountMinor` int ≥1, `currency` INR, `dueDate`, `method` (required for payment), `reference`, `receiptNo` (server generated, unique), `idempotencyKey` (unique per student), `reversalOf` (unique: an entry reverses once), `recordedById`. Hooks block update/delete. Balance = Σdebit − Σcredit (computed, never stored). Access: A create/read; S read own; F none.

**Book** — `title`, `author`, `isbn` (digits only, **unique when present**), `category`, `shelf`, `copiesTotal`, `copiesAvailable` (≤ total), `status`. Text index (title, author). Access: A CRUD; F/S read.

**BookIssue** — `bookId`, `borrowerId`→User, `issuedById`, `issuedAt`, `dueAt`>issuedAt, `returnedAt`, `status` issued|returned|lost, `renewals` ≤2, `fineMinor`. **Partial unique** {bookId,borrowerId} where status=issued; indexes {borrowerId,status}, {status,dueAt}. Issue: conditional `$inc` of `copiesAvailable` (guard `>0`) then create; return: guarded `$inc` (+1, guard `< copiesTotal`). Access: A CRUD; F/S read own.

**Ticket** — `ticketNo` unique `TCK-000001`, `requesterId`, `subject`, `message`, `priority` low|medium|high, `category`, `status` open|in_progress|resolved|closed, `assignedToId`, `replies[{authorId,body,internal,at}]` ≤200, `resolvedAt`. Indexes {requesterId,status,createdAt}, {status,priority,createdAt}, {assignedToId,status}. `internal` replies are hidden from the requester. Access: A all; F/S create + read/reply own.

**Achievement** — `studentId`, `title`, `category`, `date`, `description`, `evidenceDocumentId`, `status` pending|verified|rejected, `verifiedById`, `verifiedAt`. Indexes {studentId,date:-1}, {status}. Access: S create/read/update own (while pending); F verify for taught students; A all.

**AuditLog** (append-only, no `updatedAt`) — `actorId`, `actorRole`, `action` (`resource.verb`), `resourceType`, `resourceId`, `studentId`, `outcome` success|denied|error, `ip`, `userAgent`, `requestId`, `changes` (redacted), `at`. Indexes {resourceType,resourceId,at}, {actorId,at}, {studentId,at}, {action,at}. Access: A read only. App DB user should have insert/find only on this collection (see SECURITY.md).

**Session** — `userId`, `tokenHash` (HMAC of cookie token, **unique**), `ip`, `userAgent`, `lastSeenAt`, `expiresAt` (TTL index), `revokedAt`, `createdAt`. Access: server only; users may list/revoke own via `/auth/sessions`.

**PasswordResetToken** — `userId`, `tokenHash` unique, `expiresAt` (TTL, 30 min), `usedAt`. Server only.

**Counter** — `_id` key, `seq`. Atomic `$inc` upsert for roll/employee/receipt/ticket numbers. Server only.

## Integrity rules (where each is enforced)
| Rule | Enforcement |
|---|---|
| No duplicate student IDs | unique `rollNo`, unique `userId`; roll numbers generated from `Counter` (never accepted from clients) |
| Valid enrollment | `services/enrollment.js` checks + unique {student,section} + partial unique {student,course,term}; seat claim via guarded `$inc` |
| Attendance uniqueness | unique {enrollmentId,date,period}; bulk marking uses upserts keyed on that tuple |
| Timetable clashes | `services/timetable.js` (section, faculty, room, student overlap) + three unique indexes as race-proof backstop. Student-overlap is best-effort (not atomic) |
| Private student records | `scopeFilter()` on every query, object-level checks on `:id` routes, `select:false`/serializer stripping, audit on every staff read of a private record |
| Fee ledger | append-only, integer paise, reversal entries, receipt numbers, idempotency keys, overpayment rejected. **No payment gateway** — payments are staff-recorded facts. Concurrent overpayment checks are best-effort unless done in a transaction |
| Documents | metadata only; opaque `storageKey`; authenticated streaming download |

## Transactions and replica sets
MongoDB multi-document transactions work only on a **replica set** (a single-node replica set is fine for development) or a sharded cluster; a standalone `mongod` throws "Transaction numbers are only allowed on a replica set member or mongos". The design deliberately uses single-document atomic operations (conditional `findOneAndUpdate`, `$inc` with guards, unique indexes) for seat claims, book copies, receipt numbers and duplicates, so the app **runs on a standalone server**. Use transactions (`USE_TRANSACTIONS=true`, replica set required) when you need all-or-nothing across collections: enrollment + seat count, book issue + copy count, fee payment + notification, bulk grade publish. Atlas clusters are replica sets already. `npm run db:check` reports whether your deployment supports them.

## Seed data
`server/src/seed/seed.js` — fictional only (`*.example` addresses, "Demo …" names, no phone numbers). Guards: not production, `ALLOW_SEED=true`, db name ends `_dev|_test|_local`, hosted URIs need `--allow-remote`, refuses a non-empty DB unless `--reset`, password from `SEED_PASSWORD` or a random one shown once.
