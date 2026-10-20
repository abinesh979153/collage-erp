const bcrypt = require('bcryptjs');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const { User } = require('../../models');
const { signAccess, signRefresh, verifyRefresh } = require('../../utils/tokens');

// Used to equalise timing when the account does not exist.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser', env.BCRYPT_ROUNDS);

function issueTokens(user) {
  return { accessToken: signAccess(user), refreshToken: signRefresh(user), tokenType: 'Bearer' };
}

async function login(email, password) {
  const user = await User.findOne({ email }).select('+passwordHash +tokenVersion +failedLoginAttempts +lockUntil');
  if (!user || !user.isActive) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError(401, 'Invalid email or password');
  }
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError(423, 'Account temporarily locked. Try again later.');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    // Atomic increment so concurrent guesses are all counted.
    const updated = await User.findOneAndUpdate(
      { _id: user._id },
      { $inc: { failedLoginAttempts: 1 } },
      { new: true }
    ).select('+failedLoginAttempts');
    if (updated.failedLoginAttempts >= env.LOGIN_MAX_ATTEMPTS) {
      await User.updateOne(
        { _id: user._id },
        { $set: { lockUntil: new Date(Date.now() + env.LOGIN_LOCK_MINUTES * 60000), failedLoginAttempts: 0 } }
      );
    }
    throw new AppError(401, 'Invalid email or password');
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { failedLoginAttempts: 0, lastLoginAt: new Date() }, $unset: { lockUntil: 1 } }
  );
  return { user: user.toJSON(), ...issueTokens(user) };
}

// Rotation: the filter on tokenVersion + $inc makes reuse of a refresh token fail,
// and only one of several concurrent refreshes with the same token can succeed.
async function refresh(token) {
  let payload;
  try {
    payload = verifyRefresh(token);
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }
  const user = await User.findOneAndUpdate(
    { _id: payload.sub, tokenVersion: payload.tv, isActive: true },
    { $inc: { tokenVersion: 1 } },
    { new: true }
  ).select('+tokenVersion');
  if (!user) throw new AppError(401, 'Invalid or expired refresh token');
  return issueTokens(user);
}

async function logout(userId) {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError(400, 'Current password is incorrect');
  }
  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  const updated = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { passwordHash }, $inc: { tokenVersion: 1 } },
    { new: true }
  ).select('+tokenVersion');
  return issueTokens(updated);
}

async function me(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

module.exports = { login, refresh, logout, changePassword, me };
