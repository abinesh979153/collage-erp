const AppError = require('../../utils/AppError');
const { Enrollment, Student, Course } = require('../../models');
const { paginate } = require('../../utils/pagination');

async function create(body) {
  const [student, course] = await Promise.all([
    Student.findById(body.student),
    Course.findById(body.course)
  ]);

  if (!student) throw new AppError(404, 'Student not found');
  if (!course) throw new AppError(404, 'Course not found');

  try {
    return await Enrollment.create(body);
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(409, 'Student is already enrolled in this course');
    }
    throw err;
  }
}

async function list(query) {
  const filter = {};

  if (query.student) filter.student = query.student;
  if (query.course) filter.course = query.course;
  if (query.status) filter.status = query.status;

  return paginate(Enrollment, filter, query);
}

async function get(id) {
  const enrollment = await Enrollment.findById(id);
  if (!enrollment) throw new AppError(404, 'Enrollment not found');
  return enrollment;
}

async function update(id, changes) {
  const enrollment = await Enrollment.findByIdAndUpdate(
    id,
    { $set: changes },
    { new: true, runValidators: true }
  );

  if (!enrollment) throw new AppError(404, 'Enrollment not found');
  return enrollment;
}

async function remove(id) {
  const enrollment = await Enrollment.findByIdAndDelete(id);
  if (!enrollment) throw new AppError(404, 'Enrollment not found');
}

module.exports = { create, list, get, update, remove };
