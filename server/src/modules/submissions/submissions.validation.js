const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

module.exports = {
  create: {
    body: z.object({
      assignmentId: objectId,
      content: z.string().trim().min(1).max(10000)
    }).strict()
  },
  list: {
    query: z.object({
      assignmentId: objectId.optional(),
      studentId: objectId.optional()
    })
  },
  get: {
    params: z.object({ id: objectId })
  },
  update: {
    params: z.object({ id: objectId }),
    body: z.object({
      content: z.string().trim().min(1).max(10000)
    }).strict()
  }
};
