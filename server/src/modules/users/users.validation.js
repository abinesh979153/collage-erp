const { z } = require('zod');
const { objectId, email, password, name, ROLES } = require('../../utils/schemas');
const { listQuerySchema } = require('../../utils/pagination');

const idParams = z.object({ id: objectId });

module.exports = {
  create: { body: z.object({ name, email, password, role: z.enum(ROLES) }).strict() },
  list: {
    query: listQuerySchema(['createdAt', 'name', 'email', 'role'], 'createdAt').extend({
      role: z.enum(ROLES).optional(),
      isActive: z.enum(['true', 'false']).optional(),
      q: z.string().trim().min(1).max(50).optional(),
    }),
  },
  get: { params: idParams },
  update: {
    params: idParams,
    body: z
      .object({ name: name.optional(), role: z.enum(ROLES).optional(), isActive: z.boolean().optional() })
      .strict()
      .refine((b) => Object.keys(b).length > 0, 'At least one field is required'),
  },
  resetPassword: { params: idParams, body: z.object({ newPassword: password }).strict() },
};
