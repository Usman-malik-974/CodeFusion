const mongoose = require("mongoose");
const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Batch Name is required"],
    trim: true,
    match: [
      /^[A-Za-z0-9 \-]{3,50}$/,
      "Batch name must be 3–50 characters, using only letters, numbers, spaces, or hyphens.",
    ],
    unique: [true, "Already exists"],
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
