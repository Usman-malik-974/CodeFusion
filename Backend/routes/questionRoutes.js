const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { addQuestion, getAllQuestions } = require('../controllers/questionController');
const router = express.Router();

router.get('/',getAllQuestions);
router.post('/add',authenticateToken,addQuestion);

module.exports = router;
