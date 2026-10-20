const env = require('./config/env');
const { connectDb } = require('./config/db');
const app = require('./app');
require('./models');

(async () => {
  await connectDb();
  const server = app.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
