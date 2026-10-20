const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const v = require('./courses.validation');
const c = require('./courses.controller');

router.use(authenticate, authorize('admin'));

router.post('/', validate(v.create), c.create);
router.get('/', validate(v.list), c.list);
router.get('/:id', validate(v.get), c.get);
router.patch('/:id', validate(v.update), c.update);
router.delete('/:id', validate(v.get), c.remove);

module.exports = router;
