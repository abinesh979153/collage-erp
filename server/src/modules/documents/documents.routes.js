const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const validation = require('./documents.validation');
const controller = require('./documents.controller');

router.use(authenticate);

router.get('/', controller.list);

router.post(
  '/',
  authorize('admin', 'faculty'),
  validate(validation.create),
  controller.create
);

router.patch(
  '/:id',
  authorize('admin', 'faculty'),
  validate(validation.update),
  controller.update
);

router.delete(
  '/:id',
  authorize('admin'),
  validate(validation.id),
  controller.remove
);

module.exports = router;
