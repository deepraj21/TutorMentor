import express from 'express';
import bcrypt from 'bcryptjs';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { sendWelcomeEmail, sendVerificationCode, sendPasswordResetEmail } from '../utils/emailService.js';

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

            // Create new student
            student = new Student({ name, email });
            await student.save();

            // Send welcome email to new student
            await sendWelcomeEmail(email, name);

            return res.status(200).json({ message: 'Authentication successful', student });
        } catch (error) {
            return res.status(500).json({ message: 'Error saving user', error: error.message });
        }
    } else {
        return res.status(400).json({ message: 'Authentication failed' });
    }
});

// Request Password Reset (Step 1)
router.post('/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;

        // Find teacher by email
        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            return res.status(404).json({ message: 'No teacher found with this email' });
        }

        // Generate a 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store verification code and expiry (15 minutes)
        teacher.resetPasswordCode = verificationCode;
        teacher.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await teacher.save();

        // Send verification code email
        await sendVerificationCode(email, teacher.name, verificationCode);

        res.json({ 
            message: 'Verification code sent successfully',
            email: email // Send back email for next step
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Error in password reset process' });
    }
});

// Verify only the code (no password reset)
router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            return res.status(404).json({ message: 'No teacher found with this email' });
        }
        if (!teacher.resetPasswordCode || !teacher.resetPasswordExpires) {
            return res.status(400).json({ message: 'No password reset request found' });
        }
        if (teacher.resetPasswordExpires < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }
        if (teacher.resetPasswordCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        // Only verify, do not reset password
        res.json({ message: 'Code verified' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying code' });
    }
});

// Verify Code and Reset Password (Step 2)
router.post('/verify-and-reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Find teacher by email
        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            return res.status(404).json({ message: 'No teacher found with this email' });
        }

        // Check if verification code exists and is valid
        if (!teacher.resetPasswordCode || !teacher.resetPasswordExpires) {
            return res.status(400).json({ message: 'No password reset request found' });
        }

        // Check if code has expired
        if (teacher.resetPasswordExpires < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }

        // Verify code
        if (teacher.resetPasswordCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset fields
        teacher.password = hashedPassword;
        teacher.resetPasswordCode = undefined;
        teacher.resetPasswordExpires = undefined;
        await teacher.save();

        // Send confirmation email
        await sendPasswordResetEmail(email, teacher.name);

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Password reset verification error:', error);
        res.status(500).json({ message: 'Error in password reset process' });
    }
});

export default router;
