const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const v = require('./users.validation');
const c = require('./users.controller');

// All user-management endpoints are admin-only.
router.use(authenticate, authorize('admin'));

router.post('/', validate(v.create), c.create);
router.get('/', validate(v.list), c.list);
router.get('/:id', validate(v.get), c.get);
router.patch('/:id', validate(v.update), c.update);
router.post('/:id/reset-password', validate(v.resetPassword), c.resetPassword);

module.exports = router;
