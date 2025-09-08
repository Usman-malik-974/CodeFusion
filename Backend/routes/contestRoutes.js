const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { createContest } = require('../controllers/contestController');

module.exports = (io) => {
    const router = express.Router();
    router.post('/create',authenticateToken,createContest);
    return router;
};
