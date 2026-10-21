const { z } = require('zod');
const { objectId } = require('../../utils/schemas');

const eventTypes = ['exam', 'holiday', 'event'];

module.exports = {
  create: {
    body: z.object({
      title: z.string().trim().min(2).max(150),
      date: z.coerce.date(),
      type: z.enum(eventTypes)
    }).strict()
  },

  list: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      type: z.enum(eventTypes).optional()
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
      date: z.coerce.date().optional(),
      type: z.enum(eventTypes).optional()
    }).strict().refine(
      value => Object.keys(value).length > 0,
      'At least one field is required'
    )
  }
};
