const { z } = require('zod');
const { objectId } = require('../../utils/schemas');

const feeTypes = ['fee', 'payment', 'refund'];

module.exports = {
  create: {
    body: z.object({
      studentId: objectId,
      description: z.string().trim().min(2).max(200),
      amount: z.coerce.number().finite().min(0),
      type: z.enum(feeTypes)
    }).strict()
  },

  list: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      studentId: objectId.optional(),
      type: z.enum(feeTypes).optional()
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
      studentId: objectId.optional(),
      description: z.string().trim().min(2).max(200).optional(),
      amount: z.coerce.number().finite().min(0).optional(),
      type: z.enum(feeTypes).optional()
    }).strict().refine(
      value => Object.keys(value).length > 0,
      'At least one field is required'
    )
  }
};
