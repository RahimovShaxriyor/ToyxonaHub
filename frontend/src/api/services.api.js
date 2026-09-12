import apiClient from './axios';

export const servicesApi = {
  getHallServices: async (hallId) => {
    const response = await apiClient.get(`/wedding-halls/${hallId}/services`);
    return response.data?.data || response.data;
  },

  addHallService: async (hallId, data) => {
    const response = await apiClient.post(`/wedding-halls/${hallId}/services`, data);
    return response.data?.data || response.data;
  },

  deleteHallService: async (hallId, serviceId) => {
    const response = await apiClient.delete(`/wedding-halls/${hallId}/services/${serviceId}`);
    return response.data;
  },
};
