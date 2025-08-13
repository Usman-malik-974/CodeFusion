const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const {
  createBatch,
  getAllBatches,
  getUsersNotInBatch,
  getBatchUsers,
  getUnassignedQuestionsForBatch,
  getBatchQuestions,
  assignBatchToUser,
  unassignBatchFromUser,
  deleteBatch,
} = require("../controllers/batchController");
const router = express.Router();
router.post("/create", authenticateToken, createBatch);
router.get("/", authenticateToken, getAllBatches);
router.get("/getbatchusers/:id", authenticateToken, getBatchUsers);
router.get("/getremainingusers/:id", authenticateToken, getUsersNotInBatch);
router.get("/getbatchquestions/:id", authenticateToken, getBatchQuestions);
router.get("/getremainingquestions/:id", authenticateToken, getUnassignedQuestionsForBatch);
router.post("/assign",authenticateToken,assignBatchToUser);
router.post("unassign",authenticateToken,unassignBatchFromUser);
router.delete("/:id",authenticateToken,deleteBatch);
module.exports = router;
