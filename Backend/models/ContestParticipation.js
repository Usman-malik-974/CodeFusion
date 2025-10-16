const mongoose = require("mongoose");

const contestParticipationSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["doing", "done"],
    default: "doing",
  },
  fullScreenSwitch:{
    type:Number,
    default:0
  },
  tabSwitch:{
    type:Number,
    default:0
  }
});

module.exports = mongoose.model("ContestParticipation", contestParticipationSchema);
