import api from './api';
import { LoginRequest, RegisterRequest } from '../types';

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/request-reset', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset', { token, newPassword });
    return response.data;
  },
};

