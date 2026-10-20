require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const User = require('../src/models/User');
const env = require('../src/config/env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const email = (await ask('Admin email: ')).trim().toLowerCase();
  const password = await ask('New password (hidden input not supported): ');

  if (password.length < 10 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)) {
    throw new Error(
      'Password needs 10+ characters, lowercase, uppercase and a number.'
    );
  }

  await mongoose.connect(env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  const user = await User.findOneAndUpdate(
    { email, role: 'admin' },
    {
      $set: { passwordHash, failedLoginAttempts: 0 },
      $unset: { lockUntil: 1 },
      $inc: { tokenVersion: 1 },
    },
    { new: true }
  );

  if (!user) {
    throw new Error('Admin account not found for that email.');
  }

  console.log('Admin password updated successfully.');
}

main()
  .catch((error) => {
    console.error('Reset failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  });
