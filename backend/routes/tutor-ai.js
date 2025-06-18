import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import Chat from '../models/Chat.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js'; 

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const router = express.Router();

// Increase payload limit to 50mb
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));

router.post('/stream', async (req, res) => {
  try {
    const { query, chatLanguage, history, imageData } = req.body;

    if (!query && (!imageData || imageData.length === 0)) {
      return res.status(400).json({ success: false, error: 'Query or at least one image is required' });
    }

    // Check if more than 4 images are provided
    if (imageData && imageData.length > 4) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maximum 4 images allowed.' 
      });
    }

    // Check each image size (max 20MB for Gemini API)
    if (imageData) {
      for (const img of imageData) {
        if (img.length > 20 * 1024 * 1024) {
          return res.status(400).json({ 
            success: false, 
            error: 'One or more images exceed the maximum size of 20MB.' 
          });
        }
      }
    }

    // Sanitize history for Gemini API
    function sanitizeHistory(history) {
      return (history || []).map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => ({
          text: part.text || ""
        }))
      }));
    }
    const sanitizedHistory = sanitizeHistory(history);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `
      You are Tutor AI who is a tutor and mentor assistant and can help user with any type of doubts related to studies and can help them with their studies and can also help them with their problems.
      You have to respond in ${chatLanguage} language.
      Your answer should be to the point and not too long or short and dont add unecessary things.
      `
    });

    const chat = model.startChat({
      history: sanitizedHistory
    });

    let contents = [];
    
    // If there are images, add them to the contents
    if (imageData && imageData.length > 0) {
      for (const img of imageData) {
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: img
          }
        });
      }
    }
    
    // Add the text query
    if (query) {
      contents.push({ text: query });
    }

    // Set proper headers for streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const result = await chat.sendMessageStream(contents);
    
    try {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(chunkText);
      }
      res.end();
    } catch (streamError) {
      console.error('Stream error:', streamError);
      // If we haven't sent any response yet, send an error response
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Error processing stream' });
      } else {
        // If we've already started streaming, end the response
        res.end();
      }
    }
  } catch (error) {
    console.error('Error processing request:', error);
    // Only send error response if we haven't sent any response yet
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
});

router.post('/save', async (req, res) => {
  try {
    const { title, messages, userId, userModel } = req.body;

    const chat = new Chat({
      userId,
      userModel,
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
  const { email, userModel } = req.body;
  let user;
  if (userModel === 'Student') {
    user = await Student.findOne({ email });
  } else if (userModel === 'Teacher') {
    user = await Teacher.findOne({ email });
  } else {
    return res.status(400).json({ message: 'Invalid userModel' });
  }
  if (!user) {
    return res.status(404).json({ message: `${userModel.toLowerCase()} not found` });
  }
  const userId = user._id;
  try {
    const chats = await Chat.find({ userId, userModel })
      .select('title createdAt messages')
      .sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:chatId', async (req, res) => {
  try {
    const { userId, userModel } = req.query;
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId,
      userModel
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
  const { userId, userModel } = req.body;
  try {
    const deletedChat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      userId,
      userModel
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