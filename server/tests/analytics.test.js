const {
  app, request, createUser, tokenFor, bearer
} = require('./helpers');
const { User } = require('../src/models');

describe('analytics API', () => {
  let adminToken;

  beforeEach(async () => {
    const admin = await createUser({ role: 'admin' });
    adminToken = await tokenFor(admin);
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/analytics/summary');

    expect(res.status).toBe(401);
  });

  test('returns dashboard summary for an authenticated user', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('cards');
    expect(res.body.data).toHaveProperty('series');
    expect(res.body.data.cards).toHaveLength(4);
    expect(res.body.data.series).toHaveLength(3);
  });

  test('counts active users by role', async () => {
    await User.create([
      {
        name: 'Analytics Student',
        email: 'analytics-student@example.test',
        passwordHash: 'test-hash',
        role: 'student',
        isActive: true
      },
      {
        name: 'Analytics Faculty',
        email: 'analytics-faculty@example.test',
        passwordHash: 'test-hash',
        role: 'faculty',
        isActive: true
      },
      {
        name: 'Inactive Student',
        email: 'inactive-student@example.test',
        passwordHash: 'test-hash',
        role: 'student',
        isActive: false
      }
    ]);

    const res = await request(app)
      .get('/api/analytics/summary')
      .set(bearer(adminToken));

    expect(res.status).toBe(200);

    const cards = Object.fromEntries(
      res.body.data.cards.map((card) => [card.label, card.value])
    );

    expect(cards.Students).toBe(1);
    expect(cards.Faculty).toBe(1);
    expect(cards.Admins).toBe(1);
    expect(cards['Active Accounts']).toBe(3);
  });
});
