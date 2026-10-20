const mongoose = require('mongoose');
const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');
const {
  Student,
  Course,
  Grade,
  Faculty,
  FacultyCourseAssignment
} = require('../src/models');

describe('faculty grade permissions', () => {
  let facultyToken;
  let faculty;
  let student;
  let assignedCourse;
  let otherCourse;

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    const facultyUser = await createUser({ role: 'faculty' });
    const studentUser = await createUser({ role: 'student' });

    facultyToken = await tokenFor(facultyUser);

    faculty = await Faculty.create({
      user: facultyUser._id,
      name: 'Test Faculty',
      email: facultyUser.email,
      department: 'CSE',
      designation: 'Assistant Professor'
    });

    student = await Student.create({
      name: 'Test Student',
      rollNo: `ST${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      email: studentUser.email,
      department: 'CSE',
      year: 2
    });

    assignedCourse = await Course.create({
      title: 'Data Structures',
      code: `CS${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      department: 'CSE',
      credits: 4
    });

    otherCourse = await Course.create({
      title: 'Computer Networks',
      code: `CS${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      department: 'CSE',
      credits: 3
    });

    await FacultyCourseAssignment.create({
      faculty: faculty._id,
      course: assignedCourse._id,
      assignedBy: admin._id
    });
  });

  async function createGrade(course) {
    return Grade.create({
      student: student._id,
      course: course._id,
      assessment: 'Internal 1',
      marksObtained: 80,
      maxMarks: 100,
      enteredBy: new mongoose.Types.ObjectId()
    });
  }

  test('faculty sees grades only for assigned courses', async () => {
    await createGrade(assignedCourse);
    await createGrade(otherCourse);

    const res = await request(app)
      .get('/api/grades')
      .set(bearer(facultyToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(String(res.body.data[0].course._id))
      .toBe(String(assignedCourse._id));
  });

  test('faculty can access a grade for an assigned course', async () => {
    const grade = await createGrade(assignedCourse);

    const res = await request(app)
      .get(`/api/grades/${grade._id}`)
      .set(bearer(facultyToken));

    expect(res.status).toBe(200);
  });

  test('faculty cannot access a grade for an unassigned course', async () => {
    const grade = await createGrade(otherCourse);

    const res = await request(app)
      .get(`/api/grades/${grade._id}`)
      .set(bearer(facultyToken));

    expect(res.status).toBe(403);
  });
});
