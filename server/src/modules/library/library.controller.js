const service = require('./library.service');

async function create(req, res, next) {
  try {
    const book = await service.create(req.valid.body);
    res.status(201).json({ data: book });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const result = await service.list(req.valid.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function get(req, res, next) {
  try {
    const book = await service.get(req.valid.params.id);
    res.json({ data: book });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const book = await service.update(
      req.valid.params.id,
      req.valid.body
    );
    res.json({ data: book });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.valid.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, get, update, remove };
