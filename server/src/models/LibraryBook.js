const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
  },
  author: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 150
  },
  isbn: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 20
  },
  copies: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Copies must be a whole number'
    }
  }
}, { timestamps: true });

module.exports = mongoose.models.LibraryBook ||
  mongoose.model('LibraryBook', schema);
