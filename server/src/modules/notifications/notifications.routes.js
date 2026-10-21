const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const validation = require('./notifications.validation');
const controller = require('./notifications.controller');

router.use(authenticate);

router.get('/', validate(validation.list), controller.list);

module.exports = router;
