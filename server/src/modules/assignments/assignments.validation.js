const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

module.exports = {
  create: {
    body: z.object({
      title: z.string().trim().min(2).max(150),
      course: objectId,
      dueDate: z.coerce.date(),
      description: z.string().trim().max(2000).optional().default('')
    }).strict()
  },
  list: {
    query: z.object({
      course: objectId.optional()
    })
  },
  get: {
    params: z.object({ id: objectId })
  },
  update: {
    params: z.object({ id: objectId }),
    body: z.object({
      title: z.string().trim().min(2).max(150).optional(),
      course: objectId.optional(),
      dueDate: z.coerce.date().optional(),
      description: z.string().trim().max(2000).optional()
    }).strict().refine(
      data => Object.keys(data).length > 0,
      'At least one field is required'
    )
  }
};
