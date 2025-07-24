const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  statement: {
    type: String,
    required: true
  },

  inputFormat: String,
  outputFormat: String,
  sampleInput: String,
  sampleOutput: String,

  testCases: [{
    input: String,
    output: String,
    hidden: { type: Boolean, default: true }
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },

  assignedTo: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);
