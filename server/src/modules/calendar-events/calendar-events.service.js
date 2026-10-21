const CalendarEvent = require('../../models/CalendarEvent');
const AppError = require('../../utils/AppError');

async function create(data, userId) {
  return CalendarEvent.create({
    ...data,
    createdBy: userId
  });
}

async function list(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const filter = {};

  if (query.type) {
    filter.type = query.type;
  }

  const [data, total] = await Promise.all([
    CalendarEvent.find(filter)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CalendarEvent.countDocuments(filter)
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
  const event = await CalendarEvent.findById(id).lean();

  if (!event) {
    throw new AppError('Calendar event not found', 404);
  }

  return event;
}

async function update(id, changes) {
  const event = await CalendarEvent.findByIdAndUpdate(
    id,
    changes,
    { new: true, runValidators: true }
  ).lean();

  if (!event) {
    throw new AppError('Calendar event not found', 404);
  }

  return event;
}

async function remove(id) {
  const event = await CalendarEvent.findByIdAndDelete(id);

  if (!event) {
    throw new AppError('Calendar event not found', 404);
  }

  return event;
}

module.exports = { create, list, get, update, remove };
