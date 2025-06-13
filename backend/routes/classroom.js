import express from 'express';
import Classroom from '../models/Classroom.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { sendClassInvite } from '../utils/emailService.js';

const router = express.Router();

// Generate a unique 6-digit code
const generateClassCode = async () => {
    let code;
    let isUnique = false;
    
    while (!isUnique) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const existingClass = await Classroom.findOne({ classCode: code });
        if (!existingClass) {
            isUnique = true;
        }
    }
    return code;
};

// Create a new classroom
router.post('/', async (req, res) => {
    try {
        const { name, section, teacherId } = req.body;

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(403).json({ message: 'Only teachers can create classrooms' });
        }

        // Validate required fields
        if (!name || !section) {
            return res.status(400).json({ message: 'Name and section are required' });
        }

        // Generate unique class code
        const classCode = await generateClassCode();

        // Create new classroom
        const classroom = new Classroom({
            name,
            section,
            createdBy: teacher._id,
            classCode
        });

        await classroom.save();

        res.status(201).json({
            message: 'Classroom created successfully',
            classroom
        });
    } catch (error) {
        console.error('Error creating classroom:', error);
        res.status(500).json({ message: 'Error creating classroom', error: error.message });
    }
});

// Delete a classroom
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherId } = req.body;

        // Verify the teacher owns this classroom
        const classroom = await Classroom.findOne({ _id: id, createdBy: teacherId });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found or unauthorized' });
        }

        // Remove classroom from all students' enrolledClassrooms
        await Student.updateMany(
            { enrolledClassrooms: id },
            { $pull: { enrolledClassrooms: id } }
        );

        // Delete the classroom
        await Classroom.findByIdAndDelete(id);

        res.json({ message: 'Classroom deleted successfully' });
    } catch (error) {
        console.error('Error deleting classroom:', error);
        res.status(500).json({ message: 'Error deleting classroom', error: error.message });
    }
});

// Join classroom using class code (for both students and teachers)
router.post('/join', async (req, res) => {
    try {
        const { classCode, studentId, teacherId } = req.body;

        // Validate required fields
        if (!classCode || (!studentId && !teacherId)) {
            return res.status(400).json({ message: 'Class code and either student ID or teacher ID are required' });
        }

        // Find the classroom by class code
        const classroom = await Classroom.findOne({ classCode })
            .populate('createdBy', 'name email');
            
        if (!classroom) {
            return res.status(404).json({ message: 'Invalid class code' });
        }

        // Handle student enrollment
        if (studentId) {
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            if (student.enrolledClassrooms.includes(classroom._id)) {
                return res.status(400).json({ message: 'Student is already enrolled in this classroom' });
            }

            student.enrolledClassrooms.push(classroom._id);
            await student.save();
        }

        // Handle teacher enrollment
        if (teacherId) {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }

            // Check if teacher is the creator
            if (classroom.createdBy.toString() === teacherId) {
                return res.status(400).json({ message: 'You cannot join your own classroom' });
            }

            // Check if teacher is already enrolled
            if (classroom.enrolledTeachers.includes(teacherId)) {
                return res.status(400).json({ message: 'Teacher is already enrolled in this classroom' });
            }

            classroom.enrolledTeachers.push(teacherId);
            await classroom.save();
        }

        res.json({
            message: 'Successfully joined classroom',
            classroom: {
                ...classroom.toObject(),
                teacher: {
                    name: classroom.createdBy.name,
                    email: classroom.createdBy.email
                }
            }
        });
    } catch (error) {
        console.error('Error joining classroom:', error);
        res.status(500).json({ message: 'Error joining classroom', error: error.message });
    }
});

// Get all classrooms for a teacher (both created and enrolled)
router.post('/my-classrooms', async (req, res) => {
    const { teacherId } = req.body;

    try {
        // Check if the user is a teacher
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(403).json({ message: 'Only teachers can access their classrooms' });
        }

        // Get both created and enrolled classrooms
        const [createdClassrooms, enrolledClassrooms] = await Promise.all([
            Classroom.find({ createdBy: teacher._id }).sort({ createdAt: -1 }),
            Classroom.find({ enrolledTeachers: teacher._id })
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
        ]);

        // Transform enrolled classrooms to include teacher info
        const transformedEnrolledClassrooms = enrolledClassrooms.map(classroom => ({
            ...classroom.toObject(),
            teacher: {
                name: classroom.createdBy.name,
                email: classroom.createdBy.email
            }
        }));

        res.json({
            created: createdClassrooms,
            enrolled: transformedEnrolledClassrooms
        });
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ message: 'Error fetching classrooms', error: error.message });
    }
});

// Get a specific classroom
router.get('/:id', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('createdBy', 'username email');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        res.json(classroom);
    } catch (error) {
        console.error('Error fetching classroom:', error);
        res.status(500).json({ message: 'Error fetching classroom', error: error.message });
    }
});

// Get enrolled classrooms for a student
router.get('/enrolled/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find the student and populate their enrolled classrooms
        const student = await Student.findById(studentId)
            .populate({
                path: 'enrolledClassrooms',
                populate: {
                    path: 'createdBy',
                    select: 'name email'
                }
            });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Transform the data to include teacher information
        const classrooms = student.enrolledClassrooms.map(classroom => ({
            ...classroom.toObject(),
            teacher: {
                name: classroom.createdBy.name,
                email: classroom.createdBy.email
            }
        }));

        res.json(classrooms);
    } catch (error) {
        console.error('Error fetching enrolled classrooms:', error);
        res.status(500).json({ message: 'Error fetching enrolled classrooms', error: error.message });
    }
});

// Unenroll from a classroom
router.post('/unenroll/:classroomId', async (req, res) => {
    try {
        const { classroomId } = req.params;
        const { studentId } = req.body;

        // Validate required fields
        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student is enrolled in the classroom
        if (!student.enrolledClassrooms.includes(classroomId)) {
            return res.status(400).json({ message: 'Student is not enrolled in this classroom' });
        }

        // Remove classroom from student's enrolled classrooms
        student.enrolledClassrooms = student.enrolledClassrooms.filter(
            id => id.toString() !== classroomId
        );
        await student.save();

        res.json({ message: 'Successfully unenrolled from classroom' });
    } catch (error) {
        console.error('Error unenrolling from classroom:', error);
        res.status(500).json({ message: 'Error unenrolling from classroom', error: error.message });
    }
});

// Refresh class code
router.post('/refresh-code/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherId } = req.body;

        // Verify the teacher owns this classroom
        const classroom = await Classroom.findOne({ _id: id, createdBy: teacherId });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found or unauthorized' });
        }

        // Generate new class code
        const newClassCode = await generateClassCode();

        // Update the classroom with new code
        classroom.classCode = newClassCode;
        await classroom.save();

        res.json({
            message: 'Class code refreshed successfully',
            classroom
        });
    } catch (error) {
        console.error('Error refreshing class code:', error);
        res.status(500).json({ message: 'Error refreshing class code', error: error.message });
    }
});

// Unenroll teacher from a classroom
router.post('/teacher-unenroll/:classroomId', async (req, res) => {
    try {
        const { classroomId } = req.params;
        const { teacherId } = req.body;

        // Validate required fields
        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }

        // Find the classroom
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check if teacher is enrolled in the classroom
        if (!classroom.enrolledTeachers.includes(teacherId)) {
            return res.status(400).json({ message: 'Teacher is not enrolled in this classroom' });
        }

        // Remove teacher from classroom's enrolled teachers
        classroom.enrolledTeachers = classroom.enrolledTeachers.filter(
            id => id.toString() !== teacherId
        );
        await classroom.save();

        res.json({ message: 'Successfully unenrolled from classroom' });
    } catch (error) {
        console.error('Error unenrolling from classroom:', error);
        res.status(500).json({ message: 'Error unenrolling from classroom', error: error.message });
    }
});

// Get a specific classroom (including teachers and students)
router.get('/:id/details', async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findById(id)
            .populate('createdBy', 'name email')
            .populate('enrolledTeachers', 'name email');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Fetch enrolled students separately
        const enrolledStudents = await Student.find({ enrolledClassrooms: id }).select('name email');

        // Add enrolledStudents to the classroom object
        const classroomDetails = {
            ...classroom.toObject(),
            enrolledStudents: enrolledStudents
        };

        res.json(classroomDetails);
    } catch (error) {
        console.error('Error fetching classroom details:', error);
        res.status(500).json({ message: 'Error fetching classroom details', error: error.message });
    }
});

// Email validation regex
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Send class invite via email
router.post('/send-invite', async (req, res) => {
    try {
        const { classCode, className, teacherName, recipientEmails } = req.body;

        // Validate required fields
        if (!classCode || !className || !teacherName) {
            return res.status(400).json({ message: 'Class code, class name, and teacher name are required' });
        }

        if (!recipientEmails || !Array.isArray(recipientEmails)) {
            return res.status(400).json({ message: 'Recipient emails must be an array' });
        }

        // Filter out empty emails and validate email format
        const validEmails = recipientEmails
            .filter(email => email.trim() !== "")
            .filter(email => isValidEmail(email));

        if (validEmails.length === 0) {
            return res.status(400).json({ message: 'At least one valid email address is required' });
        }

        // Send emails in parallel
        await Promise.all(
            validEmails.map(email => sendClassInvite(email, className, classCode, teacherName))
        );

        res.json({ 
            message: 'Class invites sent successfully',
            sentTo: validEmails.length
        });
    } catch (error) {
        console.error('Error sending class invites:', error);
        res.status(500).json({ message: 'Error sending class invites', error: error.message });
    }
});

export default router; 