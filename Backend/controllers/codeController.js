const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const { execSync, spawnSync } = require('child_process');
const path = require('path');

exports.runCode = async (req, res) => {
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
            try {
                execSync(
                    `docker run --rm -v "${tempDir}:/app" -w /app ${dockerImage} sh -c "${compileCmd}"`,
                    { timeout: 5000 }
                );
            } catch (compileErr) {
                const errorMessage = compileErr.stderr?.toString().trim() || 'Compilation Error';
                await fs.remove(tempDir);
                return res.status(200).json({ output: '', error: `🛠️ Compilation Error:\n${errorMessage}` });
            }
        }
        const result = spawnSync('docker', [
            'run', '--rm', '-i',
            '-m', '100m',
            '-v', `${tempDir}:/app`,
            '-w', '/app',
            '--network', 'none',
            dockerImage,
            'sh', '-c', runCmd
        ], {
            input,
            encoding: 'utf-8',
            timeout: 5000,
            maxBuffer: 1024 * 1024
        });

        const output = (result.stdout || '').trim();
        const stderr = (result.stderr || '').trim();

        await fs.remove(tempDir);
        if (result.error?.code === 'ETIMEDOUT') {
            return res.status(200).json({ output, error: '⏱️ Time Limit Exceeded' });
        } else if (result.status !== 0) {
            return res.status(200).json({ output, error: `❌ Runtime Error:\n${stderr || 'Unknown error'}` });
        }
        return res.status(200).json({ output });

    } catch (err) {
        await fs.remove(tempDir);
        return res.status(500).json({ error: '⚠️ Internal server error. Please try again later.' });
    }
};
