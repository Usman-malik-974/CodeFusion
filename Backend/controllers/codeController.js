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

exports.runTestCases = async (req, res) => {
  const { code, language, testCases } = req.body;
  if (!code || !language || !Array.isArray(testCases)) {
    return res.status(400).json({ error: 'Missing code, language, or testCases' });
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
      dockerImage = 'python:3.10-alpine';
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
      dockerImage = 'openjdk:17-alpine';
      compileCmd = `javac ${fileName}`;
      runCmd = `java Main`;
      break;
    case 'javascript':
      fileName = 'main.js';
      dockerImage = 'node:18-alpine';
      runCmd = `node ${fileName}`;
      break;
    default:
      await fs.remove(tempDir);
      return res.status(400).json({ error: 'Unsupported language' });
  }
  const codePath = path.join(tempDir, fileName);
  await fs.writeFile(codePath, code);
  if (compileCmd) {
    try {
      execSync(
        `docker run --rm -v "${tempDir}:/app" -w /app ${dockerImage} sh -c "${compileCmd}"`,
        { timeout: 5000 }
      );
    } catch (compileErr) {
      const errorMessage = compileErr.stderr?.toString().trim() || 'Compilation Error';
      await fs.remove(tempDir);
      return res.status(200).json({
        results: [],
        error: `🛠️ Compilation Error:\n${errorMessage}`
      });
    }
  }
  const containerName = `runner_${jobId}`;
  try {
    execSync(`docker run -d --name ${containerName} -v "${tempDir}:/app" -w /app --network none ${dockerImage} tail -f /dev/null`);
  } catch (err) {
    await fs.remove(tempDir);
    return res.status(500).json({ error: 'Failed to start docker container' });
  }
  const runTestCase = async (test) => {
    return new Promise((resolve) => {
      const input = (test.input || '').trim();
      const expected = (test.output || '').trim();
      const isHidden = test.hidden;
      const execResult = spawnSync('docker', [
        'exec', '-i', containerName,
        'sh', '-c', runCmd
      ], {
        input,
        encoding: 'utf-8',
        timeout: 5000,
        maxBuffer: 1024 * 1024
      });
      const actual = (execResult.stdout || '').trim();
      const stderr = (execResult.stderr || '').trim();
      let verdict = '✅ Passed';
      if (execResult.error?.code === 'ETIMEDOUT') {
        verdict = '⏱️ Time Limit Exceeded';
      } else if (execResult.status !== 0) {
        verdict = '❌ Runtime Error';
      } else if (actual !== expected) {
        verdict = '❌ Failed';
      }
      const result = {
        verdict,
        error: verdict !== '✅ Passed' ? stderr : undefined
      };
      if (!isHidden) {
        result.input = input;
        result.expected = expected;
        result.actual = actual;
      }
      resolve(result);
    });
  };

  try {
    const results = await Promise.all(testCases.map(runTestCase));
    execSync(`docker rm -f ${containerName}`);
    await fs.remove(tempDir);
    return res.status(200).json({ results });

  } catch (err) {
    try {
      execSync(`docker rm -f ${containerName}`);
    } catch {}
    await fs.remove(tempDir);
    return res.status(500).json({
      error: '⚠️ Internal server error. Please try again later.'
    });
  }
};

