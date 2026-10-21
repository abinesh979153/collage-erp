const Announcement = require('../../models/Announcement');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const AppError = require('../../utils/AppError');

async function create(data, userId) {
  const announcement = await Announcement.create({
    ...data,
    createdBy: userId
  });

  const userFilter = { isActive: true };

  if (announcement.audience === 'students') {
    userFilter.role = 'student';
  } else if (announcement.audience === 'faculty') {
    userFilter.role = 'faculty';
  }

  const recipients = await User.find(userFilter).select('_id').lean();

  if (recipients.length > 0) {
    const message = `New announcement: ${announcement.title} — ${announcement.message}`.slice(0, 2000);

    await Notification.insertMany(
      recipients.map(user => ({
        userId: user._id,
        message,
        read: false
      }))
    );
  }

  return announcement;
}

async function list(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const filter = {};

  if (query.audience) {
    filter.audience = query.audience;
  }

  const [data, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Announcement.countDocuments(filter)
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

async function get(id) {
  const announcement = await Announcement.findById(id).lean();

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  return announcement;
}

async function update(id, changes) {
  const announcement = await Announcement.findByIdAndUpdate(
    id,
    changes,
    { new: true, runValidators: true }
  ).lean();

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  return announcement;
}

async function remove(id) {
  const announcement = await Announcement.findByIdAndDelete(id);

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }
}

module.exports = { create, list, get, update, remove };
