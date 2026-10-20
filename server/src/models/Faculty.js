const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254
  },
  department: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  designation: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  }
}, { timestamps: true });

schema.index({ email: 1 }, { unique: true });
schema.index({ user: 1 }, { unique: true, sparse: true });
schema.index({ name: 1 });

module.exports = mongoose.models.Faculty ||
  mongoose.model('Faculty', schema);
