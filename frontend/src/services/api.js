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

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const checkCustomId = async (customId) => {
  const response = await api.get(`/profile/check-id/${encodeURIComponent(customId)}`);
  return response.data;
};

export const setupProfile = async (profileData) => {
  const response = await api.post('/profile/setup', profileData);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/profile/update', profileData);
  return response.data;
};

export default api;
