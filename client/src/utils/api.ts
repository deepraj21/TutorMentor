import axios from 'axios';
import { Test, SubmitTestData } from '@/types/test';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Test APIs
export const getBatchTests = async (batchId: string): Promise<Test[]> => {
    const response = await axios.get(`${API_URL}/api/test/batch/${batchId}`);
    return response.data;
};

export const getTest = async (id: string): Promise<Test> => {
    const response = await axios.get(`${API_URL}/api/test/${id}`);
    return response.data;
};

export const submitTest = async (testId: string, data: SubmitTestData): Promise<{ message: string; totalMarksObtained: number }> => {
    const response = await axios.post(`${API_URL}/api/test/${testId}/submit`, data);
    return response.data;
};

export const getTestResults = async (testId: string, userId: string) => {
    const response = await axios.get(`${API_URL}/api/test/${testId}/results`);
    const data = response.data;
    
    // Find the student's submission
    const studentSubmission = data.submissions.find(
        (sub: any) => sub.student._id === userId
    );
    
    return {
        test: data.test,
        submission: studentSubmission
    };
}; 