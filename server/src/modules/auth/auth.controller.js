const asyncHandler = require('../../utils/asyncHandler');
const service = require('./auth.service');

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.valid.body;
  res.json(await service.login(email, password));
});
exports.refresh = asyncHandler(async (req, res) => {
  res.json(await service.refresh(req.valid.body.refreshToken));
});
exports.logout = asyncHandler(async (req, res) => {
  await service.logout(req.user.id);
  res.status(204).end();
});
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.valid.body;
  res.json(await service.changePassword(req.user.id, currentPassword, newPassword));
});
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: await service.me(req.user.id) });
});
