import axios from 'axios';
import { Test, CreateTestData, UpdateTestData } from '../types/test';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Test APIs
export const createTest = async (data: CreateTestData): Promise<Test> => {
    const response = await axios.post(`${API_URL}/api/test`, data);
    return response.data;
};

export const updateTest = async (id: string, data: UpdateTestData): Promise<Test> => {
    const response = await axios.put(`${API_URL}/api/test/${id}`, data);
    return response.data;
};

export const publishTest = async (id: string, adminId: string): Promise<Test> => {
    const response = await axios.put(`${API_URL}/api/test/${id}/publish`, { adminId });
    return response.data;
};

export const startTest = async (id: string, adminId: string): Promise<Test> => {
    const response = await axios.put(`${API_URL}/api/test/${id}/start`, { adminId });
    return response.data;
};

export const endTest = async (id: string, adminId: string): Promise<Test> => {
    const response = await axios.put(`${API_URL}/api/test/${id}/end`, { adminId });
    return response.data;
};

export const getBatchTests = async (batchId: string): Promise<Test[]> => {
    const response = await axios.get(`${API_URL}/api/test/batch/${batchId}`);
    return response.data;
};

export const getTest = async (id: string): Promise<Test> => {
    const response = await axios.get(`${API_URL}/api/test/${id}`);
    return response.data;
};

export const getTestResults = async (testId: string) => {
    const response = await axios.get(`${API_URL}/api/test/${testId}/results`);
    return response.data;
};

export const deleteTest = async (testId: string, adminId: string) => {
    const response = await axios.delete(`${API_URL}/api/test/${testId}`, { data: { adminId } }); 
    return response.data;
}; 