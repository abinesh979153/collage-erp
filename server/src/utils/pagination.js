const { z } = require('zod');

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/** Zod query schema with bounded page/limit and allowlisted sort field. */
function listQuerySchema(sortFields, defaultSort = 'createdAt') {
  return z.object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    sort: z.enum(sortFields).default(defaultSort),
    order: z.enum(['asc', 'desc']).default('desc'),
  });
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function paginate(Model, filter, { page, limit, sort, order }, select) {
  const dir = order === 'asc' ? 1 : -1;
  const [data, total] = await Promise.all([
    Model.find(filter, select)
      .sort({ [sort]: dir, _id: dir })
      .skip((page - 1) * limit)
      .limit(limit),
    Model.countDocuments(filter),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

module.exports = { listQuerySchema, paginate, escapeRegex, MAX_LIMIT, DEFAULT_LIMIT };
