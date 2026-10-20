const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
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
    maxlength: 20
  },
  head: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  }
}, { timestamps: true });

schema.index({ code: 1 }, { unique: true });
schema.index({ name: 1 });

module.exports = mongoose.models.Department ||
  mongoose.model('Department', schema);
