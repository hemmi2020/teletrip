import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const transfersApi = axios.create({
  baseURL: `${API_URL}/api/transfers`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const searchTransfers = async (searchParams) => {
  const response = await transfersApi.post('/search', searchParams);
  return response.data;
};

export const checkAvailability = async (availabilityParams) => {
  const response = await transfersApi.post('/availability', availabilityParams);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await transfersApi.post('/bookings', bookingData);
  return response.data;
};

export const getBookingDetails = async (bookingReference) => {
  const response = await transfersApi.get(`/bookings/${bookingReference}`);
  return response.data;
};

export const cancelBooking = async (bookingReference) => {
  const response = await transfersApi.delete(`/bookings/${bookingReference}`);
  return response.data;
};

export default transfersApi;
