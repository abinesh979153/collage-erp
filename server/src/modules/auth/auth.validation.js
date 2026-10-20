const { z } = require('zod');
const { email, password } = require('../../utils/schemas');

module.exports = {
  login: { body: z.object({ email, password: z.string().min(1).max(200) }).strict() },
  refresh: { body: z.object({ refreshToken: z.string().min(20).max(2000) }).strict() },
  changePassword: {
    body: z.object({ currentPassword: z.string().min(1).max(200), newPassword: password }).strict(),
  },
};
