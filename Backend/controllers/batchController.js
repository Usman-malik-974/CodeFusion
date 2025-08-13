const { Question, User, Batch } = require("../models/index");
const isAdmin = require("../utils/isAdmin");

const createBatch = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: "Unauthorized Access." });
  }
  try {
    const { batchName } = req.body;
    console.log(req.body);
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
    console.log(batches);
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

module.exports = { createBatch, getAllBatches };
