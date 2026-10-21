const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 150
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['exam', 'holiday', 'event'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

schema.index({ date: 1 });

module.exports = mongoose.models.CalendarEvent ||
  mongoose.model('CalendarEvent', schema);
