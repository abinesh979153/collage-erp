const { z } = require('zod');
const { objectId } = require('../../utils/schemas');
const { listQuerySchema } = require('../../utils/pagination');

const id = z.object({ id: objectId });

module.exports = {
  create: {
    body: z.object({
      student: objectId,
      course: objectId,
      semester: z.coerce.number().int().min(1).max(12).optional(),
      enrollmentDate: z.coerce.date().optional(),
      status: z.enum(['active', 'completed', 'cancelled']).optional()
    }).strict()
  },
  list: {
    query: listQuerySchema(['createdAt', 'enrollmentDate', 'status'])
      .extend({
        student: objectId.optional(),
        course: objectId.optional(),
        status: z.enum(['active', 'completed', 'cancelled']).optional()
      })
  },
  get: { params: id },
  update: {
    params: id,
    body: z.object({
      enrollmentDate: z.coerce.date().optional(),
      status: z.enum(['active', 'completed', 'cancelled']).optional()
    }).strict().refine(
      v => Object.keys(v).length > 0,
      'At least one field is required'
    )
  }
};
