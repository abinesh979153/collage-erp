const service = require('./submissions.service');

exports.create = async (req, res, next) => {
  try {
    const submission = await service.create(req.body, req.user);
    res.status(201).json({ data: submission });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const submissions = await service.list(req.query, req.user);
    res.json({
      data: submissions,
      meta: { total: submissions.length }
    });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const submission = await service.get(req.params.id, req.user);
    res.json({ data: submission });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const submission = await service.update(req.params.id, req.body, req.user);
    res.json({ data: submission });
  } catch (error) {
    next(error);
  }
};
