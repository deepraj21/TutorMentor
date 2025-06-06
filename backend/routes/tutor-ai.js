import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import Chat from '../models/Chat.js';
import Student from '../models/Student.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const router = express.Router();

router.post('/stream', async (req, res) => {
  try {
    const { query, chatLanguage, history } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `
      You are Tutor AI who is a tutor and mentor assistant and can help user with any type of doubts related to studies and can help them with their studies and can also help them with their problems.
      You have to respond in ${chatLanguage} language.
      Your answer should be to the point and not too long or short and dont add unecessary things.
      `
    });

    const chat = model.startChat({
      history: history || []
    });

    const result = await chat.sendMessageStream(query);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    
    res.end();
  } catch (error) {
    console.error('Error processing stream:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { title, messages, studentId } = req.body;

    const chat = new Chat({
      studentId,
      messages,
      title
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/chats', async (req, res) => {
  const { email } = req.body;
  const student = await Student.findOne({ email });
  if (!student) {
    return res.status(404).json({ message: 'student not found' });
  }
  const studentId = student._id
  try {
    const chats = await Chat.find({ studentId })
      .select('title createdAt messages')
      .sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:chatId', async (req, res) => {
  const { studentId } = req.body;
  try {
    const deletedChat = await Chat.findOneAndDelete({ 
      _id: req.params.chatId, 
      studentId
    });

    if (!deletedChat) {
      return res.status(404).json({ message: 'Chat not found or not authorized to delete' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;