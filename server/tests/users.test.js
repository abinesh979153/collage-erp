const { app, request, createUser, tokenFor, bearer, PASSWORD } = require('./helpers');
const { User } = require('../src/models');

const newUser = (over = {}) => ({
  name: 'New Person', email: 'new.person@example.test', password: PASSWORD, role: 'student', ...over,
});

describe('users (admin only)', () => {
  test.each(['student', 'faculty', 'staff'])('%s is forbidden from every user endpoint', async (role) => {
    const u = await createUser({ role });
    const t = await tokenFor(u);
    const other = await createUser();
    expect((await request(app).get('/api/users').set(bearer(t))).status).toBe(403);
    expect((await request(app).get(`/api/users/${other.id}`).set(bearer(t))).status).toBe(403);
    expect((await request(app).post('/api/users').set(bearer(t)).send(newUser())).status).toBe(403);
    expect((await request(app).patch(`/api/users/${other.id}`).set(bearer(t)).send({ name: 'Hacked' })).status).toBe(403);
  });

  test('unauthenticated requests get 401', async () => {
    expect((await request(app).get('/api/users')).status).toBe(401);
  });

  test('admin creates a user; response hides secrets', async () => {
    const t = await tokenFor(await createUser({ role: 'admin' }));
    const res = await request(app).post('/api/users').set(bearer(t)).send(newUser());
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('new.person@example.test');
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|tokenVersion/);
  });

  test('duplicate email returns 409, also under concurrent creation', async () => {
    const t = await tokenFor(await createUser({ role: 'admin' }));
    const results = await Promise.all(
      Array.from({ length: 4 }, () => request(app).post('/api/users').set(bearer(t)).send(newUser()))
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(3);
    expect(await User.countDocuments({ email: 'new.person@example.test' })).toBe(1);
  });

  test('create validates role, email, password and unknown fields', async () => {
    const t = await tokenFor(await createUser({ role: 'admin' }));
    const post = (b) => request(app).post('/api/users').set(bearer(t)).send(b);
    expect((await post(newUser({ role: 'superuser' }))).status).toBe(400);
    expect((await post(newUser({ email: 'bad' }))).status).toBe(400);
    expect((await post(newUser({ password: 'weak' }))).status).toBe(400);
    expect((await post({ ...newUser(), isActive: false })).status).toBe(400);
  });

  test('list paginates, caps limit, and allowlists sort fields', async () => {
    const t = await tokenFor(await createUser({ role: 'admin' }));
    for (let i = 0; i < 5; i++) await createUser();
    const ok = await request(app).get('/api/users?limit=2&page=2&sort=name&order=asc').set(bearer(t));
    expect(ok.status).toBe(200);
    expect(ok.body.data).toHaveLength(2);
    expect(ok.body.meta).toMatchObject({ page: 2, limit: 2, total: 6, totalPages: 3 });
    expect((await request(app).get('/api/users?limit=101').set(bearer(t))).status).toBe(400);
    expect((await request(app).get('/api/users?limit=0').set(bearer(t))).status).toBe(400);
    expect((await request(app).get('/api/users?page=abc').set(bearer(t))).status).toBe(400);
    expect((await request(app).get('/api/users?sort=passwordHash').set(bearer(t))).status).toBe(400);
    expect((await request(app).get('/api/users?role=hacker').set(bearer(t))).status).toBe(400);
  });

  test('search is treated literally (regex characters are escaped)', async () => {
    const t = await tokenFor(await createUser({ role: 'admin' }));
    await createUser({ name: 'Alice Smith' });
    const res = await request(app).get('/api/users?q=.*').set(bearer(t));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('get rejects malformed ids and returns 404 for unknown ones', async () => {
    const t = await tokenFor(await createUser({ role: 'admin' }));
    expect((await request(app).get('/api/users/not-an-id').set(bearer(t))).status).toBe(400);
    expect((await request(app).get('/api/users/507f1f77bcf86cd799439011').set(bearer(t))).status).toBe(404);
  });

  test('update changes role and revokes that user\'s existing tokens', async () => {
    const admin = await createUser({ role: 'admin' });
    const t = await tokenFor(admin);
    const target = await createUser({ role: 'student' });
    const targetToken = await tokenFor(target);
    const res = await request(app).patch(`/api/users/${target.id}`).set(bearer(t)).send({ role: 'faculty' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('faculty');
    expect((await request(app).get('/api/auth/me').set(bearer(targetToken))).status).toBe(401);
  });

  test('update rejects empty body, unknown fields, and email/password changes', async () => {
    const t = await tokenFor(await createUser({ role: 'admin' }));
    const target = await createUser();
    const patch = (b) => request(app).patch(`/api/users/${target.id}`).set(bearer(t)).send(b);
    expect((await patch({})).status).toBe(400);
    expect((await patch({ email: 'x@example.test' })).status).toBe(400);
    expect((await patch({ passwordHash: 'x' })).status).toBe(400);
  });

  test('admin cannot demote or deactivate themselves', async () => {
    const admin = await createUser({ role: 'admin' });
    await createUser({ role: 'admin' }); // another admin exists
    const t = await tokenFor(admin);
    expect((await request(app).patch(`/api/users/${admin.id}`).set(bearer(t)).send({ role: 'student' })).status).toBe(400);
    expect((await request(app).patch(`/api/users/${admin.id}`).set(bearer(t)).send({ isActive: false })).status).toBe(400);
  });

  test('one admin can deactivate another admin; deactivated admin loses access', async () => {
    const a1 = await createUser({ role: 'admin' });
    const a2 = await createUser({ role: 'admin' });
    const t1 = await tokenFor(a1);
    const t2 = await tokenFor(a2);
    const res = await request(app).patch(`/api/users/${a2.id}`).set(bearer(t1)).send({ isActive: false });
    expect(res.status).toBe(200);
    expect((await request(app).get('/api/users').set(bearer(t2))).status).toBe(401);
    expect(await User.countDocuments({ role: 'admin', isActive: true })).toBe(1);
  });

  test('reset-password replaces the password and revokes sessions', async () => {
    const t = await tokenFor(await createUser({ role: 'admin' }));
    const target = await createUser();
    const targetToken = await tokenFor(target);
    const res = await request(app).post(`/api/users/${target.id}/reset-password`).set(bearer(t))
      .send({ newPassword: 'BrandNewPass9' });
    expect(res.status).toBe(204);
    expect((await request(app).get('/api/auth/me').set(bearer(targetToken))).status).toBe(401);
    const login = await request(app).post('/api/auth/login').send({ email: target.email, password: 'BrandNewPass9' });
    expect(login.status).toBe(200);
  });
});
