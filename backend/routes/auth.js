import express from 'express';
import bcrypt from 'bcryptjs';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

const router = express.Router();

// Teacher Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { email, name, password } = req.body;

        const existingTeacher = await Teacher.findOne({
            $or: [{ email }, { name }]
        });

        if (existingTeacher) {
            return res.status(400).json({
                message: 'Teacher already exists with this email or name'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new teacher
        const teacher = new Teacher({
            email,
            name,
            password: hashedPassword
        });

        await teacher.save();

        res.status(201).json({
            message: 'Teacher registered successfully',
            teacher: {
                id: teacher._id,
                email: teacher.email,
                name: teacher.name
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error in signup process' });
    }
});

// Teacher Signin Route
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find teacher by email only
        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            message: 'Login successful',
            teacher: {
                id: teacher._id,
                email: teacher.email,
                name: teacher.name
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Error in signin process' });
    }
});

// Student Google Signin
router.post('/google-signin', async (req, res) => {
    const { name, email } = req.body;

    if (name && email) {
        try {
            let student = await Student.findOne({ email });

            if (student) {
                return res.status(200).json({ message: 'Authentication successful', student });
            }

            student = new Student({ name, email });
            await student.save();

            return res.status(200).json({ message: 'Authentication successful', student });
        } catch (error) {
            return res.status(500).json({ message: 'Error saving user', error: error.message });
        }
    } else {
        return res.status(400).json({ message: 'Authentication failed' });
    }
});

export default router;
