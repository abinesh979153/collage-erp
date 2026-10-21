const { z } = require('zod');

const documentFields = {
  name: z.string().trim().min(1).max(150),
  category: z.string().trim().min(1).max(100),
  url: z.string().trim().url().max(2048)
};

module.exports = {
  create: {
    body: z.object(documentFields).strict()
  },
  update: {
    params: z.object({
      id: z.string().regex(/^[a-fA-F0-9]{24}$/)
    }),
    body: z.object(documentFields).partial().strict()
      .refine(value => Object.keys(value).length > 0)
  },
  id: {
    params: z.object({
      id: z.string().regex(/^[a-fA-F0-9]{24}$/)
    })
  }
};
