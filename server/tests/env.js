// Test-only configuration. These are throwaway values, not real secrets.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://placeholder-replaced-by-memory-server';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789-0123456789';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789-0123456789';
process.env.BCRYPT_ROUNDS = '4';
process.env.LOGIN_MAX_ATTEMPTS = '5';
process.env.LOGIN_RATE_LIMIT_MAX = '1000';
