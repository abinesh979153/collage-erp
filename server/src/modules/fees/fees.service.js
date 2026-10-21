const FeeLedger = require('../../models/FeeLedger');
const AppError = require('../../utils/AppError');

async function create(data) {
  return FeeLedger.create(data);
}

async function list(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const filter = {};

  if (query.studentId) filter.studentId = query.studentId;
  if (query.type) filter.type = query.type;

  const [data, total] = await Promise.all([
    FeeLedger.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    FeeLedger.countDocuments(filter)
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
  const entry = await FeeLedger.findById(id).lean();

  if (!entry) {
    throw new AppError('Fee ledger entry not found', 404);
  }

  return entry;
}

async function update(id, changes) {
  const entry = await FeeLedger.findByIdAndUpdate(
    id,
    changes,
    { new: true, runValidators: true }
  ).lean();

  if (!entry) {
    throw new AppError('Fee ledger entry not found', 404);
  }

  return entry;
}

async function remove(id) {
  const entry = await FeeLedger.findByIdAndDelete(id);

  if (!entry) {
    throw new AppError('Fee ledger entry not found', 404);
  }

  return entry;
}

module.exports = { create, list, get, update, remove };
