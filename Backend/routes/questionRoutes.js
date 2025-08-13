const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { addQuestion, getAllQuestions, deleteQuestion, getAssignedUsers, getUnassignedUsers, assignQuestion, unassignQuestion, getUserQuestions, updateQuestion, getQuestion } = require('../controllers/questionController');
const router = express.Router();

router.get('/',authenticateToken,getAllQuestions);

router.delete('/:id',authenticateToken,deleteQuestion);

router.get('/assignedUsers/:id',authenticateToken,getAssignedUsers);

router.get('/unassignedUsers/:id',authenticateToken,getUnassignedUsers);

router.post('/assign',authenticateToken,assignQuestion);

router.post('/unassign',authenticateToken,unassignQuestion);

router.get('/userquestions',authenticateToken,getUserQuestions);

router.post('/add',authenticateToken,addQuestion);

router.post('/update',authenticateToken,updateQuestion);

router.get('/getQuestion/:id',authenticateToken,getQuestion);

module.exports = router;
