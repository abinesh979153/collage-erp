const express = require('express');
const router = express.Router();

const controller = require('./fees.controller');
const validation = require('./fees.validation');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');

router.use(authenticate);

router.get(
  '/ledger',
  validate(validation.list),
  controller.list
);

router.get(
  '/ledger/:id',
  validate(validation.get),
  controller.get
);

router.post(
  '/ledger',
  authorize('admin'),
  validate(validation.create),
  controller.create
);

router.patch(
  '/ledger/:id',
  authorize('admin'),
  validate(validation.update),
  controller.update
);

router.delete(
  '/ledger/:id',
  authorize('admin'),
  validate(validation.get),
  controller.remove
);

module.exports = router;
