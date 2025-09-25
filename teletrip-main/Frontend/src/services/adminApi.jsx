// src/services/adminApi.js
// Complete Admin Dashboard API Service

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
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
      const response = await adminApi.get(`/api/admin/dashboard?period=${period}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Dashboard overview error:', error);
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
      const response = await adminApi.post('/api/admin/hotels', hotelData);
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

  deleteHotel: async (hotelId) => {
    try {
      const response = await adminApi.delete(`/api/admin/hotels/${hotelId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete hotel' 
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

  // ========== SUPPORT TICKET MANAGEMENT ==========
  getAllTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/support/tickets?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load tickets' 
      };
    }
  },

  getTicketDetails: async (ticketId) => {
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

  updateTicket: async (ticketId, ticketData) => {
    try {
      const response = await adminApi.put(`/api/admin/support/tickets/${ticketId}`, ticketData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update ticket' 
      };
    }
  },

  respondToTicket: async (ticketId, responseData) => {
    try {
      const response = await adminApi.post(`/api/admin/support/tickets/${ticketId}/respond`, responseData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send response' 
      };
    }
  },

  // ========== REVIEWS MANAGEMENT ==========
  getAllReviews: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/reviews?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load reviews' 
      };
    }
  },

  updateReviewStatus: async (reviewId, statusData) => {
    try {
      const response = await adminApi.put(`/api/admin/reviews/${reviewId}/status`, statusData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update review status' 
      };
    }
  },

  respondToReview: async (reviewId, responseData) => {
    try {
      const response = await adminApi.post(`/api/admin/reviews/${reviewId}/respond`, responseData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to respond to review' 
      };
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await adminApi.delete(`/api/admin/reviews/${reviewId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete review' 
      };
    }
  },

  // ========== ANALYTICS & REPORTS ==========
  getRevenueAnalytics: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/analytics/revenue?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load revenue analytics' 
      };
    }
  },

  getBookingAnalytics: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/analytics/bookings?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load booking analytics' 
      };
    }
  },

  exportReport: async (reportType, filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/reports/${reportType}/export?${params}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export report' 
      };
    }
  },

  // ========== NOTIFICATIONS ==========
  getAllNotifications: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await adminApi.get(`/api/admin/notifications?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load notifications' 
      };
    }
  },

  sendBulkNotification: async (notificationData) => {
    try {
      const response = await adminApi.post('/api/admin/notifications/bulk', notificationData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send notifications' 
      };
    }
  },

  // ========== SYSTEM SETTINGS ==========
  getSettings: async () => {
    try {
      const response = await adminApi.get('/api/admin/settings');
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
      const response = await adminApi.put('/api/admin/settings', settingsData);
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

  // ========== ADMIN USERS ==========
  createAdmin: async (adminData) => {
    try {
      const response = await adminApi.post('/api/admin/admins', adminData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create admin' 
      };
    }
  },

  updateAdminRole: async (adminId, roleData) => {
    try {
      const response = await adminApi.put(`/api/admin/admins/${adminId}/role`, roleData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update admin role' 
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