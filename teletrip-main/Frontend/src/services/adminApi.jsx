// src/services/adminApi.jsx
// FIXED: Updated to use /api/admin instead of /api/v1/admin

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Create axios instance
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Admin API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
adminApi.interceptors.response.use(
  (response) => {
    console.log('✅ Admin API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.config?.url);
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ========== ADMIN DASHBOARD API ==========
export const AdminDashboardAPI = {
  
  // ========== DASHBOARD OVERVIEW ==========
  getDashboardOverview: async (period = '30d') => {
    try {
      // ✅ FIXED: Changed to /api/admin/dashboard
      const response = await adminApi.get(`/api/admin/dashboard?period=${period}`);
      console.log('📊 Dashboard data:', response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Dashboard overview error:', error.response || error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load dashboard' 
      };
    }
  },

  // ========== USER MANAGEMENT ==========
  getAllUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/users?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load users' 
      };
    }
  },

  getUserDetails: async (userId) => {
    try {
      const response = await adminApi.get(`/api/admin/users/${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load user details' 
      };
    }
  },

  updateUserStatus: async (userId, statusData) => {
    try {
      const response = await adminApi.put(`/api/admin/users/${userId}/status`, statusData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update user status' 
      };
    }
  },

  deleteUser: async (userId, reason) => {
    try {
      const response = await adminApi.delete(`/api/admin/users/${userId}`, {
        data: { reason }
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete user' 
      };
    }
  },

  // ========== BOOKING MANAGEMENT ==========
  getAllBookings: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/bookings?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load bookings' 
      };
    }
  },

  getBookingDetails: async (bookingId) => {
    try {
      const response = await adminApi.get(`/api/admin/bookings/${bookingId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load booking details' 
      };
    }
  },

  updateBookingStatus: async (bookingId, statusData) => {
    try {
      const response = await adminApi.put(`/api/admin/bookings/${bookingId}/status`, statusData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update booking status' 
      };
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel booking' 
      };
    }
  },

  generateVoucher: async (bookingId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/${bookingId}/voucher`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to generate voucher' 
      };
    }
  },

  // ========== HOTEL MANAGEMENT ==========
  getAllHotels: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/hotels?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load hotels' 
      };
    }
  },

  getHotelDetails: async (hotelId) => {
    try {
      const response = await adminApi.get(`/api/admin/hotels/${hotelId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load hotel details' 
      };
    }
  },

  createHotel: async (hotelData) => {
    try {
      const response = await adminApi.post(`/api/admin/hotels`, hotelData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create hotel' 
      };
    }
  },

  updateHotel: async (hotelId, hotelData) => {
    try {
      const response = await adminApi.put(`/api/admin/hotels/${hotelId}`, hotelData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update hotel' 
      };
    }
  },

  updateHotelStatus: async (hotelId, statusData) => {
    try {
      const response = await adminApi.put(`/api/admin/hotels/${hotelId}/status`, statusData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update hotel status' 
      };
    }
  },

  // ========== PAYMENT MANAGEMENT ==========
  getAllPayments: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/payments?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load payments' 
      };
    }
  },

  getPaymentDetails: async (paymentId) => {
    try {
      const response = await adminApi.get(`/api/admin/payments/${paymentId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load payment details' 
      };
    }
  },

  processRefund: async (paymentId, refundData) => {
    try {
      const response = await adminApi.post(`/api/admin/payments/${paymentId}/refund`, refundData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to process refund' 
      };
    }
  },

  getPayOnSiteBookings: async (filters = {}) => {
    try {
      const { status, ...cleanFilters } = filters;
      const filteredParams = Object.fromEntries(
        Object.entries(cleanFilters).filter(([_, v]) => v !== '' && v != null)
      );
      const params = new URLSearchParams(filteredParams).toString();
      const response = await adminApi.get(`/api/admin/payments/pay-on-site${params ? `?${params}` : ''}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load pay-on-site bookings' 
      };
    }
  },

  markPayOnSiteAsPaid: async (paymentId) => {
    try {
      const response = await adminApi.put(`/api/admin/payments/${paymentId}/mark-paid`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark payment as paid' 
      };
    }
  },

  // ========== SUPPORT MANAGEMENT ==========
  getAllSupportTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/support/tickets?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load support tickets' 
      };
    }
  },

  getSupportTicketDetails: async (ticketId) => {
    try {
      const response = await adminApi.get(`/api/admin/support/tickets/${ticketId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load ticket details' 
      };
    }
  },

  updateSupportTicket: async (ticketId, updateData) => {
    try {
      const response = await adminApi.put(`/api/admin/support/tickets/${ticketId}`, updateData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update ticket' 
      };
    }
  },

  addTicketResponse: async (ticketId, responseData) => {
    try {
      const response = await adminApi.post(`/api/admin/support/tickets/${ticketId}/responses`, responseData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add response' 
      };
    }
  },

  // ========== ANALYTICS ==========
  getAnalytics: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/analytics?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load analytics' 
      };
    }
  },

  exportData: async (type, format = 'excel') => {
    try {
      const response = await adminApi.get(`/api/admin/reports/export?type=${type}&format=${format}`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export data' 
      };
    }
  },

  // ========== SETTINGS ==========
  getSettings: async () => {
    try {
      const response = await adminApi.get(`/api/admin/settings`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load settings' 
      };
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await adminApi.put(`/api/admin/settings`, settingsData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update settings' 
      };
    }
  },

  // ========== ACTIVITY LOGS ==========
  getActivityLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/logs/activity?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load activity logs' 
      };
    }
  },
};

// ========== UTILITY FUNCTIONS ==========
export const formatCurrency = (amount, currency = 'PKR') => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    return 'No response from server';
  } else {
    return error.message || 'An error occurred';
  }
};

export default adminApi;