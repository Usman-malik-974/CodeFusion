const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  statement: {
    type: String,
    required: true,
    trim: true
  },
  inputFormat: String,
  outputFormat: String,
  sampleInput: String,
  sampleOutput: String,

  tags: [String],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },

  totalMarks:{type:Number,default:0},
  testCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    marks: {type:Number,default:1},
    hidden: { type: Boolean, default: false }
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);