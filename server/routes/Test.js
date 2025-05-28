import express from 'express';
import {
    createTest,
    updateTest,
    publishTest,
    startTest,
    submitTest,
    endTest,
    getBatchTests,
    getTest,
    getTestResults,
    deleteTest
} from '../controller/Test.js';

const router = express.Router();

// Create a new test (admin only)
router.post('/', createTest);

// Update a test (admin only)
router.put('/:id', updateTest);

// Publish a test (admin only)
router.put('/:id/publish', publishTest);

// Start a test (admin only)
router.put('/:id/start', startTest);

// End a test (admin only)
router.put('/:id/end', endTest);

// Submit test answers (students only)
router.post('/:id/submit', submitTest);

// Get all tests for a batch
router.get('/batch/:batchId', getBatchTests);

// Get test results
router.get('/:id/results', getTestResults);

// Get a single test
router.get('/:id', getTest);

// Delete a test (admin only)
router.delete('/:id', deleteTest);

export default router; 