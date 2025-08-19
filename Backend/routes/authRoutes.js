const express = require('express');
const router = express.Router();

const { loginUser,signupUser, requestPasswordReset, resetPassword } = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/login', loginUser);
router.post('/reqpassreset',requestPasswordReset);
router.post('/signup',authenticateToken,signupUser);
router.post('/resetpass',resetPassword);

module.exports = router;
