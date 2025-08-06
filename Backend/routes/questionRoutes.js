const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { addQuestion, getAllQuestions, deleteQuestion, getAssignedUsers, getUnassignedUsers } = require('../controllers/questionController');
const router = express.Router();

router.get('/',authenticateToken,getAllQuestions);

router.delete('/:id',authenticateToken,deleteQuestion);

router.get('/assignedUsers/:id',authenticateToken,getAssignedUsers);

router.get('/unassignedUsers/:id',authenticateToken,getUnassignedUsers);

router.post('/add',authenticateToken,addQuestion);

module.exports = router;
