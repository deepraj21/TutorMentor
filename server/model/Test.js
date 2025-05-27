import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    questionImage: {
        type: String, // URL to Cloudinary image
        default: null
    },
    options: [{
        text: String,
        image: String, // URL to Cloudinary image
    }],
    correctAnswer: {
        type: Number, // Index of the correct option (0-based)
        required: true
    },
    marks: {
        type: Number,
        required: true,
        default: 1
    }
});

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [questionSchema],
    status: {
        type: String,
        enum: ['draft', 'published', 'started', 'ended'],
        default: 'draft'
    },
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        answers: [{
            questionIndex: Number,
            selectedOption: Number,
            isCorrect: Boolean,
            marksObtained: Number
        }],
        totalMarksObtained: {
            type: Number,
            default: 0
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Calculate total marks before saving
testSchema.pre('save', function(next) {
    this.totalMarks = this.questions.reduce((sum, question) => sum + question.marks, 0);
    next();
});

const Test = mongoose.model('Test', testSchema);
export default Test; 