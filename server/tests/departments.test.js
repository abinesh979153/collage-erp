const mongoose = require('mongoose');
const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');
const { Department } = require('../src/models');

describe('departments API', () => {
  let adminToken;
  let studentToken;

  const makeDepartment = () => ({
    name: 'Computer Science',
    code: `D${new mongoose.Types.ObjectId().toString().slice(-6)}`,
    head: 'Test Department Head'
  });

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    const student = await createUser({ role: 'student' });

    adminToken = await tokenFor(admin);
    studentToken = await tokenFor(student);
  });

  test('admin creates a department', async () => {
    const body = makeDepartment();

    const res = await request(app)
      .post('/api/departments')
      .set(bearer(adminToken))
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(body.name);
    expect(res.body.data.code).toBe(body.code.toUpperCase());
    expect(await Department.countDocuments()).toBe(1);
  });

  test('department code is converted to uppercase', async () => {
    const body = { ...makeDepartment(), code: 'cse101' };

    const res = await request(app)
      .post('/api/departments')
      .set(bearer(adminToken))
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('CSE101');
  });

  test('rejects invalid department data', async () => {
    const res = await request(app)
      .post('/api/departments')
      .set(bearer(adminToken))
      .send({ name: 'A', code: 'X' });

    expect(res.status).toBe(400);
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/departments');

    expect(res.status).toBe(401);
  });

  test('student role cannot manage departments', async () => {
    const res = await request(app)
      .get('/api/departments')
      .set(bearer(studentToken));

    expect(res.status).toBe(403);
  });

  test('lists departments', async () => {
    await Department.create([makeDepartment(), makeDepartment()]);

    const res = await request(app)
      .get('/api/departments')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  test('searches departments by name', async () => {
    await Department.create(makeDepartment());
    await Department.create({
      ...makeDepartment(),
      name: 'Electrical Engineering'
    });

    const res = await request(app)
      .get('/api/departments?q=Electrical')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Electrical Engineering');
  });

  test('gets department by ID', async () => {
    const department = await Department.create(makeDepartment());

    const res = await request(app)
      .get(`/api/departments/${department.id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(department.id);
  });

  test('updates department head', async () => {
    const department = await Department.create(makeDepartment());

    const res = await request(app)
      .patch(`/api/departments/${department.id}`)
      .set(bearer(adminToken))
      .send({ head: 'Updated Department Head' });

    expect(res.status).toBe(200);
    expect(res.body.data.head).toBe('Updated Department Head');
  });

  test('deletes a department', async () => {
    const department = await Department.create(makeDepartment());

    const res = await request(app)
      .delete(`/api/departments/${department.id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(204);
    expect(await Department.countDocuments()).toBe(0);
  });

  test('returns 404 for missing department', async () => {
    const id = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/departments/${id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(404);
  });
});
