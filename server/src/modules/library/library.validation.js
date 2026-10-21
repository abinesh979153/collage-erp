const { z } = require('zod');
const { objectId } = require('../../utils/schemas');

module.exports = {
  create: {
    body: z.object({
      title: z.string().trim().min(1).max(200),
      author: z.string().trim().min(1).max(150),
      isbn: z.string().trim().min(1).max(20),
      copies: z.coerce.number().int().min(0)
    }).strict()
  },

  list: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional()
    })
  },

  get: {
    params: z.object({
      id: objectId
    })
  },

  update: {
    params: z.object({
      id: objectId
    }),
    body: z.object({
      title: z.string().trim().min(1).max(200).optional(),
      author: z.string().trim().min(1).max(150).optional(),
      isbn: z.string().trim().min(1).max(20).optional(),
      copies: z.coerce.number().int().min(0).optional()
    }).strict().refine(
      value => Object.keys(value).length > 0,
      'At least one field is required'
    )
  }
};
