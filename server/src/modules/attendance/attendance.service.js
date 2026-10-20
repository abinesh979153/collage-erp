const mongoose = require('mongoose');
const { Attendance, Student, Course, Enrollment } = require('../../models');
const AppError = require('../../utils/AppError');
const { paginate } = require('../../utils/pagination');

async function create(data, userId) {
  const [student, course, enrollment] = await Promise.all([
    Student.findById(data.student),
    Course.findById(data.course),
    Enrollment.findOne({
      student: data.student,
      course: data.course,
      status: 'active'
    })
  ]);

  if (!student) throw new AppError(404, 'Student not found');
  if (!course) throw new AppError(404, 'Course not found');
  if (!enrollment) {
    throw new AppError(400, 'Student is not actively enrolled in this course');
  }

  return Attendance.create({
    ...data,
    markedBy: userId
  });
}

async function list(query, user) {
  const filter = {};

  if (query.student) filter.student = query.student;
  if (query.course) filter.course = query.course;
  if (query.status) filter.status = query.status;

  // Students can only see their own attendance once linked to a Student record.
  if (user.role === 'student') {
    const student = await Student.findOne({ email: user.email });
    if (!student) return { data: [], meta: { total: 0, totalPages: 0 } };
    filter.student = student._id;
  }

  const { page, limit } = query;
  const result = await paginate(
    Attendance,
    filter,
    { page, limit, sort: 'date', order: 'desc' }
  );

  await Attendance.populate(result.data, [
    { path: 'student', select: 'name rollNo email' },
    { path: 'course', select: 'title code' }
  ]);

  return result;
}

async function get(id, user) {
  const record = await Attendance.findById(id)
    .populate('student', 'name rollNo email')
    .populate('course', 'title code');

  if (!record) throw new AppError(404, 'Attendance record not found');

  if (user.role === 'student') {
    const student = await Student.findOne({ email: user.email });
    if (!student || String(record.student._id) !== String(student._id)) {
      throw new AppError(403, 'You cannot view another student attendance');
    }
  }

  return record;
}

async function update(id, data) {
  const record = await Attendance.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!record) throw new AppError(404, 'Attendance record not found');
  return record;
}

async function remove(id) {
  const record = await Attendance.findByIdAndDelete(id);
  if (!record) throw new AppError(404, 'Attendance record not found');
}

module.exports = { create, list, get, update, remove };
