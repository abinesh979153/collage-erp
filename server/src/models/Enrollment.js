const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 12
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
    lowercase: true
  }
}, { timestamps: true });

schema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.models.Enrollment ||
  mongoose.model('Enrollment', schema);
