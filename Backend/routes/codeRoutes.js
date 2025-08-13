const express = require('express');
const { runCode, runTestCases } = require('../controllers/codeController');
const authenticateToken = require('../middlewares/authenticateToken');

module.exports = (io) => {
        const router = express.Router();
        router.post('/run', runCode);
        router.post('/runtestcases',authenticateToken,runTestCases);
    return router;
};
