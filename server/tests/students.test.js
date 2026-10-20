const mongoose = require('mongoose');
const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');
const { Student } = require('../src/models');

describe('students API', () => {
  let adminToken;
  let facultyToken;
  let studentToken;

  const makeStudent = () => ({
    name: 'Test Student',
    rollNo: `R${new mongoose.Types.ObjectId().toString().slice(-8)}`,
    email: `${new mongoose.Types.ObjectId()}@example.test`,
    department: 'CSE',
    year: 2
  });

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    const faculty = await createUser({ role: 'faculty' });
    const student = await createUser({ role: 'student' });

    adminToken = await tokenFor(admin);
    facultyToken = await tokenFor(faculty);
    studentToken = await tokenFor(student);
  });

  test('admin creates a student', async () => {
    const body = makeStudent();

    const res = await request(app)
      .post('/api/students')
      .set(bearer(adminToken))
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(body.name);
    expect(res.body.data.rollNo).toBe(body.rollNo.toUpperCase());
    expect(await Student.countDocuments()).toBe(1);
  });

  test('faculty can create a student', async () => {
    const res = await request(app)
      .post('/api/students')
      .set(bearer(facultyToken))
      .send(makeStudent());

    expect(res.status).toBe(201);
  });

  test('rejects invalid student data', async () => {
    const res = await request(app)
      .post('/api/students')
      .set(bearer(adminToken))
      .send({ name: 'A', year: 10 });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });

  test('requires authentication', async () => {
    const res = await request(app)
      .get('/api/students');

    expect(res.status).toBe(401);
  });

  test('student role cannot access student management', async () => {
    const res = await request(app)
      .get('/api/students')
      .set(bearer(studentToken));

    expect(res.status).toBe(403);
  });

  test('lists students for admin', async () => {
    await Student.create(makeStudent());
    await Student.create(makeStudent());

    const res = await request(app)
      .get('/api/students')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  test('gets a student by ID', async () => {
    const student = await Student.create(makeStudent());

    const res = await request(app)
      .get(`/api/students/${student.id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(student.id);
  });

  test('updates a student', async () => {
    const student = await Student.create(makeStudent());

    const res = await request(app)
      .patch(`/api/students/${student.id}`)
      .set(bearer(adminToken))
      .send({ year: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.year).toBe(3);
  });

  test('deletes a student', async () => {
    const student = await Student.create(makeStudent());

    const res = await request(app)
      .delete(`/api/students/${student.id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(204);
    expect(await Student.countDocuments()).toBe(0);
  });

  test('returns 404 for a missing student', async () => {
    const id = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/students/${id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(404);
  });
});
