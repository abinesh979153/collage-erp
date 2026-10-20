const { z } = require('zod');
const { objectId } = require('../../utils/schemas');

module.exports = {
  create: {
    body: z.object({
      faculty: objectId,
      course: objectId
    }).strict()
  },
  get: {
    params: z.object({
      id: objectId
    })
  }
};
