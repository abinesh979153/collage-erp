const mongoose = require('mongoose');
const Document = require('../../models/Document');
const AppError = require('../../utils/AppError');

async function list() {
  const data = await Document.find()
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email')
    .lean();

  return { data, meta: { total: data.length } };
}

async function create(input, userId) {
  const document = await Document.create({
    ...input,
    createdBy: userId
  });

  return document;
}

async function update(id, input) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid document ID', 400);
  }

  const document = await Document.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true
  });

  if (!document) throw new AppError('Document not found', 404);

  return document;
}

async function remove(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid document ID', 400);
  }

  const document = await Document.findByIdAndDelete(id);

  if (!document) throw new AppError('Document not found', 404);

  return { message: 'Document deleted successfully' };
}

module.exports = { list, create, update, remove };
