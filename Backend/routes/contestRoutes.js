const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { createContest, getUpcomingContests, getLiveContests, getRecentContests } = require('../controllers/contestController');

module.exports = (io) => {
    const router = express.Router();
    router.post('/create',authenticateToken,createContest);
    router.get('/getupcomingcontests',authenticateToken,getUpcomingContests);
    router.get('/getlivecontests',authenticateToken,getLiveContests);
    router.get('/getrecentcontests',authenticateToken,getRecentContests);
    return router;
};
