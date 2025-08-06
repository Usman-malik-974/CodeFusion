const express = require("express");
const {
  getAllUsers,
  updateUser,
  deleteUser,
  searchUsers,
  uploadUsers,
} = require("../controllers/userController");
const authenticateToken = require("../middlewares/authenticateToken");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllUsers);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

router.get("/search", searchUsers);
router.post("/upload", upload.single("file"), uploadUsers);
module.exports = router;
