const Grade = require('../../models/Grade');
const Student = require('../../models/Student');
const Course = require('../../models/Course');
const Faculty = require('../../models/Faculty');
const FacultyCourseAssignment = require('../../models/FacultyCourseAssignment');
const AppError = require('../../utils/AppError');

async function getStudentForUser(user) {
  const student = await Student.findOne({
    email: user.email.toLowerCase()
  });

  if (!student) {
    throw new AppError(403, 'Student profile not linked to this account');
  }

  return student;
}

async function getFacultyCourseIds(user) {
  const faculty = await Faculty.findOne({ user: user.id });

  if (!faculty) {
    throw new AppError(403, 'Faculty profile not linked to this account');
  }

  const assignments = await FacultyCourseAssignment.find({
    faculty: faculty._id
  }).select('course');

  return assignments.map(assignment => assignment.course);
}

exports.create = async (data, userId) => {
  const [student, course] = await Promise.all([
    Student.findById(data.student),
    Course.findById(data.course)
  ]);

  if (!student) throw new AppError(404, 'Student not found');
  if (!course) throw new AppError(404, 'Course not found');

  return Grade.create({
    ...data,
    enteredBy: userId
  });
};

exports.list = async (query, user) => {
  const filter = {};

  if (user.role === 'student') {
    const student = await getStudentForUser(user);
    filter.student = student._id;
  } else if (query.student) {
    filter.student = query.student;
  }

  if (user.role === 'faculty') {
    const courseIds = await getFacultyCourseIds(user);
    filter.course = { $in: courseIds };

    if (query.course) {
      filter.course.$in = courseIds.filter(
        id => String(id) === String(query.course)
      );
    }
  } else if (query.course) {
    filter.course = query.course;
  }

  if (query.assessment) filter.assessment = query.assessment;

  return Grade.find(filter)
    .populate('student', 'name email')
    .populate('course', 'title code')
    .sort({ createdAt: -1 });
};

exports.get = async (id, user) => {
  const grade = await Grade.findById(id)
    .populate('student', 'name email')
    .populate('course', 'title code');

  if (!grade) throw new AppError(404, 'Grade not found');

  if (user.role === 'student') {
    const student = await getStudentForUser(user);

    if (
      !grade.student ||
      String(grade.student._id) !== String(student._id)
    ) {
      throw new AppError(403, 'You cannot access another student’s grade');
    }
  }

  if (user.role === 'faculty') {
    const courseIds = await getFacultyCourseIds(user);

    if (
      !grade.course ||
      !courseIds.some(id => String(id) === String(grade.course._id))
    ) {
      throw new AppError(403, 'You cannot access grades for an unassigned course');
    }
  }

  return grade;
};

exports.update = async (id, data) => {
  const grade = await Grade.findById(id);

  if (!grade) throw new AppError(404, 'Grade not found');

  Object.assign(grade, data);
  await grade.save();

  return grade;
};

exports.remove = async (id) => {
  const grade = await Grade.findByIdAndDelete(id);

  if (!grade) throw new AppError(404, 'Grade not found');
};
