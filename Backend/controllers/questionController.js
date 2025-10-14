const {Question,User,Batch}=require('../models/index');
const isAdmin = require('../utils/isAdmin');

const getAllQuestions = async (req, res) => {
  try {
    if(!(await isAdmin(req.user.id))){
      return res.status(403).json({ error: 'Unauthorized Access.' });
    }
    const questions = await Question.find({}, '-createdBy'); 
    res.status(200).json({
      questions: questions.map(q => ({
        id: q._id,
        title: q.title,
        statement: q.statement,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        tags: q.tags,
        difficulty: q.difficulty,
        testCases: q.testCases
      }))
    });

  } catch (err) {
    console.error('Get All Questions Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const addQuestion = async (req, res) => {
  if(!(await isAdmin(req.user.id))){
    return res.status(403).json({ error: 'Unauthorized Access.' });
  }
    try {
      const {
        title,
        statement,
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        tags,
        difficulty,
        testCases
      } = req.body;
  
      if (!title || !statement || !testCases || testCases.length === 0) {
        return res.status(400).json({ error: 'Title, statement, and at least one test case are required.' });
      }
   
      let totalMarks=0;
      testCases.forEach((t)=>{totalMarks+=parseInt(t.marks)});
      const newQuestion = new Question({
        title,
        statement,
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        tags,
        difficulty,
        testCases,
        totalMarks,
        createdBy: req.user.id
      });
      const savedQuestion = await newQuestion.save();
      const questionObj = savedQuestion.toObject();
      delete questionObj.createdBy;
      return res.status(201).json({
        message: 'Question created successfully.',
        question: {
          id: questionObj._id,
          title: questionObj.title,
          statement: questionObj.statement,
          inputFormat: questionObj.inputFormat,
          outputFormat: questionObj.outputFormat,
          sampleInput: questionObj.sampleInput,
          sampleOutput: questionObj.sampleOutput,
          tags: questionObj.tags,
          difficulty: questionObj.difficulty,
          testCases: questionObj.testCases
        }
      });
  
    } catch (err) {
      console.error('Add Question Error:', err);
      if (err.name === 'ValidationError') {
        const field = Object.keys(err.errors)[0];
        const errorMessage = err.errors[field].message;
        return res.status(400).json({ error: errorMessage });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const deleteQuestion = async (req, res) => {
    try {
      if(!(await isAdmin(req.user.id))){
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const { id } = req.params;
  
      const deletedQuestion = await Question.findByIdAndDelete(id);
  
      if (!deletedQuestion) {
        return res.status(404).json({ error: 'Question not found' });
      }
      await User.updateMany(
        { assignedQuestions: id }, 
        { $pull: { assignedQuestions: id } }
      );

      await Batch.updateMany(
        { assignedQuestions: id }, 
        { $pull: { assignedQuestions: id } }
      );
      return res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Server error while deleting user' });
    }
  };

  const getAssignedUsers=async (req,res)=>{
    try {
      if(!(await isAdmin(req.user.id))){
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const { id } = req.params;
      const users = await User.find({ assignedQuestions: id ,role:'user'}, '_id fullname email rollno course session');
      res.status(200).json({  users: users.map(user => ({
        id: user._id,
        name: user.fullname,
        email: user.email,
        rollno:user.rollno,
        course:user.course,
        session:user.session
      })) });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  const getUnassignedUsers=async (req,res)=>{
    try {
      if(!(await isAdmin(req.user.id))){
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const { id } = req.params;
      const users = await User.find({ role:'user',assignedQuestions:{ $ne: id } }, '_id fullname email rollno course session');
      res.status(200).json({  users: users.map(user => ({
        id: user._id,
        name: user.fullname,
        email: user.email,
        rollno:user.rollno,
        course:user.course,
        session:user.session
      })) });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  const assignQuestiontoUser = async (req, res) => {
    try {
      if(!(await isAdmin(req.user.id))){
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const { questionId, userId } = req.body;
      if(!questionId || !userId){
        return res.status(400).json({ error: 'Please provide all details.' });
      }
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.assignedQuestions.includes(questionId)) {
        return res.status(400).json({ error: 'Question already assigned to this user' });
      }
      user.assignedQuestions.push(questionId);
      await user.save();
  
      res.status(200).json({ message: 'Question assigned successfully' });
    } catch (error) {
      console.error('Error assigning question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const unassignQuestiontoUser = async (req, res) => {
    try {
      if (!(await isAdmin(req.user.id))) {
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const { questionId, userId } = req.body;
      if (!questionId || !userId) {
        return res.status(400).json({ error: 'Please provide all details.' });
      }
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (!user.assignedQuestions.includes(questionId)) {
        return res.status(400).json({ error: 'Question is not assigned to this user' });
      }
      user.assignedQuestions = user.assignedQuestions.filter(
        (qId) => qId.toString() !== questionId
      );
      await user.save();
      res.status(200).json({ message: 'Question unassigned successfully'});
    } catch (error) {
      console.error('Error unassigning question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const getUserQuestions = async (req, res) => {
    try {
      const userId = req.user.id;
      if (await isAdmin(req.user.id)) {
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const user = await User.findById(userId).populate('assignedQuestions');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ questions: user.assignedQuestions.map(q => ({
        id: q._id,
        title: q.title,
        statement: q.statement,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        tags: q.tags,
        difficulty: q.difficulty,
        testCases: q.testCases.map((t)=>{
          if(t.hidden) return {hidden:true};
          else return {input:t.input,output:t.output,hidden:t.hidden,marks:t.marks};
        }),
      }))
     });
    } catch (error) {
      console.error('Error fetching user questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  const updateQuestion = async (req, res) => {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: 'Unauthorized Access.' });
    }
  
    try {
      const {
        id,
        title,
        statement,
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        tags,
        difficulty,
        testCases,
      } = req.body;
      if (!id || !title || !statement || !testCases || testCases.length === 0) {
        return res.status(400).json({
          error: 'questionId, title, statement, and at least one test case are required.',
        });
      }
      const question = await Question.findById(id);
  
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      let total=0;
      testCases.forEach((t)=>{total+=parseInt(t.marks)});
      question.title = title;
      question.statement = statement;
      question.inputFormat = inputFormat;
      question.outputFormat = outputFormat;
      question.sampleInput = sampleInput;
      question.sampleOutput = sampleOutput;
      question.tags = tags;
      question.difficulty = difficulty;
      question.testCases = testCases;
      question.totalMarks=total;
      await question.save();
      return res.status(200).json({
        message: 'Question updated successfully',
        question:{
          id: question._id,
        title: question.title,
        statement: question.statement,
        inputFormat: question.inputFormat,
        outputFormat: question.outputFormat,
        sampleInput: question.sampleInput,
        sampleOutput: question.sampleOutput,
        tags: question.tags,
        difficulty: question.difficulty,
        testCases: question.testCases
      }
      });
    } catch (err) {
      console.error('Update Question Error:', err);
      if (err.name === 'ValidationError') {
        const field = Object.keys(err.errors)[0];
        const errorMessage = err.errors[field].message;
        return res.status(400).json({ error: errorMessage });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const getQuestion = async (req, res) => {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: 'Unauthorized Access.' });
    }
  
    try {
      const id=req.params.id;
      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      return res.status(200).json({
        question:{
          id: question._id,
        title: question.title,
        statement: question.statement,
        inputFormat: question.inputFormat,
        outputFormat: question.outputFormat,
        sampleInput: question.sampleInput,
        sampleOutput: question.sampleOutput,
        tags: question.tags,
        difficulty: question.difficulty,
        testCases: question.testCases
      }
      });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const getAssignedBatches=async (req,res)=>{
    try {
      if(!(await isAdmin(req.user.id))){
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const { id } = req.params;
      const batches = await Batch.find({ assignedQuestions: id}, 'id name users assignedQuestions');
      res.status(200).json({
        batches: batches.map((batch) => ({
          id: batch._id,
          batchName: batch.name,
          assignedQuestions: batch.assignedQuestions,
          users: batch.users,
        }))
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  const getUnassignedBatches=async (req,res)=>{
    try {
      if(!(await isAdmin(req.user.id))){
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const { id } = req.params;
      const batches= await Batch.find({assignedQuestions:{ $ne: id } }, 'id name users assignedQuestions');
      res.status(200).json({
        batches: batches.map((batch) => ({
          id: batch._id,
          batchName: batch.name,
          assignedQuestions: batch.assignedQuestions,
          users: batch.users,
        }))
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  const assignQuestiontoBatch = async (req, res) => {
    try {
      if(!(await isAdmin(req.user.id))){
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const { questionId, batchId } = req.body;
      if(!questionId || !batchId){
        return res.status(400).json({ error: 'Please provide all details.' });
      }
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }
      if (batch.assignedQuestions.includes(questionId)) {
        return res.status(400).json({ error: 'Question already assigned to this batch' });
      }
      batch.assignedQuestions.push(questionId);
      await batch.save();
  
      res.status(200).json({ message: 'Question assigned successfully' });
    } catch (error) {
      console.error('Error assigning question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const unassignQuestiontoBatch = async (req, res) => {
    try {
      if (!(await isAdmin(req.user.id))) {
        return res.status(403).json({ error: 'Unauthorized Access.' });
      }
      const { questionId, batchId } = req.body;
      if (!questionId || !batchId) {
        return res.status(400).json({ error: 'Please provide all details.' });
      }
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }
      if (!batch.assignedQuestions.includes(questionId)) {
        return res.status(400).json({ error: 'Question is not assigned to this batch' });
      }
      batch.assignedQuestions = batch.assignedQuestions.filter(
        (qId) => qId.toString() !== questionId
      );
      await batch.save();
      res.status(200).json({ message: 'Question unassigned successfully'});
    } catch (error) {
      console.error('Error unassigning question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  module.exports={addQuestion,getAllQuestions,deleteQuestion,getAssignedUsers,getUnassignedUsers,assignQuestiontoUser,unassignQuestiontoUser,getUserQuestions,updateQuestion,getQuestion,getAssignedBatches,getUnassignedBatches,assignQuestiontoBatch,unassignQuestiontoBatch};