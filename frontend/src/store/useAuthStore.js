import { create } from 'zustand';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

const storedUser = getStoredUser();
const storedToken = storedUser ? localStorage.getItem('token') : null;

if (!storedUser) {
  localStorage.removeItem('token');
}

export const useAuthStore = create((set) => ({
  user: storedUser,
  token: storedToken,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  }
}));
