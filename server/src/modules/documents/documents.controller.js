const documentService = require('./documents.service');

async function list(req, res, next) {
  try {
    res.json(await documentService.list());
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const document = await documentService.create(
      req.valid.body,
      req.user.id
    );

    res.status(201).json({ data: document });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const document = await documentService.update(
      req.valid.params.id,
      req.valid.body
    );

    res.json({ data: document });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    res.json(
      await documentService.remove(req.valid.params.id)
    );
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, update, remove };
