const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 2000
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

schema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.Notification ||
  mongoose.model('Notification', schema);
