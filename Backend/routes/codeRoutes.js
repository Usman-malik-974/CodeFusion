const express = require('express');
const { runCode, runTestCases } = require('../controllers/codeController');

module.exports = (io) => {
        const router = express.Router();
        router.post('/run', runCode);
        router.post('/runtestcases',runTestCases);
    return router;
};
