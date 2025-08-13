const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const {
  createBatch,
  getAllBatches,
} = require("../controllers/batchController");
const router = express.Router();
router.post("/create", authenticateToken, createBatch);
router.get("/", authenticateToken, getAllBatches);
module.exports = router;
