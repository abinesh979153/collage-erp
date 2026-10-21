const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 10000
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

schema.index({ assignment: 1, student: 1 }, { unique: true });
schema.index({ student: 1, submittedAt: -1 });

module.exports = mongoose.models.Submission ||
  mongoose.model('Submission', schema);
