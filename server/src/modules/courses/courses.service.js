const AppError = require('../../utils/AppError');
const { Course } = require('../../models');
const { paginate, escapeRegex } = require('../../utils/pagination');

async function create(body) {
  return Course.create(body);
}

async function list(query) {
  const filter = {};

  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [
      { title: rx },
      { code: rx },
      { department: rx }
    ];
  }

  return paginate(Course, filter, query);
}

async function get(id) {
  const course = await Course.findById(id);
  if (!course) throw new AppError(404, 'Course not found');
  return course;
}

async function update(id, changes) {
  const course = await Course.findByIdAndUpdate(
    id,
    { $set: changes },
    { new: true, runValidators: true }
  );

  if (!course) throw new AppError(404, 'Course not found');
  return course;
}

async function remove(id) {
  const course = await Course.findByIdAndDelete(id);
  if (!course) throw new AppError(404, 'Course not found');
}

module.exports = { create, list, get, update, remove };
