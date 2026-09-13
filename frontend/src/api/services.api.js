import apiClient from './axios';

export const servicesApi = {
  // Read all services of a hall from hall details
  getHallServices: async (hallId) => {
    const response = await apiClient.get(`/wedding-halls/${hallId}`);
    const hall = response.data?.data || response.data;
    if (!hall) return [];

    const items = [];
    if (Array.isArray(hall.singers)) {
      hall.singers.forEach((s) => items.push({ ...s, serviceType: 'SINGER' }));
    }
    if (Array.isArray(hall.cars)) {
      hall.cars.forEach((c) => items.push({ ...c, name: c.model, serviceType: 'CAR' }));
    }
    if (Array.isArray(hall.menuOptions)) {
      hall.menuOptions.forEach((m) =>
        items.push({ ...m, price: m.pricePerSeat, serviceType: 'MENU' })
      );
    }
    if (hall.karnaySurnay && hall.karnaySurnay.isAvailable) {
      items.push({
        id: hall.karnaySurnay.id || 'karnay-surnay',
        name: 'Karnay-surnay guruhi',
        price: hall.karnaySurnay.price,
        serviceType: 'KARNAY_SURNAY',
      });
    }
    return items;
  },

  // Add services modularly based on serviceType
  addHallService: async (hallId, data) => {
    const { serviceType, name, price, description } = data;
    if (serviceType === 'SINGER') {
      const res = await apiClient.post(`/wedding-halls/${hallId}/services/singers`, {
        name,
        price: Number(price),
        description,
      });
      return res.data?.data || res.data;
    }
    if (serviceType === 'CAR') {
      const res = await apiClient.post(`/wedding-halls/${hallId}/services/cars`, {
        model: name,
        price: Number(price),
      });
      return res.data?.data || res.data;
    }
    if (serviceType === 'MENU') {
      const res = await apiClient.post(`/wedding-halls/${hallId}/services/menu`, {
        name,
        pricePerSeat: Number(price),
        description,
      });
      return res.data?.data || res.data;
    }
    if (serviceType === 'KARNAY_SURNAY') {
      const res = await apiClient.put(`/wedding-halls/${hallId}/services/karnay-surnay`, {
        isAvailable: true,
        price: Number(price),
      });
      return res.data?.data || res.data;
    }
    throw new Error(`Unsupported service type: ${serviceType}`);
  },

  deleteHallService: async (hallId, serviceId, serviceType = 'SINGER') => {
    if (serviceType === 'CAR') {
      const res = await apiClient.delete(`/wedding-halls/${hallId}/services/cars/${serviceId}`);
      return res.data;
    }
    if (serviceType === 'MENU') {
      const res = await apiClient.delete(`/wedding-halls/${hallId}/services/menu/${serviceId}`);
      return res.data;
    }
    // Default to singer
    const res = await apiClient.delete(`/wedding-halls/${hallId}/services/singers/${serviceId}`);
    return res.data;
  },

  // Specific sub-endpoints
  addSinger: async (hallId, data) => {
    const res = await apiClient.post(`/wedding-halls/${hallId}/services/singers`, data);
    return res.data?.data || res.data;
  },
  deleteSinger: async (hallId, singerId) => {
    const res = await apiClient.delete(`/wedding-halls/${hallId}/services/singers/${singerId}`);
    return res.data;
  },
  addCar: async (hallId, data) => {
    const res = await apiClient.post(`/wedding-halls/${hallId}/services/cars`, data);
    return res.data?.data || res.data;
  },
  deleteCar: async (hallId, carId) => {
    const res = await apiClient.delete(`/wedding-halls/${hallId}/services/cars/${carId}`);
    return res.data;
  },
  addMenu: async (hallId, data) => {
    const res = await apiClient.post(`/wedding-halls/${hallId}/services/menu`, data);
    return res.data?.data || res.data;
  },
  deleteMenu: async (hallId, menuId) => {
    const res = await apiClient.delete(`/wedding-halls/${hallId}/services/menu/${menuId}`);
    return res.data;
  },
  setKarnaySurnay: async (hallId, data) => {
    const res = await apiClient.put(`/wedding-halls/${hallId}/services/karnay-surnay`, data);
    return res.data?.data || res.data;
  },
};
