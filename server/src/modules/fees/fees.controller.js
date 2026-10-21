const service = require('./fees.service');

async function create(req, res, next) {
  try {
    const entry = await service.create(req.valid.body);
    res.status(201).json({ data: entry });
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
    const entry = await service.get(req.valid.params.id);
    res.json({ data: entry });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const entry = await service.update(
      req.valid.params.id,
      req.valid.body
    );
    res.json({ data: entry });
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
