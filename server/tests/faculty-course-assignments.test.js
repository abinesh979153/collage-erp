const mongoose = require('mongoose');
const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');
const {
  Faculty, Course, FacultyCourseAssignment
} = require('../src/models');

describe('faculty course assignments API', () => {
  let adminToken;
  let studentToken;
  let faculty;
  let course;

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    const student = await createUser({ role: 'student' });

    adminToken = await tokenFor(admin);
    studentToken = await tokenFor(student);

    faculty = await Faculty.create({
      name: 'Test Faculty',
      email: `${new mongoose.Types.ObjectId()}@example.test`,
      department: 'CSE',
      designation: 'Assistant Professor'
    });

    course = await Course.create({
      title: 'Data Structures',
      code: `CS${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      department: 'CSE',
      credits: 4
    });
  });

  test('admin creates a faculty-course assignment', async () => {
    const res = await request(app)
      .post('/api/faculty-course-assignments')
      .set(bearer(adminToken))
      .send({
        faculty: faculty.id,
        course: course.id
      });

    expect(res.status).toBe(201);
    expect(res.body.data.faculty).toBe(faculty.id);
    expect(res.body.data.course).toBe(course.id);
    expect(await FacultyCourseAssignment.countDocuments()).toBe(1);
  });

  test('requires authentication', async () => {
    const res = await request(app)
      .get('/api/faculty-course-assignments');

    expect(res.status).toBe(401);
  });

  test('student cannot manage assignments', async () => {
    const res = await request(app)
      .get('/api/faculty-course-assignments')
      .set(bearer(studentToken));

    expect(res.status).toBe(403);
  });

  test('rejects invalid assignment data', async () => {
    const res = await request(app)
      .post('/api/faculty-course-assignments')
      .set(bearer(adminToken))
      .send({ faculty: 'invalid', course: course.id });

    expect(res.status).toBe(400);
  });

  test('rejects duplicate faculty-course assignments', async () => {
    const body = {
      faculty: faculty.id,
      course: course.id
    };

    await request(app)
      .post('/api/faculty-course-assignments')
      .set(bearer(adminToken))
      .send(body);

    const duplicate = await request(app)
      .post('/api/faculty-course-assignments')
      .set(bearer(adminToken))
      .send(body);

    expect(duplicate.status).toBe(409);
  });

  test('returns 404 when faculty does not exist', async () => {
    const res = await request(app)
      .post('/api/faculty-course-assignments')
      .set(bearer(adminToken))
      .send({
        faculty: new mongoose.Types.ObjectId().toString(),
        course: course.id
      });

    expect(res.status).toBe(404);
  });

  test('returns 404 when course does not exist', async () => {
    const res = await request(app)
      .post('/api/faculty-course-assignments')
      .set(bearer(adminToken))
      .send({
        faculty: faculty.id,
        course: new mongoose.Types.ObjectId().toString()
      });

    expect(res.status).toBe(404);
  });
});
