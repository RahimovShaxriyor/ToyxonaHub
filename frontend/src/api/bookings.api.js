import apiClient from './axios';

export const bookingsApi = {
  createBooking: async (data) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  getMyBookings: async (params = {}) => {
    const response = await apiClient.get('/bookings/my', { params });
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data?.data || response.data;
  },

  cancelBooking: async (id) => {
    const response = await apiClient.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  payBooking: async (id) => {
    const response = await apiClient.post(`/bookings/${id}/pay`);
    return response.data;
  },

  getHallBookings: async (hallId, params = {}) => {
    const response = await apiClient.get(`/wedding-halls/${hallId}/bookings`, { params });
    return response.data;
  },

  getAllBookings: async (params = {}) => {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },
};
