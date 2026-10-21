const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    required: true
  },
  period: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

schema.index({ day: 1, period: 1, room: 1 });

module.exports = mongoose.models.Timetable ||
  mongoose.model('Timetable', schema);
