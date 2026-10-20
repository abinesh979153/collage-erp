const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const controller = require('./analytics.controller');

router.get('/summary', authenticate, controller.summary);

module.exports = router;
