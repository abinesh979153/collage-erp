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
  assessment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

schema.pre('validate', function () {
  if (
    this.marksObtained != null &&
    this.maxMarks != null &&
    this.marksObtained > this.maxMarks
  ) {
    this.invalidate(
      'marksObtained',
      'Marks obtained cannot exceed maximum marks'
    );
  }
});

schema.index(
  { student: 1, course: 1, assessment: 1 },
  { unique: true }
);

module.exports = mongoose.models.Grade ||
  mongoose.model('Grade', schema);
