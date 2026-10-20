const { z } = require('zod');
const { objectId, email, name } = require('../../utils/schemas');
const { listQuerySchema } = require('../../utils/pagination');

const id = z.object({ id: objectId });
const fields = {
  name,
  rollNo: z.string().trim().min(1).max(30).transform(v => v.toUpperCase()),
  email,
  department: z.string().trim().min(2).max(100),
  year: z.number().int().min(1).max(6)
};

module.exports = {
  create: { body: z.object(fields).strict() },
  list: {
    query: listQuerySchema(
      ['createdAt', 'name', 'rollNo', 'department', 'year']
    ).extend({
      q: z.string().trim().min(1).max(50).optional(),
      department: z.string().trim().min(1).max(100).optional(),
      year: z.coerce.number().int().min(1).max(6).optional()
    })
  },
  get: { params: id },
  update: {
    params: id,
    body: z.object({
      name: fields.name.optional(),
      rollNo: fields.rollNo.optional(),
      email: fields.email.optional(),
      department: fields.department.optional(),
      year: fields.year.optional()
    }).strict().refine(v => Object.keys(v).length > 0, 'At least one field is required')
  }
};
