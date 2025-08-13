const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const {Question,Submission}=require('../models/index');
const isAdmin = require('../utils/isAdmin');

// exports.runCode = async (req, res) => {
//     const { code, language, input = '' } = req.body;
//     if (!code || !language) {
//         return res.status(400).json({ error: 'Missing code or language' });
//     }

//     const jobId = uuidv4();
//     const tempDir = path.join(__dirname, '..', 'temp', jobId);
//     await fs.ensureDir(tempDir);

//     let fileName = '';
//     let dockerImage = '';
//     let compileCmd = '';
//     let runCmd = '';

//     switch (language) {
//         case 'python':
//             fileName = 'main.py';
//             dockerImage = 'python:3.10-alpine';
//             runCmd = `python ${fileName}`;
//             break;
//         case 'cpp':
//             fileName = 'main.cpp';
//             dockerImage = 'gcc:latest';
//             compileCmd = `g++ ${fileName} -o main`;
//             runCmd = `./main`;
//             break;
//         case 'c':
//             fileName = 'main.c';
//             dockerImage = 'gcc:latest';
//             compileCmd = `gcc ${fileName} -o main`;
//             runCmd = `./main`;
//             break;
//         case 'java':
//             fileName = 'Main.java';
//             dockerImage = 'openjdk:17-alpine';
//             compileCmd = `javac ${fileName}`;
//             runCmd = `java Main`;
//             break;
//         case 'javascript':
//             fileName = 'main.js';
//             dockerImage = 'node:18-alpine';
//             runCmd = `node ${fileName}`;
//             break;
//         default:
//             return res.status(400).json({ error: 'Unsupported language' });
//     }

//     const codePath = path.join(tempDir, fileName);
//     await fs.writeFile(codePath, code);

//     try {
//         if (compileCmd) {
//             try {
//                 execSync(
//                     `docker run --rm -v "${tempDir}:/app" -w /app ${dockerImage} sh -c "${compileCmd}"`,
//                     { timeout: 5000 }
//                 );
//             } catch (compileErr) {
//                 const errorMessage = compileErr.stderr?.toString().trim() || 'Compilation Error';
//                 await fs.remove(tempDir);
//                 return res.status(200).json({ output: '', error: `🛠️ Compilation Error:\n${errorMessage}` });
//             }
//         }
//         const result = spawnSync('docker', [
//             'run', '--rm', '-i',
//             '-m', '100m',
//             '-v', `${tempDir}:/app`,
//             '-w', '/app',
//             '--network', 'none',
//             dockerImage,
//             'sh', '-c', runCmd
//         ], {
//             input,
//             encoding: 'utf-8',
//             timeout: 5000,
//             maxBuffer: 1024 * 1024
//         });

//         const output = (result.stdout || '').trim();
//         const stderr = (result.stderr || '').trim();

//         await fs.remove(tempDir);
//         if (result.error?.code === 'ETIMEDOUT') {
//             return res.status(200).json({ output, error: '⏱️ Time Limit Exceeded' });
//         } else if (result.status !== 0) {
//             return res.status(200).json({ output, error: `❌ Runtime Error:\n${stderr || 'Unknown error'}` });
//         }
//         return res.status(200).json({ output });

//     } catch (err) {
//         await fs.remove(tempDir);
//         return res.status(500).json({ error: '⚠️ Internal server error. Please try again later.' });
//     }
// };
exports.runCode = async (req, res) => {
  const { code, language, input = '' } = req.body;

  if (!code || !language) {
      return res.status(400).json({ error: 'Missing code or language' });
  }

  const jobId = uuidv4();
  const tempDir = path.join(__dirname, '..', 'temp', jobId);
  await fs.ensureDir(tempDir);

  let fileName = '';
  let containerName = '';
  let compileCmd = '';
  let runCmd = '';
  let timeout = 5000;

  switch (language) {
      case 'python':
          fileName = 'main.py';
          containerName = 'python-runner';
          runCmd = `python /app/${jobId}/${fileName}`;
          break;
      case 'cpp':
          fileName = 'main.cpp';
          containerName = 'cpp-runner';
          compileCmd = `g++ /app/${jobId}/${fileName} -o /app/${jobId}/main`;
          runCmd = `/app/${jobId}/main`;
          break;
      case 'c':
          fileName = 'main.c';
          containerName = 'cpp-runner';
          compileCmd = `gcc /app/${jobId}/${fileName} -o /app/${jobId}/main`;
          runCmd = `/app/${jobId}/main`;
          break;
      case 'java':
          fileName = 'Main.java';
          containerName = 'java-runner';
          compileCmd = `javac /app/${jobId}/${fileName}`;
          runCmd = `java -cp /app/${jobId} Main`;
          timeout = 10000;
          break;
      case 'javascript':
          fileName = 'main.js';
          containerName = 'node-runner';
          runCmd = `node /app/${jobId}/${fileName}`;
          break;
      default:
          return res.status(400).json({ error: 'Unsupported language' });
  }

  const codePath = path.join(tempDir, fileName);
  await fs.writeFile(codePath, code);

  // Allow disk sync (especially on Windows)
  await new Promise(r => setTimeout(r, 100));

  try {
      if (compileCmd) {
          try {
              execSync(`docker exec ${containerName} sh -c "${compileCmd}"`, {
                  timeout
              });
          } catch (compileErr) {
            const rawError = compileErr.stderr?.toString().trim() || compileErr.message || 'Compilation failed';
            const cleanError = rawError
        .split('\n')
        .map(line => line.replace(/\/app\/[^\/]+\/main\.(cpp|c|java|py|js)/g, 'main.$1'))
        .join('\n');
              await fs.remove(tempDir);
              return res.status(200).json({ output: '', error: `🛠️ Compilation Error:\n${cleanError}` });
          }
      }

      const result = spawnSync('docker', [
          'exec', '-i', containerName,
          'sh', '-c', runCmd
      ], {
          input,
          encoding: 'utf-8',
          timeout,
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
// exports.runTestCases = async (req, res) => {
//   const { code, language, testCases } = req.body;
//   if (!code || !language || !Array.isArray(testCases)) {
//     return res.status(400).json({ error: 'Missing code, language, or testCases' });
//   }
//   const jobId = uuidv4();
//   const tempDir = path.join(__dirname, '..', 'temp', jobId);
//   await fs.ensureDir(tempDir);
//   let fileName = '';
//   let dockerImage = '';
//   let compileCmd = '';
//   let runCmd = '';
//   switch (language) {
//     case 'python':
//       fileName = 'main.py';
//       dockerImage = 'python:3.10-alpine';
//       runCmd = `python ${fileName}`;
//       break;
//     case 'cpp':
//       fileName = 'main.cpp';
//       dockerImage = 'gcc:latest';
//       compileCmd = `g++ ${fileName} -o main`;
//       runCmd = `./main`;
//       break;
//     case 'c':
//       fileName = 'main.c';
//       dockerImage = 'gcc:latest';
//       compileCmd = `gcc ${fileName} -o main`;
//       runCmd = `./main`;
//       break;
//     case 'java':
//       fileName = 'Main.java';
//       dockerImage = 'openjdk:17-alpine';
//       compileCmd = `javac ${fileName}`;
//       runCmd = `java Main`;
//       break;
//     case 'javascript':
//       fileName = 'main.js';
//       dockerImage = 'node:18-alpine';
//       runCmd = `node ${fileName}`;
//       break;
//     default:
//       await fs.remove(tempDir);
//       return res.status(400).json({ error: 'Unsupported language' });
//   }
//   const codePath = path.join(tempDir, fileName);
//   await fs.writeFile(codePath, code);
//   if (compileCmd) {
//     try {
//       execSync(
//         `docker run --rm -v "${tempDir}:/app" -w /app ${dockerImage} sh -c "${compileCmd}"`,
//         { timeout: 5000 }
//       );
//     } catch (compileErr) {
//       const errorMessage = compileErr.stderr?.toString().trim() || 'Compilation Error';
//       await fs.remove(tempDir);
//       return res.status(200).json({
//         results: [],
//         error: `🛠️ Compilation Error:\n${errorMessage}`
//       });
//     }
//   }
//   const containerName = `runner_${jobId}`;
//   try {
//     execSync(`docker run -d --name ${containerName} -v "${tempDir}:/app" -w /app --network none ${dockerImage} tail -f /dev/null`);
//   } catch (err) {
//     await fs.remove(tempDir);
//     return res.status(500).json({ error: 'Failed to start docker container' });
//   }
//   const runTestCase = async (test) => {
//     return new Promise((resolve) => {
//       const input = (test.input || '').trim();
//       const expected = (test.output || '').trim();
//       const isHidden = test.hidden;
//       const execResult = spawnSync('docker', [
//         'exec', '-i', containerName,
//         'sh', '-c', runCmd
//       ], {
//         input,
//         encoding: 'utf-8',
//         timeout: 5000,
//         maxBuffer: 1024 * 1024
//       });
//       const actual = (execResult.stdout || '').trim();
//       const stderr = (execResult.stderr || '').trim();
//       let verdict = 'Passed';
//       if (execResult.error?.code === 'ETIMEDOUT') {
//         verdict = 'Time Limit Exceeded';
//       } else if (execResult.status !== 0) {
//         verdict = 'Runtime Error';
//       } else if (actual !== expected) {
//         verdict = 'Failed';
//       }
//       const result = {
//         verdict,
//         error: verdict !== 'Passed' ? stderr : undefined
//       };
//       if (!isHidden) {
//         result.input = input;
//         result.expected = expected;
//         result.actual = actual;
//       }
//       resolve(result);
//     });
//   };

//   try {
//     const results = await Promise.all(testCases.map(runTestCase));
//     execSync(`docker rm -f ${containerName}`);
//     await fs.remove(tempDir);
//     return res.status(200).json({ results });

//   } catch (err) {
//     try {
//       execSync(`docker rm -f ${containerName}`);
//     } catch {}
//     await fs.remove(tempDir);
//     return res.status(500).json({
//       error: '⚠️ Internal server error. Please try again later.'
//     });
//   }
// };

exports.runTestCases = async (req, res) => {
  const { code, language, questionId } = req.body;
  if (!code || !language || !questionId) {
    return res.status(400).json({ error: 'Missing code, language, or questionId' });
  }
  let testCases;
  try {
    const question = await Question.findById(questionId).lean();
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    testCases = question.testCases || [];
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch test cases' });
  }

  const jobId = uuidv4();
  const tempDir = path.join(__dirname, '..', 'temp', jobId);
  await fs.ensureDir(tempDir);

  let fileName = '';
  let containerName = '';
  let compileCmd = '';
  let runCmd = '';
  let timeout = 5000;

  switch (language) {
    case 'python':
      fileName = 'main.py';
      containerName = 'python-runner';
      runCmd = `python /app/${jobId}/${fileName}`;
      break;
    case 'cpp':
      fileName = 'main.cpp';
      containerName = 'cpp-runner';
      compileCmd = `g++ /app/${jobId}/${fileName} -o /app/${jobId}/main`;
      runCmd = `/app/${jobId}/main`;
      break;
    case 'c':
      fileName = 'main.c';
      containerName = 'cpp-runner';
      compileCmd = `gcc /app/${jobId}/${fileName} -o /app/${jobId}/main`;
      runCmd = `/app/${jobId}/main`;
      break;
    case 'java':
      fileName = 'Main.java';
      containerName = 'java-runner';
      compileCmd = `javac /app/${jobId}/${fileName}`;
      runCmd = `java -cp /app/${jobId} Main`;
      timeout = 10000;
      break;
    case 'javascript':
      fileName = 'main.js';
      containerName = 'node-runner';
      runCmd = `node /app/${jobId}/${fileName}`;
      break;
    default:
      await fs.remove(tempDir);
      return res.status(400).json({ error: 'Unsupported language' });
  }

  const codePath = path.join(tempDir, fileName);
  await fs.writeFile(codePath, code);
  await new Promise(r => setTimeout(r, 100)); 
  if (compileCmd) {
    try {
      execSync(`docker exec ${containerName} sh -c "${compileCmd}"`, { timeout });
    } catch (compileErr) {
      const rawError = compileErr.stderr?.toString().trim() || compileErr.message || 'Compilation failed';
      const cleanError = rawError
  .split('\n')
  .map(line => line.replace(/\/app\/[^\/]+\/main\.(cpp|c|java|py|js)/g, 'main.$1'))
  .join('\n');

      await fs.remove(tempDir);
      return res.status(200).json({
        results: [],
        error: `Compilation Error:\n${cleanError}`
      });
    }
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
        timeout,
        maxBuffer: 1024 * 1024
      });

      const actual = (execResult.stdout || '').trim();
      const stderr = (execResult.stderr || '').trim();

      let verdict = 'Passed';
      if (execResult.error?.code === 'ETIMEDOUT') {
        verdict = 'Time Limit Exceeded';
      } else if (execResult.status !== 0) {
        verdict = 'Runtime Error';
      } else if (actual !== expected) {
        verdict = 'Failed';
      }

      const result = {
        verdict,
        error: verdict !== 'Passed' ? stderr : undefined
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
    await fs.remove(tempDir);
    const passedCount = results.filter(r => r.verdict === 'Passed').length;
    const totalCount = testCases.length;
    const submission = new Submission({
    userID: req.user.id,
    questionID: questionId,
    passed: passedCount,
    total: totalCount,
    language,
    code
  });

  await submission.save(); 
    return res.status(200).json({ results });
  } catch (err) {
    console.log(err);
    await fs.remove(tempDir);
    return res.status(500).json({
      error: 'Internal server error. Please try again later.'
    });
  }
};

exports.getQuestionSubmissions = async (req, res) => {
  try {
    const userID = req.user.id;
    const questionID=req.params.id;
    const submissions=await Submission.find({userID,questionID});
    res.status(200).json({
      submissions:submissions.map((s)=>{
        const formattedDate = new Intl.DateTimeFormat('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata'
      }).format(s.submittedAt).replace(" at",",");
      return{
          id:s._id,
          language:s.language,
          passed:s.passed,
          submittedAt:formattedDate,
          total:s.total,
          code:s.code
      }
      })
    })
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
