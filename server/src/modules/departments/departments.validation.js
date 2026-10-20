const { z } = require('zod');
const { objectId, name } = require('../../utils/schemas');
const { listQuerySchema } = require('../../utils/pagination');

const id = z.object({ id: objectId });

const fields = {
  name,
  code: z.string().trim().min(2).max(20)
    .transform(v => v.toUpperCase()),
  head: z.string().trim().min(2).max(100)
};

module.exports = {
  create: {
    body: z.object(fields).strict()
  },
  list: {
    query: listQuerySchema(['createdAt', 'name', 'code', 'head'])
      .extend({
        q: z.string().trim().min(1).max(50).optional()
      })
  },
  get: { params: id },
  update: {
    params: id,
    body: z.object({
      name: fields.name.optional(),
      code: fields.code.optional(),
      head: fields.head.optional()
    }).strict().refine(
      v => Object.keys(v).length > 0,
      'At least one field is required'
    )
  }
};
