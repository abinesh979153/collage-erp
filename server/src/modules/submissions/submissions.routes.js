const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const validation = require('./submissions.validation');
const controller = require('./submissions.controller');

router.use(authenticate);

router.get(
  '/',
  authorize('admin', 'faculty', 'student'),
  validate(validation.list),
  controller.list
);

router.get(
  '/:id',
  authorize('admin', 'faculty', 'student'),
  validate(validation.get),
  controller.get
);

router.post(
  '/',
  authorize('student'),
  validate(validation.create),
  controller.create
);

router.patch(
  '/:id',
  authorize('student'),
  validate(validation.update),
  controller.update
);

module.exports = router;
