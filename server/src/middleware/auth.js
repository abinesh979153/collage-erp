const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccess } = require('../utils/tokens');
const { User } = require('../models');

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'Authentication required');

  let payload;
  try {
    payload = verifyAccess(token);
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user || !user.isActive || user.tokenVersion !== payload.tv) {
    throw new AppError(401, 'Invalid or expired token');
  }
  req.user = { id: String(user._id), role: user.role, name: user.name, email: user.email };
  next();
});

// Role restriction. Record-level ownership checks live in each service.
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError(401, 'Authentication required'));
  if (!roles.includes(req.user.role)) return next(new AppError(403, 'Insufficient permissions'));
  next();
};

module.exports = { authenticate, authorize };
