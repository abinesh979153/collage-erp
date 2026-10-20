const mongoose = require('mongoose');
const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');
const { Student, Course, Enrollment } = require('../src/models');

describe('enrollments (admin only)', () => {
  let adminToken;
  let studentId;
  let courseId;

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    adminToken = await tokenFor(admin);

    const student = await Student.create({
      name: 'Test Student',
      rollNo: `R${new mongoose.Types.ObjectId().toString().slice(-8)}`,
      email: `${new mongoose.Types.ObjectId()}@example.test`,
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
  });

  test('admin creates an enrollment', async () => {
    const res = await request(app)
      .post('/api/enrollments')
      .set(bearer(adminToken))
      .send({ student: studentId, course: courseId });

    expect(res.status).toBe(201);
    expect(res.body.data.student).toBe(studentId);
    expect(res.body.data.course).toBe(courseId);
    expect(await Enrollment.countDocuments()).toBe(1);
  });

  test('rejects missing student and course', async () => {
    const res = await request(app)
      .post('/api/enrollments')
      .set(bearer(adminToken))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
    expect(await Enrollment.countDocuments()).toBe(0);
  });

  test('rejects duplicate enrollment', async () => {
    const body = { student: studentId, course: courseId };

    const first = await request(app)
      .post('/api/enrollments')
      .set(bearer(adminToken))
      .send(body);

    const second = await request(app)
      .post('/api/enrollments')
      .set(bearer(adminToken))
      .send(body);

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
    expect(await Enrollment.countDocuments()).toBe(1);
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/enrollments');
    expect(res.status).toBe(401);
  });

  test('student role is forbidden', async () => {
    const studentUser = await createUser({ role: 'student' });
    const token = await tokenFor(studentUser);

    const res = await request(app)
      .get('/api/enrollments')
      .set(bearer(token));

    expect(res.status).toBe(403);
  });

  test('lists enrollments for admin', async () => {
    await Enrollment.create({
      student: studentId,
      course: courseId
    });

    const res = await request(app)
      .get('/api/enrollments')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });
});
