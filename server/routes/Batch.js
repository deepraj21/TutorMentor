import express from 'express';
import {
  createBatch,
  joinBatch,
  updateStudentStatus,
  getAllBatches,
  getBatchDetails,
  deleteBatch
} from '../controller/BatchController.js';

const router = express.Router();

router.post('/create', createBatch);
router.post('/all', getAllBatches);
router.put('/update-status', updateStudentStatus);
router.get('/:batchId', getBatchDetails);
router.post('/join', joinBatch);
router.delete('/delete', deleteBatch);

export default router; 