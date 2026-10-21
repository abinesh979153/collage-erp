const service = require('./timetable.service');

exports.create = async (req, res, next) => {
  try {
    const item = await service.create(req.body, req.user.id);
    res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const items = await service.list(req.query);
    res.json({
      data: items,
      meta: { total: items.length }
    });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await service.get(req.params.id);
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};
