const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const v = require('./attendance.validation');
const c = require('./attendance.controller');

router.use(authenticate);

router.get('/', validate(v.list), c.list);
router.get('/:id', validate(v.get), c.get);

router.post(
  '/',
  authorize('admin', 'faculty'),
  validate(v.create),
  c.create
);

router.patch(
  '/:id',
  authorize('admin', 'faculty'),
  validate(v.update),
  c.update
);

router.delete(
  '/:id',
  authorize('admin', 'faculty'),
  validate(v.get),
  c.remove
);

module.exports = router;
