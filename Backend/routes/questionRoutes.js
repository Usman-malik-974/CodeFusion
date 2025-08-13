const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { addQuestion, getAllQuestions, deleteQuestion, getAssignedUsers, getUnassignedUsers, getUserQuestions, updateQuestion, getQuestion, assignQuestiontoUser, unassignQuestiontoUser, getUnassignedBatches, getAssignedBatches, unassignQuestiontoBatch, assignQuestiontoBatch } = require('../controllers/questionController');
const router = express.Router();

router.get('/',authenticateToken,getAllQuestions);

router.delete('/:id',authenticateToken,deleteQuestion);

router.get('/assignedUsers/:id',authenticateToken,getAssignedUsers);

router.get('/unassignedUsers/:id',authenticateToken,getUnassignedUsers);

router.post('/assigntouser',authenticateToken,assignQuestiontoUser);

router.post('/unassigntouser',authenticateToken,unassignQuestiontoUser);

router.get('/userquestions',authenticateToken,getUserQuestions);

router.post('/add',authenticateToken,addQuestion);

router.post('/update',authenticateToken,updateQuestion);

router.get('/getQuestion/:id',authenticateToken,getQuestion);

router.get('/assignedBatches/:id',authenticateToken,getAssignedBatches);

router.get('/unassignedBatches/:id',authenticateToken,getUnassignedBatches);

router.post('/assigntobatch',authenticateToken,assignQuestiontoBatch);

router.post('/unassigntobatch',authenticateToken,unassignQuestiontoBatch);


module.exports = router;
