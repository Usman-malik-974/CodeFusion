const express = require('express');
const { runCode, runTestCases, getQuestionSubmissions } = require('../controllers/codeController');
const authenticateToken = require('../middlewares/authenticateToken');

module.exports = (io) => {
    const router = express.Router();
    router.post('/run', runCode);
    router.post('/runtestcases', authenticateToken, runTestCases);
    router.get('/submissions/:id', authenticateToken, getQuestionSubmissions);
    return router;
    
};
