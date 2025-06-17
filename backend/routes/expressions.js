import { Router } from 'express';
import Expression, { find, findOneAndUpdate, findOneAndDelete } from '../models/Expression.js';

const router = Router();

// Get all expressions for a teacher
router.get('/', async (req, res) => {
    try {
        const { teacherId } = req.query;
        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }
        const expressions = await find({ teacherId });
        res.json(expressions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expressions', error: error.message });
    }
});

// Search expressions by title
router.get('/search', async (req, res) => {
    try {
        const { query, teacherId } = req.query;
        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }
        if (!query) {
            return res.json([]);
        }
        
        const expressions = await find({
            teacherId,
            title: { $regex: query, $options: 'i' }
        });
        
        res.json(expressions);
    } catch (error) {
        res.status(500).json({ message: 'Error searching expressions', error: error.message });
    }
});

// Create a new expression
router.post('/', async (req, res) => {
    try {
        const { type, content, title, teacherId } = req.body;
        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }
        
        const expression = new Expression({
            teacherId,
            type,
            content,
            title
        });
        
        await expression.save();
        res.status(201).json(expression);
    } catch (error) {
        res.status(400).json({ message: 'Error creating expression', error: error.message });
    }
});

// Update an expression
router.put('/:id', async (req, res) => {
    try {
        const { type, content, title, teacherId } = req.body;
        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }
        
        const expression = await findOneAndUpdate(
            { _id: req.params.id, teacherId },
            { type, content, title },
            { new: true }
        );
        
        if (!expression) {
            return res.status(404).json({ message: 'Expression not found' });
        }
        
        res.json(expression);
    } catch (error) {
        res.status(400).json({ message: 'Error updating expression', error: error.message });
    }
});

// Delete an expression
router.delete('/:id', async (req, res) => {
    try {
        const { teacherId } = req.query;
        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }
        
        const expression = await findOneAndDelete({
            _id: req.params.id,
            teacherId
        });
        
        if (!expression) {
            return res.status(404).json({ message: 'Expression not found' });
        }
        
        res.json({ message: 'Expression deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting expression', error: error.message });
    }
});

export default router; 