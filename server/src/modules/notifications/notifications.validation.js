const { z } = require('zod');

module.exports = {
  list: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      read: z.enum(['true', 'false']).optional()
    })
  }
};
