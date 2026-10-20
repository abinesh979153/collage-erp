const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  rollNo: { type: String, required: true, trim: true, uppercase: true, maxlength: 30 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  department: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  year: { type: Number, required: true, min: 1, max: 6 }
}, { timestamps: true });

schema.index({ rollNo: 1 }, { unique: true });
schema.index({ email: 1 }, { unique: true });
schema.index({ name: 1 });

module.exports = mongoose.models.Student || mongoose.model('Student', schema);
