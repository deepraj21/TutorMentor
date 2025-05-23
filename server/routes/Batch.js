import express from 'express';
import {
  createBatch,
  joinBatch,
  updateStudentStatus,
  getAllBatches,
  getBatchDetails
} from '../controller/BatchController.js';

const router = express.Router();

router.post('/create', createBatch);
router.post('/all', getAllBatches);
router.put('/update-status', updateStudentStatus);
router.get('/:batchId', getBatchDetails);
router.post('/join', joinBatch);

export default router; 