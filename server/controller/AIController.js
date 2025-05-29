import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import Chat from '../model/Chat.js';
import User from '../model/User.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const streamResponse = async (query, res, chatLanguage, history = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `
      You are Tutor AI who is a tutor and mentor assistant and can help user with any type of doubts related to studies and can help them with their studies and can also help them with their problems.
      You have to respond in ${chatLanguage} language.
      Your answer should be to the point and not too long or short and dont add unecessary things.
      `
    });

    const chat = model.startChat({
      history: history
    });

    const result = await chat.sendMessageStream(query);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    
    res.end();
  } catch (error) {
    console.error('Error streaming response:', error);
    res.status(500).json({ error: 'Failed to process streaming request' });
  }
};

export const saveChat = async (req, res) => {
  try {
    const { title, messages, userId } = req.body;

    const chat = new Chat({
      userId,
      messages,
      title
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllChats = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const userId = user._id
  try {
    const chats = await Chat.find({ userId})
      .select('title createdAt messages')
      .sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllChats = async (req, res) => {
  try {
    const deletedChats = await Chat.deleteMany({ userId: req.user._id });

    if (deletedChats.deletedCount === 0) {
      return res.status(404).json({ message: 'No chats found to delete' });
    }

    res.json({ message: 'All chats deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific chat
export const getChatById = async (req, res) => {
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
};

// Delete specific chat
export const deleteChatById = async (req, res) => {
  try {
    const deletedChat = await Chat.findOneAndDelete({ 
      _id: req.params.chatId, 
      userId: req.user._id 
    });

    if (!deletedChat) {
      return res.status(404).json({ message: 'Chat not found or not authorized to delete' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 