import express from 'express';
import { createFolder, getFolderContents, deleteFolder } from '../controller/FolderController.js';

const router = express.Router();

router.post('/', createFolder);
router.get('/:batchId', getFolderContents);
router.get('/:batchId/folder/:folderId', getFolderContents);
router.delete('/:folderId', deleteFolder);

export default router; 