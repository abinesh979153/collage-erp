const service = require('./assignments.service');

exports.create = async (req, res, next) => {
  try {
    const assignment = await service.create(req.body, req.user.id);

    res.status(201).json({ data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const assignments = await service.list(req.query);

    res.json({
      data: assignments,
      meta: { total: assignments.length }
    });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const assignment = await service.get(req.params.id);

    res.json({ data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const assignment = await service.update(req.params.id, req.body);

    res.json({ data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
