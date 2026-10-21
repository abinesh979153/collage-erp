const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 5000
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, { timestamps: true });

schema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.models.SupportTicket ||
  mongoose.model('SupportTicket', schema);
