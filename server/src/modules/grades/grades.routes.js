const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const v = require('./grades.validation');
const c = require('./grades.controller');

router.use(authenticate);

router.get('/', authorize('admin', 'faculty', 'student'), validate(v.list), c.list);
router.get('/:id', authorize('admin', 'faculty', 'student'), validate(v.get), c.get);
router.post('/', authorize('admin'), validate(v.create), c.create);
router.patch('/:id', authorize('admin'), validate(v.update), c.update);
router.delete('/:id', authorize('admin'), validate(v.get), c.remove);

module.exports = router;
