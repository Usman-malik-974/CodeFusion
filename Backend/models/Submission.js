const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  passed: {
    type: Number, 
    required: true
  },
  total: {
    type: Number, 
    required: true
  },
  language: {
    type: String, 
    required: true
  },
  code: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
