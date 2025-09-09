const {Contest}=require('../models/index');
const isAdmin = require('../utils/isAdmin');

const createContest = async (req, res) => {
    try {
        if(!(await isAdmin(req.user.id))){
            return res.status(403).json({ error: 'Unauthorized Access.' });
          }
        const { contestName,code, startTime, endTime, duration, selectedQuestions } = req.body;
        if (!contestName ||!code || !startTime || !endTime || !duration || !selectedQuestions) {
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
          code:code,
          startTime: start,
          endTime: end,
          duration,
          questions: selectedQuestions, 
          createdBy: req.user?._id
        });
    
        await contest.save();
    
        res.status(201).json({
          message: "Contest created successfully",
          contest
        });
      } catch (error) {
        console.error("Error creating contest:", error);
        res.status(500).json({ error: "Something went wrong" });
      }    
};


const getUpcomingContests= async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({ startTime: { $gt: now } }).sort({ startTime: 1 })
    if (!contests.length) {
      return res.status(200).json({ contests: [] });
    }
    res.status(200).json({ contests });
  } catch (error) {
    console.error("Error fetching upcoming contests:", error);
    res.status(500).json({ error:"Something Went Wrong"});
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
    res.status(200).json({ contests });
  } catch (error) {
    console.error("Error fetching live contests:", error);
    res.status(500).json({ error:"Something Went Wrong" });
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
    res.status(200).json({ contests });
  } catch (error) {
    console.error("Error fetching recent contests:", error);
    res.status(500).json({ error:"Something Went Wrong" });
  }
};


module.exports={createContest,getUpcomingContests,getLiveContests,getRecentContests}