import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const api = {
  // Auth
  authTelegram: (initData: string) => apiClient.post('/auth/telegram', { initData }),
  loginEmail: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  
  // Groups
  getGroups: () => apiClient.get('/groups'),
  getGroup: (id: string) => apiClient.get(`/groups/${id}`),

  // Students
  getStudents: (groupId?: string) => apiClient.get('/students', { params: { groupId } }),
  getStudentStats: (studentId: string) => apiClient.get(`/attendance/student/${studentId}`),

  // Attendance
  markAttendance: (groupId: string, date: string, attendances: Array<{ studentId: string; status: string }>) =>
    apiClient.post('/attendance/mark', { groupId, date, attendances }),
  getGroupAttendance: (groupId: string, date: string) =>
    apiClient.get(`/attendance/group/${groupId}`, { params: { date } }),
};
