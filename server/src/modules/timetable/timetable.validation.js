const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const fields = {
  day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
  period: z.coerce.number().int().min(1).max(12),
  courseId: objectId,
  room: z.string().trim().min(1).max(50)
};

module.exports = {
  create: {
    body: z.object(fields).strict()
  },
  list: {
    query: z.object({
      day: fields.day.optional(),
      courseId: objectId.optional()
    })
  },
  get: {
    params: z.object({ id: objectId })
  },
  update: {
    params: z.object({ id: objectId }),
    body: z.object({
      day: fields.day.optional(),
      period: fields.period.optional(),
      courseId: fields.courseId.optional(),
      room: fields.room.optional()
    }).strict().refine(
      data => Object.keys(data).length > 0,
      'At least one field is required'
    )
  }
};
