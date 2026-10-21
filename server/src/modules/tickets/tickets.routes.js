const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const validation = require('./tickets.validation');
const controller = require('./tickets.controller');

router.use(authenticate);

router.get('/', controller.list);

router.post(
  '/',
  validate(validation.create),
  controller.create
);

router.patch(
  '/:id/status',
  authorize('admin'),
  validate(validation.update),
  controller.updateStatus
);

module.exports = router;
