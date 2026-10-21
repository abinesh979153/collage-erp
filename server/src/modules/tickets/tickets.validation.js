const { z } = require('zod');

module.exports = {
  create: {
    body: z.object({
      subject: z.string().trim().min(1).max(200),
      priority: z.enum(['low', 'medium', 'high']),
      message: z.string().trim().min(1).max(5000)
    }).strict()
  },
  id: {
    params: z.object({
      id: z.string().regex(/^[a-fA-F0-9]{24}$/)
    })
  },
  update: {
    params: z.object({
      id: z.string().regex(/^[a-fA-F0-9]{24}$/)
    }),
    body: z.object({
      status: z.enum(['open', 'in-progress', 'resolved', 'closed'])
    }).strict()
  }
};
