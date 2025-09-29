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
  contestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contest' 
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
  obtainedMarks:{
    type:Number,
    default:0,
  },
  totalMarks:{
    type:Number,
    default:0,
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
