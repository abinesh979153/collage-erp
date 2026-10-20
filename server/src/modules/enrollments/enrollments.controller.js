const service = require('./enrollments.service');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const create = asyncHandler(async (req, res) => {
  const enrollment = await service.create(req.body);
  res.status(201).json({ data: enrollment });
});

const list = asyncHandler(async (req, res) => {
  const result = await service.list(req.query);
  res.json(result);
});

const get = asyncHandler(async (req, res) => {
  const enrollment = await service.get(req.params.id);
  res.json({ data: enrollment });
});

const update = asyncHandler(async (req, res) => {
  const enrollment = await service.update(req.params.id, req.body);
  res.json({ data: enrollment });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).end();
});

module.exports = { create, list, get, update, remove };
