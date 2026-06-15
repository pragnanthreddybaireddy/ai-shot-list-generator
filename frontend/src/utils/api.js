import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 60000,
  headers: { 
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const generateShotList = (data) => api.post('/generate', data);
export const getHistory = (page = 1, limit = 10) => api.get(`/history?page=${page}&limit=${limit}`);
export const getHistoryById = (id) => api.get(`/history/${id}`);
export const deleteHistory = (id) => api.delete(`/history/${id}`);
export const submitFeedback = (data) => api.post('/feedback', data);
export const getAnalytics = () => api.get('/analytics');
export const getTemplates = () => api.get('/templates');

export default api;
