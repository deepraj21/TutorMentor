import express from 'express';
import {
  streamResponse,
  saveChat,
  getAllChats,
  deleteAllChats,
  getChatById,
  deleteChatById
} from '../controller/AIController.js';

const router = express.Router();

router.post('/stream', async (req, res) => {
  try {
    const { query, history } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    await streamResponse(query, res, history || []);
  } catch (error) {
    console.error('Error processing stream:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/save', saveChat);

router.post('/chats', getAllChats);

router.delete('/all', deleteAllChats);

router.get('/:chatId', getChatById);

router.delete('/:chatId', deleteChatById);

export default router; 