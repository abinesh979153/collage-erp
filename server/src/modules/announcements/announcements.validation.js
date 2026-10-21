const { z } = require('zod');
const { objectId } = require('../../utils/schemas');

const audiences = ['all', 'students', 'faculty'];

module.exports = {
  create: {
    body: z.object({
      title: z.string().trim().min(2).max(150),
      message: z.string().trim().min(2).max(5000),
      audience: z.enum(audiences).default('all')
    }).strict()
  },

  list: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      audience: z.enum(audiences).optional()
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
      title: z.string().trim().min(2).max(150).optional(),
      message: z.string().trim().min(2).max(5000).optional(),
      audience: z.enum(audiences).optional()
    }).strict().refine(
      value => Object.keys(value).length > 0,
      'At least one field is required'
    )
  }
};
