import apiClient from './axios';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  verifyOtp: async (data) => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  refreshToken: async (data) => {
    const response = await apiClient.post('/auth/refresh-token', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data?.data || response.data;
  },

  updateMe: async (data) => {
    const response = await apiClient.patch('/users/me', data);
    return response.data?.data || response.data;
  },
};
