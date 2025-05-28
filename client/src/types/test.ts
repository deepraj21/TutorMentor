export interface Question {
    question: string;
    questionImage?: string;
    options: {
        text?: string;
        image?: string;
    }[];
    correctAnswer: number;
    marks: number;
}

export interface TestSubmission {
    student: string;
    answers: {
        questionIndex: number;
        selectedOption: number;
        isCorrect: boolean;
        marksObtained: number;
    }[];
    totalMarksObtained: number;
    submittedAt: string;
}

export interface Test {
    _id: string;
    title: string;
    description: string;
    batch: string;
    createdBy: string;
    questions: Question[];
    status: 'draft' | 'published' | 'started' | 'ended';
    startTime?: string;
    endTime?: string;
    duration: number;
    totalMarks: number;
    submissions: TestSubmission[];
    createdAt: string;
    updatedAt: string;
}

export interface SubmitTestData {
    answers: {
        questionIndex: number;
        selectedOption: number;
    }[];
    userId: string;
} 