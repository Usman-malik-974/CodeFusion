const { Question, User, Batch } = require("../models/index");
const isAdmin = require("../utils/isAdmin");

const createBatch = async (req, res) => {
  if (!(await isAdmin(req.user.id))) {
    return res.status(403).json({ error: "Unauthorized Access." });
  }
  try {
    const { batchName, assignedQuestions, users, batchId, createdBy } =
      req.body;

    if (!batchName) {
      return res.status(400).json({
        error: "Batch Name and at least more than 1 users are required.",
      });
    }
    const newBatch = new Batch({
      batchName,
      assignedQuestions,
      users,
      batchId,
      createdBy: createdBy || req.user.id,
    });

    const savedBatch = await newBatch.save();
    const batchObj = savedBatch.toObject();
    delete batchObj.createdBy;
    return res.status(201).json({
      message: "Batch created successfully.",
      batch: batchObj,
    });
  } catch (err) {
    console.error("Create Batch Error:", err);
    if (err.name === "ValidationError") {
      const field = Object.keys(err.errors)[0];
      const errorMessage = err.errors[field].message;
      return res.status(400).json({ error: errorMessage });
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
    if (!batches || batches.length === 0) {
      return res.status(404).json({ error: "No batches found." });
    }
    res.status(200).json(batches);
  } catch (err) {
    console.error("Get All Batches Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createBatch, getAllBatches };
