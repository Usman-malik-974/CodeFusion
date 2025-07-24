const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },

  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],

  assignedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],

  contestsAttempted: [{
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    score: Number,
    submittedAt: Date
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
