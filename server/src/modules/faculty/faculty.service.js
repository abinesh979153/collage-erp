const AppError = require('../../utils/AppError');
const { Faculty, User } = require('../../models');
const { paginate, escapeRegex } = require('../../utils/pagination');

async function validateFacultyUser(userId, email, excludeFacultyId) {
  const user = await User.findById(userId);

  if (!user || user.role !== 'faculty' || !user.isActive) {
    throw new AppError(400, 'User must be an active faculty account');
  }

  if (user.email.toLowerCase() !== email.toLowerCase()) {
    throw new AppError(400, 'Faculty email must match user email');
  }

  const filter = { user: user._id };

  if (excludeFacultyId) {
    filter._id = { $ne: excludeFacultyId };
  }

  const existing = await Faculty.findOne(filter);

  if (existing) {
    throw new AppError(409, 'User is already linked to another faculty profile');
  }

  return user._id;
}

async function create(body) {
  const data = { ...body };

  if (data.user) {
    data.user = await validateFacultyUser(data.user, data.email);
  }

  return Faculty.create(data);
}

async function list(query) {
  const filter = {};

  if (query.department) {
    filter.department = query.department;
  }

  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [
      { name: rx },
      { email: rx },
      { department: rx },
      { designation: rx }
    ];
  }

  return paginate(Faculty, filter, query);
}

async function get(id) {
  const faculty = await Faculty.findById(id);
  if (!faculty) throw new AppError(404, 'Faculty not found');
  return faculty;
}

async function update(id, changes) {
  const data = { ...changes };
  const current = await Faculty.findById(id);

  if (!current) throw new AppError(404, 'Faculty not found');

  const effectiveEmail = data.email || current.email;

  if (data.user) {
    data.user = await validateFacultyUser(data.user, effectiveEmail, current._id);
  } else if (data.email && current.user) {
    const linkedUser = await User.findById(current.user);

    if (linkedUser && linkedUser.email.toLowerCase() !== data.email.toLowerCase()) {
      throw new AppError(400, 'Faculty email must match linked user email');
    }
  }

  const faculty = await Faculty.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!faculty) throw new AppError(404, 'Faculty not found');
  return faculty;
}

async function remove(id) {
  const faculty = await Faculty.findByIdAndDelete(id);
  if (!faculty) throw new AppError(404, 'Faculty not found');
}

module.exports = { create, list, get, update, remove };
