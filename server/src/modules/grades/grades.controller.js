const asyncHandler = require('../../utils/asyncHandler');
const service = require('./grades.service');

exports.create = asyncHandler(async (req, res) => {
  const data = await service.create(
    req.valid.body,
    req.user.id
  );

  res.status(201).json({ data });
});

exports.list = asyncHandler(async (req, res) => {
  res.json({
    data: await service.list(req.valid.query, req.user)
  });
});

exports.get = asyncHandler(async (req, res) => {
  res.json({
    data: await service.get(req.valid.params.id, req.user)
  });
});

exports.update = asyncHandler(async (req, res) => {
  res.json({
    data: await service.update(
      req.valid.params.id,
      req.valid.body
    )
  });
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(req.valid.params.id);
  res.status(204).end();
});
