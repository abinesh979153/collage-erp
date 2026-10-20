const mongoose = require('mongoose');
const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');
const { Course } = require('../src/models');

describe('courses API', () => {
  let adminToken;
  let studentToken;

  const makeCourse = () => ({
    title: 'Data Structures',
    code: `CS${new mongoose.Types.ObjectId().toString().slice(-6)}`,
    department: 'CSE',
    credits: 4
  });

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    const student = await createUser({ role: 'student' });

    adminToken = await tokenFor(admin);
    studentToken = await tokenFor(student);
  });

  test('admin creates a course', async () => {
    const body = makeCourse();

    const res = await request(app)
      .post('/api/courses')
      .set(bearer(adminToken))
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe(body.title);
    expect(res.body.data.code).toBe(body.code.toUpperCase());
    expect(await Course.countDocuments()).toBe(1);
  });

  test('course code is converted to uppercase', async () => {
    const body = { ...makeCourse(), code: 'cs101' };

    const res = await request(app)
      .post('/api/courses')
      .set(bearer(adminToken))
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('CS101');
  });

  test('rejects invalid course data', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set(bearer(adminToken))
      .send({ title: 'A', code: 'X', credits: 99 });

    expect(res.status).toBe(400);
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/courses');

    expect(res.status).toBe(401);
  });

  test('student role cannot manage courses', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set(bearer(studentToken));

    expect(res.status).toBe(403);
  });

  test('lists courses', async () => {
    await Course.create([makeCourse(), makeCourse()]);

    const res = await request(app)
      .get('/api/courses')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  test('searches courses by title', async () => {
    await Course.create(makeCourse());
    await Course.create({
      ...makeCourse(),
      title: 'Operating Systems'
    });

    const res = await request(app)
      .get('/api/courses?q=Operating')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Operating Systems');
  });

  test('gets course by ID', async () => {
    const course = await Course.create(makeCourse());

    const res = await request(app)
      .get(`/api/courses/${course.id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(course.id);
  });

  test('updates course credits', async () => {
    const course = await Course.create(makeCourse());

    const res = await request(app)
      .patch(`/api/courses/${course.id}`)
      .set(bearer(adminToken))
      .send({ credits: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.credits).toBe(3);
  });

  test('deletes a course', async () => {
    const course = await Course.create(makeCourse());

    const res = await request(app)
      .delete(`/api/courses/${course.id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(204);
    expect(await Course.countDocuments()).toBe(0);
  });

  test('returns 404 for missing course', async () => {
    const id = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/courses/${id}`)
      .set(bearer(adminToken));

    expect(res.status).toBe(404);
  });
});
