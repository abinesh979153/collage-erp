const asyncHandler = require('../../utils/asyncHandler');
const service = require('./departments.service');

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json({
    data: await service.create(req.valid.body)
  });
});

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.list(req.valid.query));
});

exports.get = asyncHandler(async (req, res) => {
  res.json({
    data: await service.get(req.valid.params.id)
  });
});

exports.update = asyncHandler(async (req, res) => {
  res.json({
    data: await service.update(req.valid.params.id, req.valid.body)
  });
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(req.valid.params.id);
  res.status(204).end();
});
