const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
  origin(origin, cb) {
    if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
})
);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/users/users.routes'));
app.use('/api/students', require('./modules/students/students.routes'));
app.use('/api/faculty', require('./modules/faculty/faculty.routes'));
app.use('/api/courses', require('./modules/courses/courses.routes'));
app.use('/api/enrollments', require('./modules/enrollments/enrollments.routes'));
app.use('/api/attendance', require('./modules/attendance/attendance.routes'));
app.use('/api/grades', require('./modules/grades/grades.routes'));
app.use('/api/faculty-course-assignments', require('./modules/faculty-course-assignments/faculty-course-assignments.routes'));
app.use('/api/departments', require('./modules/departments/departments.routes'));
app.use('/api/analytics', require('./modules/analytics/analytics.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
