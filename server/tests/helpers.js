const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');

const PASSWORD = 'Str0ngPassword1';
let n = 0;

async function createUser(overrides = {}) {
  n += 1;
  return User.create({
    name: `Test User ${n}`,
    email: `user${n}@example.test`,
    passwordHash: await bcrypt.hash(overrides.password || PASSWORD, 4),
    role: 'student',
    ...overrides,
    password: undefined,
  });
}

async function loginAs(user, password = PASSWORD) {
  const res = await request(app).post('/api/auth/login').send({ email: user.email, password });
  return res;
}

async function tokenFor(user) {
  return (await loginAs(user)).body.accessToken;
}

const bearer = (t) => ({ Authorization: `Bearer ${t}` });

module.exports = { app, request, createUser, loginAs, tokenFor, bearer, PASSWORD };
