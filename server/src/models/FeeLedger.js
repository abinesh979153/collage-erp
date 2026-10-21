const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: 'Amount must be a valid number'
    }
  },
  type: {
    type: String,
    enum: ['fee', 'payment', 'refund'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.models.FeeLedger ||
  mongoose.model('FeeLedger', schema);
