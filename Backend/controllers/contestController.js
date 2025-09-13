const { Contest } = require('../models/index');
const isAdmin = require('../utils/isAdmin');

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
        )
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
    contest.selectedQuestions = selectedQuestions;
    await contest.save();
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

module.exports = { createContest, getUpcomingContests, getLiveContests, getRecentContests, getContestQuestions,deleteContest,updateContest}