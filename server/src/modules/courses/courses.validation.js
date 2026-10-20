const { z } = require('zod');
const { objectId, name } = require('../../utils/schemas');
const { listQuerySchema } = require('../../utils/pagination');

const id = z.object({ id: objectId });

const fields = {
  title: name,
  code: z.string().trim().min(2).max(20)
    .transform(v => v.toUpperCase()),
  department: z.string().trim().min(2).max(100),
  credits: z.coerce.number().int().min(1).max(10)
};

module.exports = {
  create: {
    body: z.object(fields).strict()
  },
  list: {
    query: listQuerySchema(['createdAt', 'title', 'code', 'department', 'credits'])
      .extend({
        q: z.string().trim().min(1).max(50).optional()
      })
  },
  get: { params: id },
  update: {
    params: id,
    body: z.object({
      title: fields.title.optional(),
      code: fields.code.optional(),
      department: fields.department.optional(),
      credits: fields.credits.optional()
    }).strict().refine(
      v => Object.keys(v).length > 0,
      'At least one field is required'
    )
  }
};
