const LibraryBook = require('../../models/LibraryBook');
const AppError = require('../../utils/AppError');

async function create(data) {
  const existing = await LibraryBook.findOne({ isbn: data.isbn });

  if (existing) {
    throw new AppError('A book with this ISBN already exists', 409);
  }

  return LibraryBook.create(data);
}

async function list(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);

  const [data, total] = await Promise.all([
    LibraryBook.find()
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    LibraryBook.countDocuments()
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
  const book = await LibraryBook.findById(id).lean();

  if (!book) {
    throw new AppError('Library book not found', 404);
  }

  return book;
}

async function update(id, changes) {
  const book = await LibraryBook.findByIdAndUpdate(
    id,
    changes,
    { new: true, runValidators: true }
  ).lean();

  if (!book) {
    throw new AppError('Library book not found', 404);
  }

  return book;
}

async function remove(id) {
  const book = await LibraryBook.findByIdAndDelete(id);

  if (!book) {
    throw new AppError('Library book not found', 404);
  }

  return book;
}

module.exports = { create, list, get, update, remove };
