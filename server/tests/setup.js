const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('../src/models');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongod.getUri());
  await Promise.all(Object.values(mongoose.models).map((m) => m.init())); // build unique indexes
});

afterEach(async () => {
  // Safety: only ever wipe the isolated in-memory database.
  if (process.env.NODE_ENV !== 'test' || mongoose.connection.host === undefined) return;
  if (!mongod || !mongod.getUri().includes(`${mongoose.connection.host}:${mongoose.connection.port}`)) {
    throw new Error('Refusing to clear a database that is not the in-memory test server');
  }
  for (const c of Object.values(mongoose.connection.collections)) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
