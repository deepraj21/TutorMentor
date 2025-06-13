import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface TeacherLoginResponse {
  message: string;
  teacher: {
    id: string;
    email: string;
    name: string;
  };
}

interface TeacherLoginCredentials {
  email: string;
  password: string;
}

interface Classroom {
  _id: string;
  name: string;
  section: string;
  createdBy: string;
  createdAt: string;
  classCode: string;
}

interface StudentClassroom extends Classroom {
  teacher: {
    name: string;
    email: string;
  };
}

interface Material {
  _id: string;
  title: string;
  description?: string;
  pdfLinks: string[];
  postedBy: {
    _id: string;
    name: string;
    email: string;
  };
  classroom: {
    _id: string;
    name: string;
    section: string;
    createdAt: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface ClassroomDetails {
  _id: string;
  name: string;
  section: string;
  classCode: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  enrolledTeachers: {
    _id: string;
    name: string;
    email: string;
  }[];
  enrolledStudents: {
    _id: string;
    name: string;
    email: string;
  }[];
}

interface PasswordResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

interface ClassroomResponse {
  created: Classroom[];
  enrolled: Classroom[];
}

interface SendClassInviteResponse {
  message: string;
  sentTo: number;
}

export const teacherApi = {
  login: async (credentials: TeacherLoginCredentials): Promise<TeacherLoginResponse> => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/signin`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  signup: async (credentials: {
    email: string;
    name: string;
    password: string;
  }): Promise<TeacherLoginResponse> => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Signup failed');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  requestPasswordReset: async (email: string): Promise<{ message: string; email: string }> => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/request-password-reset`, { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to request password reset');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  verifyResetCode: async (email: string, code: string): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/verify-reset-code`, { email, code });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to verify code');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  verifyAndResetPassword: async (data: { email: string; code: string; newPassword: string }): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/verify-and-reset-password`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to reset password');
      }
      throw new Error('An unexpected error occurred');
    }
  },
};

export const classroomApi = {
  createClassroom: async (data: { name: string; section: string }): Promise<{ message: string; classroom: Classroom }> => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      const response = await axios.post(`${BACKEND_URL}/api/classroom`, { ...data, teacherId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create classroom');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  getMyClassrooms: async (): Promise<ClassroomResponse> => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }
      const response = await axios.post(`${BACKEND_URL}/api/classroom/my-classrooms`, { teacherId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch classrooms');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  joinClassroom: async (classCode: string) => {
    const teacherId = localStorage.getItem('teacherId');
    const studentId = localStorage.getItem('studentId');
    
    const response = await fetch(`${BACKEND_URL}/api/classroom/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classCode,
        teacherId,
        studentId
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join classroom');
    }

    return response.json();
  },

  leaveClassroom: async (classroomId: string) => {
    const teacherId = localStorage.getItem('teacherId');
    const studentId = localStorage.getItem('studentId');
    
    const endpoint = teacherId ? 
      `/api/classroom/teacher-unenroll/${classroomId}` : 
      `/api/classroom/unenroll/${classroomId}`;

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teacherId,
        studentId
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to leave classroom');
    }

    return response.json();
  },

  getEnrolledClassrooms: async (): Promise<StudentClassroom[]> => {
    try {
      const studentId = localStorage.getItem('studentId');
      if (!studentId) {
        throw new Error('Student ID not found');
      }
      const response = await axios.get(`${BACKEND_URL}/api/classroom/enrolled/${studentId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch enrolled classrooms');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  deleteClassroom: async (classroomId: string): Promise<{ message: string }> => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }
      const response = await axios.delete(`${BACKEND_URL}/api/classroom/${classroomId}`, {
        data: { teacherId }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete classroom');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  unenrollFromClassroom: async (classroomId: string): Promise<{ message: string }> => {
    try {
      const studentId = localStorage.getItem('studentId');
      if (!studentId) {
        throw new Error('Student ID not found');
      }
      const response = await axios.post(`${BACKEND_URL}/api/classroom/unenroll/${classroomId}`, {
        studentId
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to unenroll from classroom');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  refreshClassCode: async (classroomId: string): Promise<{ message: string; classroom: Classroom }> => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }
      const response = await axios.post(`${BACKEND_URL}/api/classroom/refresh-code/${classroomId}`, {
        teacherId
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to refresh class code');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  getMaterials: async (classroomId: string): Promise<Material[]> => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/material/classroom/${classroomId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch materials');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  createMaterial: async (data: {
    title: string;
    description?: string;
    pdfLinks: string[];
    classroomId: string;
  }): Promise<Material> => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      const response = await axios.post(`${BACKEND_URL}/api/material`,  { ...data, teacherId } );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create material');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  deleteMaterial: async (materialId: string): Promise<{ message: string }> => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/material/${materialId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete material');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  getClassroomDetails: async (classroomId: string): Promise<ClassroomDetails> => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/classroom/${classroomId}/details`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch classroom details');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  // Material Library endpoints
  shareToLibrary: async (materialId: string) => {
    const teacherId = localStorage.getItem('teacherId');
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }
    const response = await axios.post(`${BACKEND_URL}/api/material-library`, { materialId, teacherId });
    return response.data;
  },

  getLibraryMaterials: async ({ page = 1, limit = 9, sortBy = 'sharedAt', sortOrder = 'desc' }) => {
    const response = await axios.get(`${BACKEND_URL}/api/material-library`, {
      params: { page, limit, sortBy, sortOrder }
    });
    return response.data;
  },

  sendClassInvite: async (data: { 
    classCode: string; 
    className: string; 
    teacherName: string; 
    recipientEmails: string[] 
  }): Promise<SendClassInviteResponse> => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/classroom/send-invite`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to send class invites');
      }
      throw new Error('An unexpected error occurred');
    }
  }
};