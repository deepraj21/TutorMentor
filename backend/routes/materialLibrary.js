import { Router } from 'express';
import MaterialLibrary, { findOne, find, countDocuments } from '../models/MaterialLibrary.js';
import { findById } from '../models/Material.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { materialId, teacherId } = req.body;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }
    
    // Check if material exists
    const material = await findById(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check if already in library
    const existingEntry = await findOne({ material: materialId });
    if (existingEntry) {
      return res.status(400).json({ message: 'Material already in library' });
    }

    const libraryEntry = new MaterialLibrary({
      material: materialId,
      sharedBy: teacherId
    });

    await libraryEntry.save();
    res.status(201).json(libraryEntry);
  } catch (error) {
    console.error('Error sharing material:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all materials from library with pagination and sorting
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'sharedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const query = find()
      .populate({
        path: 'material',
        populate: {
          path: 'postedBy',
          select: 'name email'
        }
      })
      .populate('sharedBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const [materials, total] = await Promise.all([
      query.exec(),
      countDocuments()
    ]);

    res.json({
      materials,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMaterials: total
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 