const { Contest,User,ContestParticipation,Submission} = require('../models/index');
const isAdmin = require('../utils/isAdmin');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const addToQueueWithTimeout=require("../utils/addToQueueWithTimeout");
const getContestLeaderboard = require('../utils/getContestLeaderBoard');

const createContest = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: 'Unauthorized Access.' });
    }
    const { contestName, code, startTime, endTime, duration, selectedQuestions } = req.body;
    if (!contestName || !code || !startTime || !endTime || !duration || !selectedQuestions) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    if (end <= start) {
      return res.status(400).json({ message: "End time must be greater than start time" });
    }
    const contest = new Contest({
      name: contestName,
      code: code,
      startTime: start,
      endTime: end,
      duration,
      questions: selectedQuestions,
      createdBy: req.user?._id
    });

    await contest.save();
    const admin = await isAdmin(req.user.id);
    res.status(201).json({
      message: "Contest created successfully",
      contest:{
        id: contest._id,
        name: contest.name,
        startTime: contest.startTime,
        endTime: contest.endTime,
        duration: contest.duration,
        ...(admin && { code: contest.code })
      }
    });
  } catch (error) {
    console.error("Error creating contest:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


const getUpcomingContests = async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({ startTime: { $gt: now } }).sort({ startTime: 1 })
    if (!contests.length) {
      return res.status(200).json({ contests: [] });
    }
    const admin = await isAdmin(req.user.id);
    res.status(200).json({
      contests: contests.map((contest) => {
        const baseData = {
          id: contest._id,
          name: contest.name,
          startTime: contest.startTime,
          endTime: contest.endTime,
          duration: contest.duration,
        };
        if (admin) {
          baseData.code = contest.code;
        }

        return baseData;
      }),
    });
  } catch (error) {
    console.error("Error fetching upcoming contests:", error);
    res.status(500).json({ error: "Something Went Wrong" });
  }
};

const getLiveContests = async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).sort({ startTime: 1 });

    if (!contests.length) {
      return res.status(200).json({ contests: [] });
    }
    res.status(200).json({
      contests: contests.map((contest) => ({
        id: contest._id,
        name: contest.name,
        startTime: contest.startTime,
        endTime: contest.endTime,
        duration: contest.duration,
      })
      )
    });
  } catch (error) {
    console.error("Error fetching live contests:", error);
    res.status(500).json({ error: "Something Went Wrong" });
  }
};


const getRecentContests = async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({ endTime: { $lt: now } })
      .sort({ endTime: -1 });

    if (!contests.length) {
      return res.status(200).json({ contests: [] });
    }
    res.status(200).json({
      contests: contests.map((contest) => ({
        id: contest._id,
        name: contest.name,
        startTime: contest.startTime,
        endTime: contest.endTime,
        duration: contest.duration,
      })
      )
    });
  } catch (error) {
    console.error("Error fetching recent contests:", error);
    res.status(500).json({ error: "Something Went Wrong" });
  }
};

const getContestQuestions = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user.id;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const contest = await Contest.findById(contestId).populate("questions");
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }
    const admin = await isAdmin(userId);
    let formattedQuestions;
    if (admin) {
      formattedQuestions = contest.questions.map((q) => ({
        id: q._id,
        title: q.title,
        statement: q.statement,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        tags: q.tags,
        difficulty: q.difficulty,
        testCases: q.testCases
      }));
    } else {
      let userSubmissions = await Submission.find({
        contestId,
        userId,
        $expr: { $eq: ["$passed", "$total"] }   
      }).select("questionId");
      const solvedSet = new Set(userSubmissions.map(s => String(s.questionId)));
      formattedQuestions = contest.questions.map((q) => ({
        id: q._id,
        title: q.title,
        statement: q.statement,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        tags: q.tags,
        difficulty: q.difficulty,
        testCases: q.testCases.map((t) =>
          t.hidden ? { hidden: true } : { input: t.input, output: t.output, hidden: t.hidden }
        ),
        done: solvedSet.has(String(q._id)),
      }));
    }

    res.status(200).json({
      questions: formattedQuestions
    });
  } catch (error) {
    console.error("Error fetching contest questions:", error);
    res.status(500).json({ error: "Something Went Wrong" });
  }
};

const deleteContest = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: 'Unauthorized Access.' });
    }
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }
    const now = new Date();
    if (contest.startTime <= now) {
      return res
        .status(400)
        .json({ error: "This contest is already started or ended. Cannot delete." });
    }

    await Contest.findByIdAndDelete(id);

    res.status(200).json({ message: "Contest deleted successfully." });
  } catch (error) {
    console.error("Error deleting contest:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const updateContest = async (req, res) => {
  try {
    const admin = await isAdmin(req.user.id);
    if (!admin) {
      return res.status(403).json({ error: 'Unauthorized Access.' });
    }
    const { id,code, name, startTime, endTime, duration, selectedQuestions } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Contest ID is required" });
    }

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const now = new Date();
    if (contest.startTime <= now) {
      return res
        .status(400)
        .json({ error: "This contest is already started or ended. Cannot update." });
    }

    contest.name = name;
    contest.code=code;
    contest.startTime = startTime;
    contest.endTime = endTime;
    contest.duration = duration;
    contest.questions = selectedQuestions;
    await contest.save();
    console.log(contest);
    res.status(200).json({
      message: "Contest updated successfully.",
      contest:{
        id: contest._id,
        name: contest.name,
        startTime: contest.startTime,
        endTime: contest.endTime,
        duration: contest.duration,
        ...(admin && { code: contest.code })
      }
    });
  } catch (error) {
    console.error("Error updating contest:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const joinContest = async (req, res) => {
  try {
    const { email, password, contestId, contestCode } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }
    if (contest.code !== contestCode) {
      return res.status(400).json({ error: "Invalid contest code" });
    }

    const now = new Date();
    if (now < contest.startTime) {
      return res.status(400).json({ error: "Contest has not started yet" });
    }
    if (now > contest.endTime) {
      return res.status(400).json({ error: "Contest has already ended" });
    }
    let participation = await ContestParticipation.findOne({
      userId: user._id,
      contestId: contest._id,
    });

    if (participation) {
      if (participation.status === "done") {
        return res.status(400).json({ error: "You have already completed this contest" });
      }
      return res.status(200).json({
        message: "Contest joined successfully"
      });
    }
    const tempParticipation = new ContestParticipation({
      userId: user._id,
      contestId: contest._id,
      startedAt: now,
      status: "doing",
    });
    try {
      await addToQueueWithTimeout(
        { participationId: tempParticipation._id },
        { delay: contest.duration * 60 * 1000 },
        3000 
      );
    } catch (queueError) {
      console.error("Queue Error:", queueError.message);
      return res.status(500).json({ error: "Error Joining Contest. Try again later." });
    }
    
    await tempParticipation.save();
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Contest joined successfully",
      token,
    });

  } catch (error) {
    console.error("Error joining contest:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const getContestTime = async (req, res) => {
  try {
    if (await isAdmin(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized Access.' });
    }
    const userId = req.user.id; 
    const contestId= req.params.id;
    const participation = await ContestParticipation.findOne({
      userId,
      contestId,
    });
    if (!participation) {
      return res.status(404).json({ error: "You have not joined this contest" });
    }
    if (participation.status !== "doing") {
      return res.status(400).json({ error: "Contest is not in progress" });
    }
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }
    const now = new Date();
    const elapsed = Math.floor((now - participation.startedAt) / 1000);
    const durationInSec = contest.duration * 60;
    const remaining = durationInSec - elapsed;
    if (remaining <= 0) {
      return res.status(400).json({ error: "Your contest time has expired" });
    }
    return res.status(200).json({ remainingTime: remaining });
  } catch (error) {
    console.error("Error fetching contest time:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const generateLeaderboard = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }
    const contestId = req.params.id;
    if (!contestId) {
      return res.status(400).json({ error: "contestId is required" });
    }

    const leaderboard = await getContestLeaderboard(contestId);

    return res.status(200).json({
      leaderboard,
    });
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};

const submitContest = async (req, res) => {
  try {
    const contestId= req.params.id;
    const userId = req.user._id; 
    if (!contestId) {
      return res.status(400).json({ error: "contestId is required" });
    }
    const participation = await ContestParticipation.findOne({
      contestId,
      userId,
    });
    if (!participation) {
      return res.status(404).json({ error: "Participation not found" });
    }
    if (participation.status === "done") {
      return res.status(400).json({ error: "Contest already submitted" });
    }
    participation.endedAt = new Date();
    participation.status = "done";
    await participation.save();
    return res.status(200).json({
      message: "Contest submitted successfully",
      participation,
    });
  } catch (error) {
    console.error("Error in submitContest:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};

const endContest = async (req, res,io) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }
    const contestId= req.params.id;
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }
    const now = new Date();
    if (now > contest.endTime) {
      return res.status(400).json({ error: "Contest already ended" });
    }
    contest.endTime = now;
    await contest.save();
    await ContestParticipation.updateMany(
      { contestId, endedAt: { $exists: false } },
      { $set: { endedAt: now } }
    );
    io.emit('contestended',{
      contestId
    })
    return res.status(200).json({
      message: "Contest ended successfully, all ongoing participations marked ended",
    });
  } catch (error) {
    console.error("Error in ending Contest:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};

module.exports = { createContest, getUpcomingContests, getLiveContests, getRecentContests, getContestQuestions,deleteContest,updateContest,joinContest,getContestTime,generateLeaderboard,submitContest,endContest}