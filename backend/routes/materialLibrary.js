import { Router } from 'express';
import MaterialLibrary, { findOne, find, countDocuments } from '../models/MaterialLibrary.js';
import Material from '../models/Material.js';
import Classroom from '../models/Classroom.js';

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

// Post material to classroom
router.post('/post-to-classroom', async (req, res) => {
  try {
    const { materialId, classroomId, teacherId } = req.body;
    
    if (!teacherId || !classroomId || !materialId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if material exists in library
    const libraryMaterial = await findOne({ material: materialId })
      .populate('material')
      .populate('sharedBy');
    
    if (!libraryMaterial) {
      return res.status(404).json({ message: 'Material not found in library' });
    }

    // Check if classroom exists and teacher has access
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (classroom.createdBy.toString() !== teacherId && !classroom.enrolledTeachers.includes(teacherId)) {
      return res.status(403).json({ message: 'Not authorized to post in this classroom' });
    }

    // Create new material in classroom
    const newMaterial = new Material({
      title: libraryMaterial.material.title,
      description: libraryMaterial.material.description,
      pdfLinks: libraryMaterial.material.pdfLinks,
      postedBy: teacherId,
      classroom: classroomId
    });

    await newMaterial.save();

    // Add material to classroom's materials array
    classroom.materials.push(newMaterial._id);
    await classroom.save();

    // Populate the material before sending response
    const populatedMaterial = await Material.findById(newMaterial._id)
      .populate('postedBy', 'name email')
      .populate({
        path: 'classroom',
        select: 'name section createdAt createdBy',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      });

    res.status(201).json(populatedMaterial);
  } catch (error) {
    console.error('Error posting material to classroom:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete material from library
router.delete('/:id', async (req, res) => {
  try {
    const { teacherId } = req.body;
    const libraryMaterial = await findOne({ _id: req.params.id })
      .populate('sharedBy');

    if (!libraryMaterial) {
      return res.status(404).json({ message: 'Material not found in library' });
    }

    // Check if the teacher is the one who shared the material
    if (libraryMaterial.sharedBy._id.toString() !== teacherId) {
      return res.status(403).json({ message: 'Not authorized to delete this material' });
    }

    await MaterialLibrary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material removed from library successfully' });
  } catch (error) {
    console.error('Error deleting material from library:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 