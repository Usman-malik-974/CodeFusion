const {Question,User}=require('../models/index');
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
        createdBy: req.user.id
      });
      const savedQuestion = await newQuestion.save();
      const questionObj = savedQuestion.toObject();
      delete questionObj.createdBy;
      return res.status(201).json({
        message: 'Question created successfully.',
        question: questionObj
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

  const assignQuestion = async (req, res) => {
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

  const unassignQuestion = async (req, res) => {
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
          else return {input:t.input,output:t.output,hidden:t.hidden};
        }),
      }))
     });
    } catch (error) {
      console.error('Error fetching user questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  module.exports={addQuestion,getAllQuestions,deleteQuestion,getAssignedUsers,getUnassignedUsers,assignQuestion,unassignQuestion,getUserQuestions};