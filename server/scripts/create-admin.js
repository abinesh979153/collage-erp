// Bootstraps the first admin from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD env vars.
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { z } = require('zod');
const env = require('../src/config/env');
const { connectDb } = require('../src/config/db');
const { User } = require('../src/models');
const { email, password, name } = require('../src/utils/schemas');

(async () => {
  const input = z
    .object({ name, email, password })
    .parse({ name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  await connectDb();
  if (await User.exists({ email: input.email })) {
    console.log('A user with that email already exists. Nothing changed.');
  } else {
    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
    await User.create({ name: input.name, email: input.email, passwordHash, role: 'admin' });
    console.log('Admin created.');
  }
  await mongoose.disconnect();
})().catch((e) => {
  console.error('create-admin failed:', e.message);
  process.exit(1);
});
