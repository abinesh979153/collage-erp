// Validates params/query/body with zod; parsed values are placed on req.valid.
module.exports = (schemas) => (req, _res, next) => {
  try {
    req.valid = {};
    for (const key of ['params', 'query', 'body']) {
      if (schemas[key]) req.valid[key] = schemas[key].parse(req[key] ?? {});
    }
    next();
  } catch (err) {
    next(err);
  }
};
