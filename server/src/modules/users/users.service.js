const bcrypt = require('bcryptjs');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const { User } = require('../../models');
const { paginate, escapeRegex } = require('../../utils/pagination');

async function create({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  // Unique index on email is the source of truth; E11000 is mapped to 409 centrally.
  return User.create({ name, email, passwordHash, role });
}

async function list(query) {
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.isActive) filter.isActive = query.isActive === 'true';
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  return paginate(User, filter, query);
}

async function get(id) {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

async function assertNotLastAdmin(target) {
  const others = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: target._id } });
  if (others === 0) throw new AppError(409, 'Cannot remove the last active admin');
}

async function update(actor, id, changes) {
  const target = await User.findById(id);
  if (!target) throw new AppError(404, 'User not found');

  const roleChanges = changes.role !== undefined && changes.role !== target.role;
  const deactivating = changes.isActive === false && target.isActive;
  const sensitive = roleChanges || deactivating || (changes.isActive === true && !target.isActive);

  if (String(target._id) === actor.id && (roleChanges || deactivating)) {
    throw new AppError(400, 'You cannot change your own role or deactivate yourself');
  }
  if (target.role === 'admin' && target.isActive && (roleChanges || deactivating)) {
    await assertNotLastAdmin(target);
  }

  const update = { $set: changes };
  if (sensitive) update.$inc = { tokenVersion: 1 }; // force re-login after role/status change
  return User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
}

async function resetPassword(id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { passwordHash, failedLoginAttempts: 0 }, $unset: { lockUntil: 1 }, $inc: { tokenVersion: 1 } },
    { new: true }
  );
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

module.exports = { create, list, get, update, resetPassword };
