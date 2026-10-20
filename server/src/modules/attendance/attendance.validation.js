const { z } = require('zod');

const objectId = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  'Invalid ID'
);

const status = z.enum(['present', 'absent', 'late']);

const create = {
  body: z.object({
    student: objectId,
    course: objectId,
    date: z.coerce.date(),
    status
  }).strict()
};

const list = {
  query: z.object({
    student: objectId.optional(),
    course: objectId.optional(),
    status: status.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  }).strict()
};

const get = {
  params: z.object({
    id: objectId
  }).strict()
};

const update = {
  params: z.object({
    id: objectId
  }).strict(),
  body: z.object({
    date: z.coerce.date().optional(),
    status: status.optional()
  }).strict().refine(
    (data) => Object.keys(data).length > 0,
    'At least one field is required'
  )
};

module.exports = { create, list, get, update };
