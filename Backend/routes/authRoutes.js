const express = require('express');
const router = express.Router();

const { loginUser } = require('../controllers/userController');

router.post('/login', loginUser);
// router.post('/signup', signupUser);

module.exports = router;
