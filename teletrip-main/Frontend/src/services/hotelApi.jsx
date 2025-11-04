import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL ? `${import.meta.env.VITE_BASE_URL}/api` : 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const hotelApi = {
  // Search hotels
  searchHotels: async (searchParams) => {
    const response = await axios.post(`${API_URL}/hotels/search`, searchParams);
    return response.data;
  },

  // Check rate before booking
  checkRate: async (rateKey) => {
    const response = await axios.post(`${API_URL}/hotels/checkrate`, {
      rooms: [{ rateKey }]
    });
    return response.data;
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await axios.post(`${API_URL}/hotels/book`, bookingData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Get booking list
  getBookings: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await axios.get(`${API_URL}/hotels/bookings?${params}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Get booking details
  getBookingDetails: async (bookingId, language = 'en') => {
    const response = await axios.get(`${API_URL}/hotels/bookings/${bookingId}?language=${language}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Modify booking
  modifyBooking: async (bookingId, modificationData) => {
    const response = await axios.put(`${API_URL}/hotels/bookings/${bookingId}`, modificationData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId, cancellationFlag = 'CANCELLATION', language = 'en') => {
    const response = await axios.delete(
      `${API_URL}/hotels/bookings/${bookingId}?cancellationFlag=${cancellationFlag}&language=${language}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Get reconfirmations
  getReconfirmations: async (filters = {}) => {
    const params = new URLSearchParams({
      from: filters.from || 1,
      to: filters.to || 10,
      ...filters
    });
    
    const response = await axios.get(`${API_URL}/hotels/bookings/reconfirmations?${params}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Get hotel details
  getHotelDetails: async (hotelCode) => {
    const response = await axios.get(`${API_URL}/hotels/details/${hotelCode}`);
    return response.data;
  }
};
