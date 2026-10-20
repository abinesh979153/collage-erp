const { z } = require('zod');

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');
const email = z.string().trim().toLowerCase().email().max(254);
const password = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-z]/, 'Password needs a lowercase letter')
  .regex(/[A-Z]/, 'Password needs an uppercase letter')
  .regex(/[0-9]/, 'Password needs a digit');
const name = z.string().trim().min(2).max(100);
const ROLES = ['admin', 'faculty', 'student', 'staff'];

module.exports = { objectId, email, password, name, ROLES };
