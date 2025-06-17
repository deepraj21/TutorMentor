import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD 
    },
    tls: {
        rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 3
});

// Function to send welcome email
export const sendWelcomeEmail = async (studentEmail, studentName) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: studentEmail,
        subject: 'Welcome to TutorMentor!',
        html: `
            <h1>Welcome to TutorMentor!</h1>
            <p>Dear ${studentName},</p>
            <p>We're excited to have you join our learning community! At TutorMentor, we're committed to providing you with the best educational experience.</p>
            <p>You can now:</p>
            <ul>
                <li>Access your personalized dashboard</li>
                <li>Connect with teachers</li>
                <li>Join classes and start learning</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The TutorMentor Team</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

// Function to send verification code
export const sendVerificationCode = async (email, name, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your TutorMentor Password Reset Code',
        html: `
            <h1>Password Reset Verification - TutorMentor</h1>
            <p>Dear ${name},</p>
            <p>We received a request to reset your password. Please use the following verification code to proceed:</p>
            <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px;">
                <strong>${code}</strong>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
            <p>Best regards,<br>The TutorMentor Team</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification code email:', error);
        throw error;
    }
};

// Function to send password reset confirmation
export const sendPasswordResetEmail = async (email, name) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your TutorMentor Password Has Been Reset',
        html: `
            <h1>Password Reset Successful - TutorMentor</h1>
            <p>Dear ${name},</p>
            <p>Your password has been successfully reset.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The TutorMentor Team</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending password reset confirmation email:', error);
        throw error;
    }
};

// Function to send class invite
export const sendClassInvite = async (recipientEmail, className, classCode, teacherName) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `Join ${className} on TutorMentor`,
        html: `
            <h1>Class Invitation - TutorMentor</h1>
            <p>Hello,</p>
            <p>${teacherName} has invited you to join their class "${className}" on TutorMentor.</p>
            <p>To join the class, please use the following class code:</p>
            <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px;">
                <strong>${classCode}</strong>
            </div>
            <p>Steps to join:</p>
            <ol>
                <li>Log in to your TutorMentor account</li>
                <li>Click on "Join Class"</li>
                <li>Enter the class code above</li>
            </ol>
            <p>If you don't have a TutorMentor account, you can create one for free.</p>
            <p>Best regards,<br>The TutorMentor Team</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending class invite email:', error);
        throw error;
    }
}; 