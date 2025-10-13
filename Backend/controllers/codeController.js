const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const { execSync, spawnSync ,spawn} = require('child_process');
const path = require('path');
const {Question,Submission}=require('../models/index');
const isAdmin = require('../utils/isAdmin');
const getContestLeaderboard = require('../utils/getContestLeaderBoard');

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

function runCommand(containerName, runCmd, input, timeout, maxOutputLength = 1000000) {
    return new Promise((resolve, reject) => {
      try{
        const child = spawn('docker', ['exec', '-i', containerName, 'sh', '-c', runCmd], {
            stdio: ['pipe', 'pipe', 'pipe'],
            encoding: 'utf-8'
        });
        let stdoutLength = 0;
        let stdout = '';
        let stderr = '';
        let timedOut = false;
        let memoryExceeded = false;

        const timer = setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
        }, timeout);

        child.stdout.on('data', data => {
            stdoutLength += data.length;
            if (stdoutLength > maxOutputLength) {
                memoryExceeded = true;
                child.kill('SIGKILL');
            } else {
                stdout += data.toString();
            }
        });

        child.stderr.on('data', data => {
            stderr += data.toString();
        });

        child.on('close', code => {
            clearTimeout(timer);

            if (timedOut) {
                return resolve({ output: stdout.trim(), error: '⏱️ Time Limit Exceeded' });
            }
            if (memoryExceeded) {
                return resolve({ output: stdout.trim(), error: '💾 Memory/Output Limit Exceeded' });
            }
            if (code !== 0) {
                return resolve({ output: stdout.trim(), error: `❌ Runtime Error:\n${stderr.trim()}` });
            }
            resolve({ output: stdout.trim() });
        });

        child.stdin.write(input);
        child.stdin.end();
         }
      catch(err){
        reject(err);
      }
    });
}


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
  let timeout = 10000;

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

      // const result = spawnSync('docker', [
      //     'exec', '-i', containerName,
      //     'sh', '-c', runCmd
      // ], {
      //     input,
      //     encoding: 'utf-8',
      //     timeout,
      //     maxBuffer: 1024 * 1024
      // });
      await fs.remove(tempDir);
      const result = await runCommand(containerName, runCmd, input, timeout);
      return res.status(200).json(result);

      // const output = (result.stdout || '').trim();
      // const stderr = (result.stderr || '').trim();

      // if (result.error?.code === 'ETIMEDOUT') {
      //     return res.status(200).json({ output, error: '⏱️ Time Limit Exceeded' });
      // } else if (result.status !== 0) {
      //     return res.status(200).json({ output, error: `❌ Runtime Error:\n${stderr || 'Unknown error'}` });
      // }

      // return res.status(200).json({ output });

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

exports.runTestCases = async (req, res,io) => {
  const { code, language, questionId,contestId} = req.body;
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
  let timeout = 10000;

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
      // timeout = 10000;
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
    try{

      const input = (test.input || '').trim();
      const expected = (test.output || '').trim();
      const isHidden = test.hidden;
      const marks=test.marks||1;
  const { output: actual, error: execError } = await runCommand(
    containerName,   
    runCmd,        
    input,          
    timeout,        
    1024 * 100      
  );
  
  let verdict = 'Passed';
  let obtainedMarks=0;
  if (execError) {
    if (execError.includes('Time')) verdict = 'TLE';
    else if (execError.includes('Memory')) verdict = 'MLE';
    else verdict = 'Runtime Error';
  } else if (actual !== expected) {
    verdict = 'Failed';
  }
  else{
    obtainedMarks=marks;
  }
  
  const result = {
    verdict,
    obtainedMarks,
    totalMarks: marks,
    error: verdict !== 'Passed' ? execError : undefined
  };
  
  if (!isHidden) {
    result.input = input;
    result.expected = expected;
    result.actual = actual;
  }
  
  return result;
}
catch(err){
  console.log(err);
}
};


  try {
    const results = await Promise.all(testCases.map(runTestCase));
    await fs.remove(tempDir);
    const obtainedMarks = results.reduce((acc, r) => acc + (r.obtainedMarks || 0), 0);
const totalMarks = results.reduce((acc, r) => acc + (r.totalMarks || 0), 0);
    const passedCount = results.filter(r => r.verdict === 'Passed').length;
    const totalCount = testCases.length;
    const submission = new Submission({
      ...(contestId && { contestId,obtainedMarks}),
      userID: req.user.id,
      questionID: questionId,
      passed: passedCount,
      total: totalCount,
      totalMarks,
    language,
    code
  });

  await submission.save(); 
  if(contestId){
    const leaderboard=await getContestLeaderboard(contestId);
    io.to(`Contest_${contestId}`).emit('leaderboard-changed', { contestId, leaderboard });
  }
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
    const submissions=await Submission.find({userID,questionID}).sort({ submittedAt: -1 });;
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
