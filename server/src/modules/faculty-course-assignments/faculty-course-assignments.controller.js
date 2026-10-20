const asyncHandler = require('../../utils/asyncHandler');
const service = require('./faculty-course-assignments.service');

exports.create = asyncHandler(async (req, res) => {
  const data = await service.create(
    req.valid.body,
    req.user.id
  );

  res.status(201).json({ data });
});

exports.list = asyncHandler(async (req, res) => {
  res.json({
    data: await service.list()
  });
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(req.valid.params.id);
  res.status(204).end();
});
