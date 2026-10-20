require('dotenv').config();
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(20).default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().min(1).max(1440).default(15),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(20),
  CORS_ORIGINS: z.string().default(''),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Report variable names only, never values.
  const names = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
  throw new Error(`Invalid or missing environment variables: ${names}`);
}

const env = { ...parsed.data };
env.corsOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
module.exports = Object.freeze(env);
