const express = require('express');
const router = express.Router();

const { loginUser,signupUser } = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/login', loginUser);
router.post('/signup',authenticateToken,signupUser);

module.exports = router;
