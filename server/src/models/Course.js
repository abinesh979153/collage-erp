const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    minlength: 2,
    maxlength: 20,
    unique: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  }
}, { timestamps: true });

schema.index({ title: 1 });

module.exports = mongoose.models.Course ||
  mongoose.model('Course', schema);
