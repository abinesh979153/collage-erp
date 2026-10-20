const mongoose = require('mongoose');
const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');
const { Faculty } = require('../src/models');

describe('faculty API', () => {
  let adminToken;
  let studentToken;

  const makeFaculty = () => ({
    name: 'Test Faculty',
    email: `${new mongoose.Types.ObjectId()}@example.test`,
    department: 'CSE',
    designation: 'Assistant Professor'
  });

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    const student = await createUser({ role: 'student' });

    adminToken = await tokenFor(admin);
    studentToken = await tokenFor(student);
  });

  test('admin creates faculty', async () => {
    const body = makeFaculty();

    const res = await request(app)
      .post('/api/faculty')
      .set(bearer(adminToken))
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(body.name);
    expect(res.body.data.email).toBe(body.email);
    expect(await Faculty.countDocuments()).toBe(1);
  });

  test('rejects invalid faculty data', async () => {
    const res = await request(app)
      .post('/api/faculty')
      .set(bearer(adminToken))
      .send({ name: 'A' });

    expect(res.status).toBe(400);
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/faculty');

    expect(res.status).toBe(401);
  });

  test('student role cannot manage faculty', async () => {
    const res = await request(app)
      .get('/api/faculty')
      .set(bearer(studentToken));

    expect(res.status).toBe(403);
  });

  test('lists faculty records', async () => {
    await Faculty.create([makeFaculty(), makeFaculty()]);

    const res = await request(app)
      .get('/api/faculty')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  test('filters faculty by department', async () => {
    await Faculty.create(makeFaculty());
    await Faculty.create({
      ...makeFaculty(),
      department: 'EEE'
    });

    const res = await request(app)
      .get('/api/faculty?department=EEE')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].department).toBe('EEE');
  });

  test('gets faculty by ID', async () => {
    const faculty = await Faculty.create(makeFaculty());

    const res = await request(app)
      .get(`/api/faculty/${faculty.id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(faculty.id);
  });

  test('updates faculty designation', async () => {
    const faculty = await Faculty.create(makeFaculty());

    const res = await request(app)
      .patch(`/api/faculty/${faculty.id}`)
      .set(bearer(adminToken))
      .send({ designation: 'Professor' });

    expect(res.status).toBe(200);
    expect(res.body.data.designation).toBe('Professor');
  });

  test('deletes faculty', async () => {
    const faculty = await Faculty.create(makeFaculty());

    const res = await request(app)
      .delete(`/api/faculty/${faculty.id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(204);
    expect(await Faculty.countDocuments()).toBe(0);
  });

  test('returns 404 for missing faculty', async () => {
    const id = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/faculty/${id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(404);
  });

  test('admin links an active faculty user with matching email', async () => {
    const body = makeFaculty();
    const user = await createUser({
      role: 'faculty',
      email: body.email
    });

    const res = await request(app)
      .post('/api/faculty')
      .set(bearer(adminToken))
      .send({ ...body, user: user.id });

    expect(res.status).toBe(201);
    const saved = await Faculty.findOne({ email: body.email });
    expect(String(saved.user)).toBe(user.id);
  });

  test('rejects linking a student account', async () => {
    const body = makeFaculty();
    const user = await createUser({ role: 'student', email: body.email });

    const res = await request(app)
      .post('/api/faculty')
      .set(bearer(adminToken))
      .send({ ...body, user: user.id });

    expect(res.status).toBe(400);
  });

  test('rejects linking an inactive faculty account', async () => {
    const body = makeFaculty();
    const user = await createUser({
      role: 'faculty',
      email: body.email,
      isActive: false
    });

    const res = await request(app)
      .post('/api/faculty')
      .set(bearer(adminToken))
      .send({ ...body, user: user.id });

    expect(res.status).toBe(400);
  });

  test('rejects linking when emails do not match', async () => {
    const body = makeFaculty();
    const user = await createUser({ role: 'faculty' });

    const res = await request(app)
      .post('/api/faculty')
      .set(bearer(adminToken))
      .send({ ...body, user: user.id });

    expect(res.status).toBe(400);
  });

  test('rejects linking one user to multiple faculty profiles', async () => {
    const body = makeFaculty();
    const user = await createUser({
      role: 'faculty',
      email: body.email
    });

    await Faculty.create({ ...body, user: user.id });

    const second = { ...makeFaculty(), email: body.email };
    const res = await request(app)
      .post('/api/faculty')
      .set(bearer(adminToken))
      .send({ ...second, user: user.id });

    expect(res.status).toBe(409);
  });

});
