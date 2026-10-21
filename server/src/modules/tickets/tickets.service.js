const mongoose = require('mongoose');
const SupportTicket = require('../../models/SupportTicket');
const AppError = require('../../utils/AppError');

async function list(user) {
  const filter = user.role === 'admin'
    ? {}
    : { createdBy: user.id };

  const data = await SupportTicket.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email')
    .lean();

  return { data, meta: { total: data.length } };
}

async function create(input, userId) {
  return SupportTicket.create({
    ...input,
    createdBy: userId
  });
}

async function updateStatus(id, status) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid ticket ID', 400);
  }

  const ticket = await SupportTicket.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!ticket) throw new AppError('Ticket not found', 404);

  return ticket;
}

module.exports = { list, create, updateStatus };
