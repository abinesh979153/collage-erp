const asyncHandler = require('../../utils/asyncHandler');
const service = require('./users.service');

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json({ user: await service.create(req.valid.body) });
});
exports.list = asyncHandler(async (req, res) => {
  res.json(await service.list(req.valid.query));
});
exports.get = asyncHandler(async (req, res) => {
  res.json({ user: await service.get(req.valid.params.id) });
});
exports.update = asyncHandler(async (req, res) => {
  res.json({ user: await service.update(req.user, req.valid.params.id, req.valid.body) });
});
exports.resetPassword = asyncHandler(async (req, res) => {
  await service.resetPassword(req.valid.params.id, req.valid.body.newPassword);
  res.status(204).end();
});
