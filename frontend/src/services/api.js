// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/messages/users');
  return response.data;
};

export const getMessages = async (userId) => {
  const response = await api.get(`/messages/conversation/${userId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await api.post('/messages/send', messageData);
  return response.data;
};

export default api;
