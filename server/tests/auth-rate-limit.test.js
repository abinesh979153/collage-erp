const { app, request } = require('./helpers');
const env = require('../src/config/env');

describe('authentication rate limiting', () => {
  test('blocks login requests after the configured limit', async () => {
    let lastResponse;

    for (let i = 0; i <= env.LOGIN_RATE_LIMIT_MAX; i++) {
      lastResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rate-limit-test@example.test',
          password: 'WrongPassword1'
        });
    }

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.body.error.message)
      .toMatch(/too many attempts/i);
  });
});
