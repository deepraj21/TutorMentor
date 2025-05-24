import express from 'express';
import { uploadFile, deleteFile, getFileDetails } from '../controller/FileController.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/:fileId', getFileDetails);
router.delete('/:fileId', deleteFile);

export default router; 