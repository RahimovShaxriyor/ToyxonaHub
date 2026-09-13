import apiClient from './axios';

export const ownersApi = {
  createOwner: async (data) => {
    const response = await apiClient.post('/owners', data);
    return response.data?.data || response.data;
  },

  getOwners: async (params = {}) => {
    const response = await apiClient.get('/owners', { params });
    return response.data;
  },

  assignHall: async (ownerId, { weddingHallId } = {}) => {
    const response = await apiClient.patch(`/wedding-halls/${weddingHallId}/assign-owner`, {
      ownerId,
    });
    return response.data?.data || response.data;
  },
};
