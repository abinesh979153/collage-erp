const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const env = require('../../config/env');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const v = require('./auth.validation');
const c = require('./auth.controller');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts, please try again later' } },
});

router.post('/login', loginLimiter, validate(v.login), c.login);
router.post('/refresh', loginLimiter, validate(v.refresh), c.refresh);
router.post('/logout', authenticate, c.logout);
router.post('/change-password', authenticate, validate(v.changePassword), c.changePassword);
router.get('/me', authenticate, c.me);

module.exports = router;
