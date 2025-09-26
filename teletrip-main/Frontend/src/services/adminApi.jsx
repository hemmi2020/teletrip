// src/services/adminApi.jsx
// FIXED Admin Dashboard API Service

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
      // FIXED: Correct API path with /api/v1 prefix
      const response = await adminApi.get(`/api/v1/admin/dashboard?period=${period}`);
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
      const response = await adminApi.get(`/api/v1/admin/users?${params}`);
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
      const response = await adminApi.get(`/api/v1/admin/users/${userId}`);
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
      const response = await adminApi.put(`/api/v1/admin/users/${userId}/status`, statusData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update user status' 
      };
    }
  },

  // ========== BOOKING MANAGEMENT ==========
  getAllBookings: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/v1/admin/bookings?${params}`);
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
      const response = await adminApi.get(`/api/v1/admin/bookings/${bookingId}`);
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
      const response = await adminApi.put(`/api/v1/admin/bookings/${bookingId}/status`, statusData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update booking status' 
      };
    }
  },

  // ========== HOTEL MANAGEMENT ==========
  getAllHotels: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/v1/admin/hotels?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load hotels' 
      };
    }
  },

  // ========== PAYMENT MANAGEMENT ==========
  getAllPayments: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/v1/admin/payments?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load payments' 
      };
    }
  },

  processRefund: async (paymentId, refundData) => {
    try {
      const response = await adminApi.post(`/api/v1/admin/payments/${paymentId}/refund`, refundData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to process refund' 
      };
    }
  },

  // ========== SUPPORT MANAGEMENT ==========
  getAllSupportTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/v1/admin/support/tickets?${params}`);
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
      const response = await adminApi.get(`/api/v1/admin/support/tickets/${ticketId}`);
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
      const response = await adminApi.put(`/api/v1/admin/support/tickets/${ticketId}`, updateData);
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
      const response = await adminApi.post(`/api/v1/admin/support/tickets/${ticketId}/responses`, responseData);
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
      const response = await adminApi.get(`/api/v1/admin/analytics?${params}`);
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
      const response = await adminApi.get(`/api/v1/admin/reports/export?type=${type}&format=${format}`, {
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

export default AdminDashboardAPI;