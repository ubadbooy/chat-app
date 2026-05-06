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

const normalizeUser = (user) => {
  if (!user) return null;
  const userId = user.userId || user.id || user._id;
  return userId ? { ...user, userId, id: user.id || userId } : user;
};

export const useAuthStore = create((set) => ({
  user: normalizeUser(storedUser),
  token: storedToken,
  setAuth: (user, token) => {
    const normalizedUser = normalizeUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    set({ user: normalizedUser, token });
  },
  setUser: (user) => {
    set((state) => {
      const normalizedUser = normalizeUser({ ...state.user, ...user });
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return { user: normalizedUser };
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  }
}));
