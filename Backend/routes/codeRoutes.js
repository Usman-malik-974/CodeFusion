const express = require('express');
const { runCode } = require('../controllers/codeController');

module.exports = (io) => {
        const router = express.Router();
        router.post('/run', runCode);
    return router;
};
