const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { addQuestion, getAllQuestions, deleteQuestion } = require('../controllers/questionController');
const router = express.Router();

router.get('/',authenticateToken,getAllQuestions);

router.delete('/:id',authenticateToken,deleteQuestion);

router.post('/add',authenticateToken,addQuestion);

module.exports = router;
