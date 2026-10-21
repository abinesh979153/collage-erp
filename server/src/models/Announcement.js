const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 150
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 5000
  },
  audience: {
    type: String,
    enum: ['all', 'students', 'faculty'],
    required: true,
    default: 'all'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

schema.index({ createdAt: -1 });

module.exports = mongoose.models.Announcement ||
  mongoose.model('Announcement', schema);
