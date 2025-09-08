const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { createContest, getUpcomingContests } = require('../controllers/contestController');

module.exports = (io) => {
    const router = express.Router();
    router.post('/create',authenticateToken,createContest);
    router.get('/getupcomingcontests',authenticateToken,getUpcomingContests);
    return router;
};
