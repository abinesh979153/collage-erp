const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./reports.controller');

router.get(
  '/export',
  authenticate,
  authorize('admin'),
  controller.exportCsv
);

module.exports = router;
