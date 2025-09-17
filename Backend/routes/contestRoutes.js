const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { createContest, getUpcomingContests, getLiveContests, getRecentContests, getContestQuestions, deleteContest, updateContest, joinContest, getContestTime } = require('../controllers/contestController');

module.exports = (io) => {
    const router = express.Router();
    router.post('/create',authenticateToken,createContest);
    router.post('/join',joinContest);
    router.post('/update',authenticateToken,updateContest);
    router.get('/getupcomingcontests',authenticateToken,getUpcomingContests);
    router.get('/getlivecontests',authenticateToken,getLiveContests);
    router.get('/getrecentcontests',authenticateToken,getRecentContests);
    router.get('/getcontestquestions/:id',authenticateToken,getContestQuestions);
    router.get('/getcontesttime/:id',authenticateToken,getContestTime);
    router.delete('/:id',authenticateToken,deleteContest);
    return router;
};
