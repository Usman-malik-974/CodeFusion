const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    match: [
      /^[A-Za-z ]{2,50}$/,
      'Name must be 2-50 characters and contain only letters and spaces'
    ]
  },

  rollno:{
    type:Number
  },


  course:{
    type:String,
    enum: ['','BCA', 'MCA'],
  },

  session:{
    type:String
  },

  email: {
    type: String,
    required: [true,"Email is Required"],
    unique: true,
    lowercase: true,
  trim: true,
  match: [
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Please fill a valid email address'
  ]
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    required: [true,"Role is Required"]
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

userSchema.pre('validate', function (next) {
  if (this.role === 'user') {
    if (!this.course) {
      this.invalidate('course', 'Course is required for user role.');
    }
    if (!this.session) {
      this.invalidate('session', 'Session is required for user role.');
    }
    if (!this.rollno) {
      this.invalidate('rollno', 'Roll number is required for user role.');
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
