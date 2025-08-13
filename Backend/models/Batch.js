const mongoose = require("mongoose");
const batchSchema = new mongoose.Schema({
  batchId: {
    type: Number,
    required: [true, "Batch ID is required"],
    unique: true,
  },
  batchName: {
    type: String,
    required: [true, "Batch Name is required"],
    trim: true,
    match: [
      /^[A-Za-z ]{2,50}$/,
      "Name must be 2-50 characters and contain only letters and spaces",
    ],
  },
  assignedQuestions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],

  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Batch", batchSchema);
