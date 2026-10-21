const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const v = require('./timetable.validation');
const c = require('./timetable.controller');

router.use(authenticate);

router.get(
  '/',
  authorize('admin', 'faculty', 'student'),
  validate(v.list),
  c.list
);

router.get(
  '/:id',
  authorize('admin', 'faculty', 'student'),
  validate(v.get),
  c.get
);

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
  authorize('admin'),
  validate(v.get),
  c.remove
);

module.exports = router;
