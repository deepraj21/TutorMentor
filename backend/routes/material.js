import express from 'express';
import Material from '../models/Material.js';
import Classroom from '../models/Classroom.js';

const router = express.Router();

// Create a new material
router.post('/', async (req, res) => {
    try {
        const { title, description, pdfLinks, classroomId, teacherId } = req.body;
        
        // Check if classroom exists
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check if user is either the creator or an enrolled teacher
        if (classroom.createdBy.toString() !== teacherId && !classroom.enrolledTeachers.includes(teacherId)) {
            return res.status(403).json({ message: 'Not authorized to post materials in this classroom' });
        }

        const material = new Material({
            title,
            description,
            pdfLinks,
            postedBy: teacherId,
            classroom: classroomId
        });

        await material.save();

        // Add material to classroom's materials array
        classroom.materials.push(material._id);
        await classroom.save();

        res.status(201).json(material);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all materials for a classroom
router.get('/classroom/:classroomId', async (req, res) => {
    try {
        const materials = await Material.find({ classroom: req.params.classroomId })
            .populate('postedBy', 'name email')
            .populate({
                path: 'classroom',
                select: 'name section createdAt createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific material
router.get('/:id', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id)
            .populate('postedBy', 'name email')
            .populate({
                path: 'classroom',
                select: 'name section createdAt createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'name email'
                }
            });
        
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }
        
        res.json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a material
router.patch('/:id', async (req, res) => {
    try {
        const { teacherId, title, description, pdfLinks } = req.body;
        
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Check if user is the one who posted the material
        if (material.postedBy.toString() !== teacherId) {
            return res.status(403).json({ message: 'Not authorized to update this material' });
        }

        // Update the material fields
        material.title = title;
        material.description = description;
        material.pdfLinks = pdfLinks;

        await material.save();

        // Populate the material before sending response
        const populatedMaterial = await Material.findById(material._id)
            .populate('postedBy', 'name email')
            .populate({
                path: 'classroom',
                select: 'name section createdAt createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'name email'
                }
            });

        res.json(populatedMaterial);
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete a material
router.delete('/:id', async (req, res) => {
    try {
        const { teacherId } = req.body;
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Check if user is the one who posted the material
        if (material.postedBy.toString() !== teacherId) {
            return res.status(403).json({ message: 'Not authorized to delete this material' });
        }

        // Remove material from classroom's materials array
        const classroom = await Classroom.findById(material.classroom);
        classroom.materials = classroom.materials.filter(m => m.toString() !== material._id.toString());
        await classroom.save();

        await Material.findByIdAndDelete(material._id);
        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 