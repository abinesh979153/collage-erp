const ticketService = require('./tickets.service');

async function list(req, res, next) {
  try {
    res.json(await ticketService.list(req.user));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const ticket = await ticketService.create(
      req.valid.body,
      req.user.id
    );
    res.status(201).json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const ticket = await ticketService.updateStatus(
      req.valid.params.id,
      req.valid.body.status
    );
    res.json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, updateStatus };
