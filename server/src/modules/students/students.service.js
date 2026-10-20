const AppError = require('../../utils/AppError');
const { Student } = require('../../models');
const { paginate, escapeRegex } = require('../../utils/pagination');

async function create(body) {
  return Student.create(body);
}

async function list(query) {
  const filter = {};
  if (query.department) filter.department = query.department;
  if (query.year) filter.year = query.year;

  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [
      { name: rx }, { rollNo: rx },
      { email: rx }, { department: rx }
    ];
  }
  return paginate(Student, filter, query);
}

async function get(id) {
  const student = await Student.findById(id);
  if (!student) throw new AppError(404, 'Student not found');
  return student;
}

async function update(id, changes) {
  const student = await Student.findByIdAndUpdate(
    id, { $set: changes }, { new: true, runValidators: true }
  );
  if (!student) throw new AppError(404, 'Student not found');
  return student;
}

async function remove(id) {
  const student = await Student.findByIdAndDelete(id);
  if (!student) throw new AppError(404, 'Student not found');
}

module.exports = { create, list, get, update, remove };
