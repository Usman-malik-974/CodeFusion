const {Question}=require('../models/index');
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
        testCases: q.testCases,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt
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
  
      return res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Server error while deleting user' });
    }
  };

  

  module.exports={addQuestion,getAllQuestions,deleteQuestion};