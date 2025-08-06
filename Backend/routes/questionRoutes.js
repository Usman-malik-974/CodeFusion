const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { addQuestion, getAllQuestions, deleteQuestion, getAssignedUsers, getUnassignedUsers, assignQuestion, unassignQuestion } = require('../controllers/questionController');
const router = express.Router();

router.get('/',authenticateToken,getAllQuestions);

router.delete('/:id',authenticateToken,deleteQuestion);

router.get('/assignedUsers/:id',authenticateToken,getAssignedUsers);

router.get('/unassignedUsers/:id',authenticateToken,getUnassignedUsers);

router.post('/assign',authenticateToken,assignQuestion);

router.post('/unassign',authenticateToken,unassignQuestion);

router.post('/add',authenticateToken,addQuestion);

module.exports = router;
