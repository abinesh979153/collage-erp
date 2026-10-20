# College ERP – Frontend (React + Vite)
## Run
```
cd client && cp .env.example .env && npm install && npm run dev
npm run build   # production build -> dist/
```
Set `VITE_API_BASE_URL` (e.g. http://localhost:5000). All calls go to `<base>/api/v1`, with cookies (`credentials: include`) — enable CORS with credentials on the backend.
## API contract (for the backend developer)
Lists: `GET /<path>?q=` → `{data:[...],total}` · Create: `POST /<path>` body = form fields → `{data:{...}}` · Delete: `DELETE /<path>/:id` · Errors: `{message}` with 4xx/5xx.
Paths: students, faculty, departments, courses, enrollments, attendance, grades, assignments, submissions, timetable, calendar-events, library/books, fees/ledger, announcements, notifications, documents, tickets (field names: `src/features/modules.js`).
Auth: `POST /auth/login|register|logout|forgot-password`, `GET /auth/me` → `{data:{name,email,role}}` (role: admin|faculty|student), `PUT /auth/password`, `PUT /users/me`.
Other: `GET /analytics/summary` → `{data:{cards:[{label,value}],series:[{name,value}]}}`, `GET /search?q=` → `{data:[{type,id,title}]}`, `GET /reports/export?type=&format=csv` → file.
Security: route guards are UX only; the backend must enforce auth and role checks and set an httpOnly session cookie.
