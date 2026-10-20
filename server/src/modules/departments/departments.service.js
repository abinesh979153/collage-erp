const AppError = require('../../utils/AppError');
const { Department } = require('../../models');
const { paginate, escapeRegex } = require('../../utils/pagination');

async function create(body) {
  return Department.create(body);
}

async function list(query) {
  const filter = {};

  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [
      { name: rx },
      { code: rx },
      { head: rx }
    ];
  }

  return paginate(Department, filter, query);
}

async function get(id) {
  const department = await Department.findById(id);
  if (!department) throw new AppError(404, 'Department not found');
  return department;
}

async function update(id, changes) {
  const department = await Department.findByIdAndUpdate(
    id,
    { $set: changes },
    { new: true, runValidators: true }
  );

  if (!department) throw new AppError(404, 'Department not found');
  return department;
}

async function remove(id) {
  const department = await Department.findByIdAndDelete(id);
  if (!department) throw new AppError(404, 'Department not found');
}

module.exports = { create, list, get, update, remove };
