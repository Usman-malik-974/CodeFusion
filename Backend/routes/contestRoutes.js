const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { createContest, getUpcomingContests, getLiveContests, getRecentContests, getContestQuestions, deleteContest, updateContest, joinContest, getContestTime, generateLeaderboard, submitContest, endContest } = require('../controllers/contestController');

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
    router.get('/getcontestleaderboard/:id',authenticateToken,generateLeaderboard);
    router.get('/submit/:id',authenticateToken,submitContest);
    router.get('/end/:id',authenticateToken,(req,res)=>endContest(req,res,io));
    router.delete('/:id',authenticateToken,deleteContest);
    return router;
};
