const express = require('express');
const router = express.Router();

const controller = require('./announcements.controller');
const validation = require('./announcements.validation');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');

router.use(authenticate);

router.get(
  '/',
  validate(validation.list),
  controller.list
);

router.get(
  '/:id',
  validate(validation.get),
  controller.get
);

router.post(
  '/',
  authorize('admin'),
  validate(validation.create),
  controller.create
);

router.patch(
  '/:id',
  authorize('admin'),
  validate(validation.update),
  controller.update
);

router.delete(
  '/:id',
  authorize('admin'),
  validate(validation.get),
  controller.remove
);

module.exports = router;
