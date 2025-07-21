const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const { execSync, spawnSync } = require('child_process');
const path = require('path');

module.exports = (io) => {
        const router = express.Router();
        router.post('/run', async (req, res) => {
        const { code, language, input = '' } = req.body;
        if (!code || !language) {
            return res.status(400).json({ error: 'Missing code or language' });
        }

        const jobId = uuidv4();
        const tempDir = path.join(__dirname, '..', 'temp', jobId);
        await fs.ensureDir(tempDir);

        let fileName = '';
        let dockerImage = '';
        let compileCmd = '';
        let runCmd = '';

        switch (language) {
            case 'python':
                fileName = 'main.py';
                dockerImage = 'python:3.10';
                runCmd = `python ${fileName}`;
                break;
            case 'cpp':
                fileName = 'main.cpp';
                dockerImage = 'gcc:latest';
                compileCmd = `g++ ${fileName} -o main`;
                runCmd = `./main`;
                break;
            case 'c':
                fileName = 'main.c';
                dockerImage = 'gcc:latest';
                compileCmd = `gcc ${fileName} -o main`;
                runCmd = `./main`;
                break;
            case 'java':
                fileName = 'Main.java';
                dockerImage = 'openjdk:17';
                compileCmd = `javac ${fileName}`;
                runCmd = `java Main`;
                break;
            case 'javascript':
                fileName = 'main.js';
                dockerImage = 'node:18';
                runCmd = `node ${fileName}`;
                break;
            default:
                return res.status(400).json({ error: 'Unsupported language' });
        }

        const codePath = path.join(tempDir, fileName);
        await fs.writeFile(codePath, code);
        try {
            if (compileCmd) {
                execSync(
                    `docker run --rm -v "${tempDir}:/app" -w /app ${dockerImage} sh -c "${compileCmd}"`,
                    { timeout: 5000 }
                );
            }

            const result = spawnSync('docker', [
                'run',
                '--rm',
                '-i',
                '-m', '100m',
                '-v', `${tempDir}:/app`,
                '-w', '/app',
                '--network', 'none',
                dockerImage,
                'sh', '-c', runCmd
            ], {
                input,
                encoding: 'utf-8',
                timeout: 5000
            });

            const output = (result.stdout || '').trim();
            const stderr = result.stderr?.trim() || '';

            await fs.remove(tempDir);

            let response = {};
            if (result.error?.code === 'ETIMEDOUT') {
                response = { output, error: '⏱️ Time Limit Exceeded' };
            } else if (result.status !== 0) {
                response = { output, error: stderr || '❌ Runtime Error' };
            } else {
                response = { output };
            }
            return res.json(response);

        } catch (err) {
            console.log(err);
            await fs.remove(tempDir);
            return res.status(500).json({ error: 'Server Error: ' + err.message });
        }
    });
    return router;
};
