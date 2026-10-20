const mongoose = require('mongoose');
const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');

const {
  User, Student, Course, Enrollment, Attendance
} = require('../src/models');

describe('attendance API', () => {
  let adminToken;
  let facultyToken;
  let studentToken;
  let studentId;
  let courseId;

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    const faculty = await createUser({ role: 'faculty' });
    const studentUser = await createUser({ role: 'student' });

    adminToken = await tokenFor(admin);
    facultyToken = await tokenFor(faculty);
    studentToken = await tokenFor(studentUser);

    const student = await Student.create({
      name: 'Test Student',
      rollNo: `R${new mongoose.Types.ObjectId().toString().slice(-8)}`,
      email: studentUser.email,
      department: 'CSE',
      year: 2
    });

    const course = await Course.create({
      title: 'Test Programming',
      code: `C${new mongoose.Types.ObjectId().toString().slice(-8)}`,
      department: 'CSE',
      credits: 4
    });

    studentId = student.id;
    courseId = course.id;

    await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'active'
    });
  });

  async function createAttendance(token = facultyToken) {
    return request(app)
      .post('/api/attendance')
      .set(bearer(token))
      .send({
        student: studentId,
        course: courseId,
        date: '2026-10-19T00:00:00.000Z',
        status: 'present'
      });
  }

  test('faculty creates attendance for an actively enrolled student', async () => {
    const res = await createAttendance();

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('present');
    expect(await Attendance.countDocuments()).toBe(1);
  });

  test('rejects invalid attendance status', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set(bearer(facultyToken))
      .send({
        student: studentId,
        course: courseId,
        date: '2026-10-19T00:00:00.000Z',
        status: 'unknown'
      });

    expect(res.status).toBe(400);
    expect(await Attendance.countDocuments()).toBe(0);
  });

  test('rejects attendance when student is not enrolled', async () => {
    await Enrollment.deleteMany({ student: studentId, course: courseId });

    const res = await createAttendance();

    expect(res.status).toBe(400);
    expect(await Attendance.countDocuments()).toBe(0);
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/attendance');

    expect(res.status).toBe(401);
  });

  test('student cannot create attendance', async () => {
    const res = await createAttendance(studentToken);

    expect(res.status).toBe(403);
  });

  test('lists attendance for an authenticated faculty user', async () => {
    await createAttendance();

    const res = await request(app)
      .get('/api/attendance')
      .set(bearer(facultyToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  test('student can only list their own attendance', async () => {
    await createAttendance();

    const res = await request(app)
      .get('/api/attendance')
      .set(bearer(studentToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(String(res.body.data[0].student._id)).toBe(studentId);
  });

  test('admin can delete an attendance record', async () => {
    const created = await createAttendance();

    const res = await request(app)
      .delete(`/api/attendance/${created.body.data._id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(204);
    expect(await Attendance.countDocuments()).toBe(0);
  });
});
