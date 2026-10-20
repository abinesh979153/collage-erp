const { app, request, createUser, loginAs, tokenFor, bearer, PASSWORD } = require('./helpers');
const { User } = require('../src/models');

describe('auth', () => {
  test('login succeeds and never leaks the password hash', async () => {
    const u = await createUser();
    const res = await loginAs(u);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
  });

  test('wrong password and unknown email give the same 401', async () => {
    const u = await createUser();
    const a = await loginAs(u, 'WrongPassword1');
    const b = await request(app).post('/api/auth/login').send({ email: 'nobody@example.test', password: PASSWORD });
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body.error.message).toBe(b.body.error.message);
  });

  test('login validates body (bad email, extra fields)', async () => {
    const r1 = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: 'x' });
    const r2 = await request(app).post('/api/auth/login').send({ email: 'a@b.test', password: 'x', admin: true });
    expect(r1.status).toBe(400);
    expect(r2.status).toBe(400);
  });

  test('account locks after repeated failures, even with the right password', async () => {
    const u = await createUser();
    for (let i = 0; i < 5; i++) await loginAs(u, 'WrongPassword1');
    const res = await loginAs(u);
    expect(res.status).toBe(423);
  });

  test('deactivated users cannot log in', async () => {
    const u = await createUser({ isActive: false });
    expect((await loginAs(u)).status).toBe(401);
  });

  test('protected route requires a valid bearer token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set(bearer('garbage'))).status).toBe(401);
    const u = await createUser();
    const res = await request(app).get('/api/auth/me').set(bearer(await tokenFor(u)));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(u.email);
  });

  test('refresh token cannot be used as an access token', async () => {
    const u = await createUser();
    const { refreshToken } = (await loginAs(u)).body;
    const res = await request(app).get('/api/auth/me').set(bearer(refreshToken));
    expect(res.status).toBe(401);
  });

  test('refresh rotates tokens and rejects reuse of the old one', async () => {
    const u = await createUser();
    const { refreshToken } = (await loginAs(u)).body;
    const first = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(first.status).toBe(200);
    const reuse = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(reuse.status).toBe(401);
  });

  test('concurrent refresh with the same token succeeds exactly once', async () => {
    const u = await createUser();
    const { refreshToken } = (await loginAs(u)).body;
    const results = await Promise.all(
      Array.from({ length: 5 }, () => request(app).post('/api/auth/refresh').send({ refreshToken }))
    );
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
  });

  test('logout invalidates existing access tokens', async () => {
    const u = await createUser();
    const token = await tokenFor(u);
    expect((await request(app).post('/api/auth/logout').set(bearer(token))).status).toBe(204);
    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(401);
  });

  test('change-password enforces current password and password policy', async () => {
    const u = await createUser();
    const token = await tokenFor(u);
    const bad = await request(app).post('/api/auth/change-password').set(bearer(token))
      .send({ currentPassword: 'nope', newPassword: 'NewStr0ngPass1' });
    expect(bad.status).toBe(400);
    const weak = await request(app).post('/api/auth/change-password').set(bearer(token))
      .send({ currentPassword: PASSWORD, newPassword: 'short' });
    expect(weak.status).toBe(400);
    const ok = await request(app).post('/api/auth/change-password').set(bearer(token))
      .send({ currentPassword: PASSWORD, newPassword: 'NewStr0ngPass1' });
    expect(ok.status).toBe(200);
    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(401); // old token revoked
    expect((await loginAs(u, 'NewStr0ngPass1')).status).toBe(200);
  });

  test('token for a user deactivated after issue is rejected', async () => {
    const u = await createUser();
    const token = await tokenFor(u);
    await User.updateOne({ _id: u._id }, { isActive: false });
    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(401);
  });
});
