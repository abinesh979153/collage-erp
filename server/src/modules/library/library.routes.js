const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const validation = require('./library.validation');
const controller = require('./library.controller');

router.use(authenticate);

router.get(
  '/books',
  validate(validation.list),
  controller.list
);

router.get(
  '/books/:id',
  validate(validation.get),
  controller.get
);

router.post(
  '/books',
  authorize('admin'),
  validate(validation.create),
  controller.create
);

router.patch(
  '/books/:id',
  authorize('admin'),
  validate(validation.update),
  controller.update
);

router.delete(
  '/books/:id',
  authorize('admin'),
  validate(validation.get),
  controller.remove
);

module.exports = router;
