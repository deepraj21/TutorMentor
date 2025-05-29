import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    // Add these settings to prevent spam
    tls: {
        rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 3
});

// Email templates
const emailTemplates = {
    welcome: (name) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2c3e50; text-align: center;">Welcome to TutorMentor!</h2>
            <p style="color: #34495e; font-size: 16px;">Dear ${name},</p>
            <p style="color: #34495e; font-size: 16px;">We're thrilled to have you join our learning community! Your journey to success starts here.</p>
            <p style="color: #34495e; font-size: 16px;">Best regards,<br>The TutorMentor Team</p>
        </div>
    `,
    batchRequest: (studentName, studentEmail, batchName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2c3e50; text-align: center;">New Batch Join Request</h2>
            <p style="color: #34495e; font-size: 16px;">A new student has requested to join a batch:</p>
            <ul style="color: #34495e; font-size: 16px;">
                <li><strong>Student Name:</strong> ${studentName}</li>
                <li><strong>Student Email:</strong> ${studentEmail}</li>
                <li><strong>Batch Name:</strong> ${batchName}</li>
            </ul>
            <p style="color: #34495e; font-size: 16px;">Please login to the admin portal to review and approve this request.</p>
        </div>
    `,
    batchApproved: (name, batchName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2c3e50; text-align: center;">Congratulations! 🎉</h2>
            <p style="color: #34495e; font-size: 16px;">Dear ${name},</p>
            <p style="color: #34495e; font-size: 16px;">Great news! Your request to join <strong>${batchName}</strong> has been approved!</p>
            <p style="color: #34495e; font-size: 16px;">You can now access all the resources and start your learning journey.</p>
            <p style="color: #34495e; font-size: 16px;">Best regards,<br>The TutorMentor Team</p>
        </div>
    `
};

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: `"TutorMentor" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high',
                'X-Mailer': 'TutorMentor Mailer'
            }
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export { emailTemplates }; 