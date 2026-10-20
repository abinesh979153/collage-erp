const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const v = require('./faculty-course-assignments.validation');
const c = require('./faculty-course-assignments.controller');

router.use(authenticate, authorize('admin'));

router.get('/', c.list);
router.post('/', validate(v.create), c.create);
router.delete('/:id', validate(v.get), c.remove);

module.exports = router;
