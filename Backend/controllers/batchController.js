const { Question, User, Batch } = require("../models/index");
const isAdmin = require("../utils/isAdmin");
const mongoose=require('mongoose');

const createBatch = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: "Unauthorized Access." });
  }
  try {
    const { batchName } = req.body;
    if (!batchName) {
      return res.status(400).json({
        error: "Batch Name is required.",
      });
    }

    const exists = await Batch.findOne({ name: batchName.trim() });
    if (exists) {
      return res.status(400).json({ message: "Batch name already exists" });
    }
    const newBatch = new Batch({
      name: batchName.trim(),
      createdBy: req.user.id,
    });
    const savedBatch = await newBatch.save();
    const batchObj = savedBatch.toObject();
    delete batchObj.createdBy;
    return res.status(201).json({
      message: "Batch created successfully.",
      batch: {
        id: batchObj._id,
        batchName: batchObj.name,
        users: batchObj.users,
      },
    });
  } catch (err) {
    console.error("Create Batch Error:", err);
    if (err.name === "ValidationError") {
      const field = Object.keys(err.errors)[0];
      const errorMessage = err.errors[field].message;
      return res.status(400).json({ error: errorMessage });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: "Batch name already exists" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllBatches = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }
    const batches = await Batch.find({});
    res.status(200).json({
      batches: batches.map((batch) => ({
        id: batch._id,
        batchName: batch.name,
        assignedQuestions: batch.assignedQuestions,
        users: batch.users,
      })),
    });
  } catch (err) {
    console.error("Get All Batches Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getBatchUsers = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: 'Unauthorized Access.' });
  }
  try {
    const batchId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ error: 'Invalid Batch ID' });
    }
    const batch = await Batch.findById(batchId).populate('users','_id fullname email rollno course session');
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    return res.status(200).json({
      batchId: batch._id,
      batchName: batch.name,
      users: batch.users.map(user => ({
        id: user._id,
        name: user.fullname,
        email: user.email,
        rollno:user.rollno,
        course:user.course,
        session:user.session
      })) 
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUsersNotInBatch = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: 'Unauthorized Access.' });
  }

  try {
    const batchId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ error: 'Invalid Batch ID' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    const userIdsInBatch = batch.users;
    const usersNotInBatch = await User.find({
      _id: { $nin: userIdsInBatch },
    }).select('_id fullname email rollno course session');

    return res.status(200).json({
      batchId: batch._id,
      batchName: batch.name,
      users: usersNotInBatch.map(user => ({
        id: user._id,
        name: user.fullname,
        email: user.email,
        rollno: user.rollno,
        course: user.course,
        session: user.session,
      })),
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getBatchQuestions = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: 'Unauthorized Access.' });
  }

  try {
    const batchId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ error: 'Invalid Batch ID' });
    }

    const batch = await Batch.findById(batchId).populate('assignedQuestions');

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const questions = batch.assignedQuestions.map((question) => ({
      id: question._id,
      title: question.title,
      statement: question.statement,
      tags: question.tags,
      difficulty: question.difficulty
    }));

    return res.status(200).json({ questions });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUnassignedQuestionsForBatch = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: 'Unauthorized Access.' });
  }

  try {
    const batchId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ error: 'Invalid Batch ID' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const assignedQuestionIds = batch.assignedQuestions;
    const unassignedQuestions = await Question.find({
      _id: { $nin: assignedQuestionIds }
    });

    const questions = unassignedQuestions.map((question) => ({
      id: question._id,
      title: question.title,
      statement: question.statement,
      tags: question.tags,
      difficulty: question.difficulty
    }));

    return res.status(200).json({ questions });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


const assignBatchToUser = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: "Unauthorized Access." });
  }

  try {
    const { userIds, batchId } = req.body;

    if (
      !Array.isArray(userIds) ||
      userIds.length === 0 ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return res.status(400).json({ error: "Invalid userIds or batchId" });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const result = {
      assigned: [],
      notFound: [],
      invalidIds: [],
    };

    for (const userId of userIds) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        result.invalidIds.push(userId);
        continue;
      }

      const user = await User.findById(userId);
      if (!user) {
        result.notFound.push(userId);
        continue;
      }
      if (!user.batches.includes(batchId)) {
        user.batches.push(batchId);
        await user.save();
      }

      if (!batch.users.includes(userId)) {
        batch.users.push(userId);
      }

      result.assigned.push(userId);
    }

    await batch.save();

    return res.status(200).json({
      message: "Batch assigned to users successfully.",
      summary: result,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const unassignBatchFromUser = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: "Unauthorized Access." });
  }

  try {
    const { userId, batchId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return res.status(400).json({ error: "Invalid userId or batchId" });
    }

    const user = await User.findById(userId);
    const batch = await Batch.findById(batchId);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    const isAssigned =
      user.batches.includes(batchId) && batch.users.includes(userId);

    if (!isAssigned) {
      return res.status(200).json({
        message: "Batch is not assigned to this user.",
        userId: user._id,
        batchId: batch._id,
      });
    }
    user.batches = user.batches.filter(
      (id) => id.toString() !== batchId.toString()
    );
    await user.save();

    batch.users = batch.users.filter(
      (id) => id.toString() !== userId.toString()
    );
    await batch.save();

    return res.status(200).json({
      message: "Batch unassigned successfully.",
      userId: user._id,
      batchId: batch._id,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteBatch = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid batch ID" });
    }
    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    await User.updateMany(
      { batches: id },
      { $pull: { batches: id } }
    );
    await Batch.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Batch deleted successfully.",
      batchId: id,
    });
  } catch (error) {
    console.error("Delete batch error:", error);
    return res.status(500).json({ error: "Server error while deleting batch" });
  }
};

const getBatch = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: 'Unauthorized Access.' });
  }

  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Batch ID" });
    }

    const batch = await Batch.findById(id)
      .populate("users", "_id fullname email rollno course session")
      .populate("assignedQuestions", "_id title statement tags difficulty");

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    return res.status(200).json({
      batch: {
        id: batch._id,
        name: batch.name,
        users: batch.users.map(user => ({
          id: user._id,
          name: user.fullname,
          email: user.email,
          rollno: user.rollno,
          course: user.course,
          session: user.session,
        })),
        questions: batch.assignedQuestions.map(question => ({
          id: question._id,
          title: question.title,
          statement: question.statement,
          tags: question.tags,
          difficulty: question.difficulty,
        }))
      }
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


const assignQuestions = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }

    const { questionIds, batchId } = req.body;

    if (
      !Array.isArray(questionIds) ||
      questionIds.length === 0 ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return res.status(400).json({ error: "Invalid questionIds or batchId." });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const result = {
      assigned: [],
      notFound: [],
      invalidIds: [],
    };

    for (const qid of questionIds) {
      if (!mongoose.Types.ObjectId.isValid(qid)) {
        result.invalidIds.push(qid);
        continue;
      }

      const question = await Question.findById(qid);
      if (!question) {
        result.notFound.push(qid);
        continue;
      }
      if (!batch.assignedQuestions.includes(qid)) {
        batch.assignedQuestions.push(qid);
        result.assigned.push(qid);
      }
    }

    await batch.save();

    return res.status(200).json({
      message: "Questions assigned successfully.",
      summary: result,
    });

  } catch (error) {
    console.error("Error assigning questions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = { createBatch, getAllBatches,getBatchUsers,getUsersNotInBatch,getBatchQuestions,getUnassignedQuestionsForBatch,assignBatchToUser,unassignBatchFromUser,deleteBatch,getBatch,assignQuestions};
