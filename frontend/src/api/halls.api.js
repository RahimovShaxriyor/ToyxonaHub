import apiClient from './axios';

export const hallsApi = {
  getHalls: async (params = {}) => {
    const formattedParams = { ...params };
    if (params.sort && typeof params.sort === 'string' && params.sort.includes(':')) {
      const [sortBy, order] = params.sort.split(':');
      formattedParams.sortBy = sortBy;
      formattedParams.order = order;
      delete formattedParams.sort;
    }
    const response = await apiClient.get('/wedding-halls', { params: formattedParams });
    return response.data;
  },

  getHallById: async (id) => {
    const response = await apiClient.get(`/wedding-halls/${id}`);
    return response.data?.data || response.data;
  },

  getHallAvailability: async (id, { year, month } = {}) => {
    const response = await apiClient.get(`/wedding-halls/${id}/availability`, {
      params: { year, month },
    });
    return response.data?.data || response.data;
  },

  createHall: async (data) => {
    const response = await apiClient.post('/wedding-halls', data);
    return response.data?.data || response.data;
  },

  updateHall: async (id, data) => {
    const response = await apiClient.patch(`/wedding-halls/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteHall: async (id) => {
    const response = await apiClient.delete(`/wedding-halls/${id}`);
    return response.data;
  },

  updateHallStatus: async (id, { status }) => {
    const response = await apiClient.patch(`/wedding-halls/${id}/status`, { status });
    return response.data?.data || response.data;
  },

  uploadImage: async (id, formData) => {
    const response = await apiClient.post(`/wedding-halls/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  deleteImage: async (hallId, imageId) => {
    const response = await apiClient.delete(`/wedding-halls/${hallId}/images/${imageId}`);
    return response.data;
  },

  setPrimaryImage: async (hallId, imageId) => {
    const response = await apiClient.patch(`/wedding-halls/${hallId}/images/${imageId}/primary`);
    return response.data?.data || response.data;
  },
};
