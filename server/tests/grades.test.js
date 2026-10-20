
const mongoose = require('mongoose');
const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');
const { Student, Course, Grade } = require('../src/models');

describe('grades API', () => {
  let adminToken;
  let studentToken;
  let student;
  let course;

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    const user = await createUser({ role: 'student' });

    adminToken = await tokenFor(admin);
    studentToken = await tokenFor(user);

    student = await Student.create({
      name: 'Test Student',
      rollNo: `ST${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      email: user.email,
      department: 'CSE',
      year: 2
    });

    course = await Course.create({
      title: 'Data Structures',
      code: `CS${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      department: 'CSE',
      credits: 4
    });
  });

  async function createGrade(overrides = {}) {
    return Grade.create({
      student: student._id,
      course: course._id,
      assessment: 'Internal 1',
      marksObtained: 80,
      maxMarks: 100,
      enteredBy: new mongoose.Types.ObjectId(),
      ...overrides
    });
  }

  test('requires authentication', async () => {
    const res = await request(app).get('/api/grades');

    expect(res.status).toBe(401);
  });

  test('admin creates a grade', async () => {
    const res = await request(app)
      .post('/api/grades')
      .set(bearer(adminToken))
      .send({
        student: String(student._id),
        course: String(course._id),
        assessment: 'Internal 1',
        marksObtained: 80,
        maxMarks: 100
      });

    expect(res.status).toBe(201);
    expect(res.body.data.marksObtained).toBe(80);
  });

  test('rejects marks greater than maximum marks', async () => {
    const res = await request(app)
      .post('/api/grades')
      .set(bearer(adminToken))
      .send({
        student: String(student._id),
        course: String(course._id),
        assessment: 'Internal 1',
        marksObtained: 120,
        maxMarks: 100
      });

    expect(res.status).toBe(400);
  });

  test('student can see their own grades', async () => {
    await createGrade();

    const res = await request(app)
      .get('/api/grades')
      .set(bearer(studentToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(String(res.body.data[0].student._id))
      .toBe(String(student._id));
  });

  test('student cannot see another student grade by ID', async () => {
    const otherUser = await createUser({ role: 'student' });

    const otherStudent = await Student.create({
      name: 'Other Student',
      rollNo: `ST${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      email: otherUser.email,
      department: 'CSE',
      year: 2
    });

    const grade = await createGrade({
      student: otherStudent._id
    });

    const res = await request(app)
      .get(`/api/grades/${grade._id}`)
      .set(bearer(studentToken));

    expect(res.status).toBe(403);
  });

  test('student cannot create grades', async () => {
    const res = await request(app)
      .post('/api/grades')
      .set(bearer(studentToken))
      .send({
        student: String(student._id),
        course: String(course._id),
        assessment: 'Internal 1',
        marksObtained: 80,
        maxMarks: 100
      });

    expect(res.status).toBe(403);
  });

  test('faculty cannot create grades', async () => {
    const faculty = await createUser({ role: 'faculty' });
    const facultyToken = await tokenFor(faculty);

    const res = await request(app)
      .post('/api/grades')
      .set(bearer(facultyToken))
      .send({
        student: String(student._id),
        course: String(course._id),
        assessment: 'Internal 1',
        marksObtained: 80,
        maxMarks: 100
      });

    expect(res.status).toBe(403);
  });
});
