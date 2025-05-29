import Test from '../model/Test.js';
import Batch from '../model/Batch.js';
import User from '../model/User.js';
import Admin from '../model/Admin.js';
import { sendEmail } from '../utils/email.js';

// Helper function to verify admin
const verifyAdmin = async (adminId) => {
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new Error('Admin not found');
    }
    return admin;
};

// Create a new test
export const createTest = async (req, res) => {
    try {
        const { title, description, batch, questions, duration, adminId } = req.body;
        
        // Verify admin
        await verifyAdmin(adminId);
        
        const test = new Test({
            title,
            description,
            batch,
            createdBy: adminId,
            questions,
            duration
        });

        await test.save();
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a test
export const updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;
        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Verify admin
        await verifyAdmin(adminId);

        if (test.createdBy.toString() !== adminId) {
            return res.status(403).json({ message: 'Not authorized to update this test' });
        }

        if (test.status !== 'draft') {
            return res.status(400).json({ message: 'Can only update draft tests' });
        }

        const updatedTest = await Test.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedTest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Publish a test
export const publishTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;
        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Verify admin
        await verifyAdmin(adminId);

        if (test.createdBy.toString() !== adminId) {
            return res.status(403).json({ message: 'Not authorized to publish this test' });
        }

        if (test.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft tests can be published' });
        }

        test.status = 'published';
        await test.save();

        res.json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Start a test
export const startTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;
        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Verify admin
        await verifyAdmin(adminId);

        if (test.createdBy.toString() !== adminId) {
            return res.status(403).json({ message: 'Not authorized to start this test' });
        }

        if (test.status !== 'published') {
            return res.status(400).json({ message: 'Only published tests can be started' });
        }

        test.status = 'started';
        test.startTime = new Date();
        test.endTime = new Date(Date.now() + test.duration * 60000);
        await test.save();

        res.json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit test answers
export const submitTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers, userId } = req.body;
        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        if (test.status !== 'started') {
            return res.status(400).json({ message: 'Test is not active' });
        }

        // Verify user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if student has already submitted
        const existingSubmission = test.submissions.find(
            sub => sub.student.toString() === userId
        );

        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this test' });
        }

        // Calculate marks
        const processedAnswers = answers.map(answer => {
            const question = test.questions[answer.questionIndex];
            const isCorrect = answer.selectedOption === question.correctAnswer;
            return {
                questionIndex: answer.questionIndex,
                selectedOption: answer.selectedOption,
                isCorrect,
                marksObtained: isCorrect ? question.marks : 0
            };
        });

        const totalMarksObtained = processedAnswers.reduce(
            (sum, answer) => sum + answer.marksObtained,
            0
        );

        // Add submission
        test.submissions.push({
            student: userId,
            answers: processedAnswers,
            totalMarksObtained,
            submittedAt: new Date()
        });

        await test.save();

        // Send email with results
        const batch = await Batch.findById(test.batch);
        
        await sendEmail({
            to: user.email,
            subject: `Test Results: ${test.title}`,
            html: `
                <h1>Test Results</h1>
                <p>Test: ${test.title}</p>
                <p>Batch: ${batch.name}</p>
                <p>Your Score: ${totalMarksObtained}/${test.totalMarks}</p>
                <h2>Question-wise Results:</h2>
                ${processedAnswers.map((answer, index) => `
                    <div>
                        <p>Question ${index + 1}: ${answer.isCorrect ? 'Correct' : 'Incorrect'}</p>
                        <p>Marks Obtained: ${answer.marksObtained}</p>
                    </div>
                `).join('')}
            `
        });

        res.json({ message: 'Test submitted successfully', totalMarksObtained });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// End a test
export const endTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;
        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Verify admin
        await verifyAdmin(adminId);

        if (test.createdBy.toString() !== adminId) {
            return res.status(403).json({ message: 'Not authorized to end this test' });
        }

        if (test.status !== 'started') {
            return res.status(400).json({ message: 'Only started tests can be ended' });
        }

        test.status = 'ended';
        await test.save();

        // Send emails to all students who submitted
        const batch = await Batch.findById(test.batch);
        const students = await User.find({ _id: { $in: test.submissions.map(s => s.student) } });

        for (const student of students) {
            const submission = test.submissions.find(s => s.student.toString() === student._id.toString());
            
            await sendEmail({
                to: student.email,
                subject: `Test Results: ${test.title}`,
                html: `
                    <h1>Test Results</h1>
                    <p>Test: ${test.title}</p>
                    <p>Batch: ${batch.name}</p>
                    <p>Your Score: ${submission.totalMarksObtained}/${test.totalMarks}</p>
                    <h2>Question-wise Results:</h2>
                    ${submission.answers.map((answer, index) => `
                        <div>
                            <p>Question ${index + 1}: ${answer.isCorrect ? 'Correct' : 'Incorrect'}</p>
                            <p>Marks Obtained: ${answer.marksObtained}</p>
                        </div>
                    `).join('')}
                `
            });
        }

        res.json({ message: 'Test ended successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all tests for a batch
export const getBatchTests = async (req, res) => {
    try {
        const { batchId } = req.params;
        const tests = await Test.find({ batch: batchId })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single test
export const getTest = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id)
            .populate('createdBy', 'name email')
            .populate('batch', 'name');

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        res.json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get test results with student details
export const getTestResults = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findById(id)
            .populate('submissions.student', 'name email')
            .populate('batch', 'name');

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Sort submissions by marks obtained
        const sortedSubmissions = test.submissions.sort((a, b) => b.totalMarksObtained - a.totalMarksObtained);

        res.json({
            test: {
                title: test.title,
                totalMarks: test.totalMarks,
                status: test.status
            },
            submissions: sortedSubmissions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a test
export const deleteTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body; // Assuming adminId is sent in the body for verification

        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Verify admin and ownership
        await verifyAdmin(adminId);
        if (test.createdBy.toString() !== adminId) {
            return res.status(403).json({ message: 'Not authorized to delete this test' });
        }

        // Only allow deleting draft tests to avoid issues with ongoing/ended tests
        if (test.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft tests can be deleted' });
        }

        await Test.findByIdAndDelete(id);

        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 