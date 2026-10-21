const notificationService = require('./notifications.service');

async function list(req, res, next) {
  try {
    const result = await notificationService.list(
      req.user.id,
      req.valid.query
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { list };
