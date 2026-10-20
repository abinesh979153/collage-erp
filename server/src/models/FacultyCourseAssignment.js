const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

schema.index({ faculty: 1, course: 1 }, { unique: true });
schema.index({ course: 1, faculty: 1 });

module.exports = mongoose.models.FacultyCourseAssignment ||
  mongoose.model('FacultyCourseAssignment', schema);
