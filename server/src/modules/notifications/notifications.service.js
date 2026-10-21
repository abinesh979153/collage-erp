const Notification = require('../../models/Notification');

async function list(userId, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);

  const filter = { userId };

  if (query.read === 'true') filter.read = true;
  if (query.read === 'false') filter.read = false;

  const [data, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter)
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

module.exports = { list };
