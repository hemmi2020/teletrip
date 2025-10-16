// src/services/dashboardApi.js
// Centralized API service for dashboard operations

import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({ 
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API Service
export class DashboardAPIService {
  // ========== DASHBOARD OVERVIEW ==========
  static async getDashboardOverview() {
    try {
      const response = await apiClient.get('/api/user/dashboard');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Dashboard overview error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load dashboard overview',
        status: error.response?.status
      };
    }
  }

  // ========== PROFILE MANAGEMENT ==========
  static async getProfile() {
    try {
      const response = await apiClient.get('/api/user/profile');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load profile',
        status: error.response?.status
      };
    }
  }

  static async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/api/user/profile', profileData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
        status: error.response?.status,
        validationErrors: error.response?.data?.errors
      };
    }
  }

  static async updatePassword(passwordData) {
    try {
      const response = await apiClient.put('/api/user/profile/password', passwordData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update password',
        status: error.response?.status
      };
    }
  }

  static async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await apiClient.post('/api/user/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Upload profile picture error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload profile picture',
        status: error.response?.status
      };
    }
  }

  // ========== BOOKING MANAGEMENT ==========
  static async getBookings(params = {}) {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.status && { status: params.status }),
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }).toString();

      const response = await apiClient.get(`/api/user/bookings?${queryString}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get bookings error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load bookings',
        status: error.response?.status
      };
    }
  }

  static async getBookingDetails(bookingId) {
    try {
      const response = await apiClient.get(`/api/user/bookings/${bookingId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get booking details error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load booking details',
        status: error.response?.status
      };
    }
  }

  static async createBooking(bookingData) {
    try {
      const response = await apiClient.post('/api/user/bookings', bookingData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Create booking error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create booking',
        status: error.response?.status,
        validationErrors: error.response?.data?.errors
      };
    }
  }

  static async cancelBooking(bookingId, reason) {
    try {
      const response = await apiClient.put(`/api/user/bookings/${bookingId}/cancel`, { reason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Cancel booking error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel booking',
        status: error.response?.status
      };
    }
  }

  // ========== PAYMENT MANAGEMENT ==========
  static async getPendingPayments() {
    try {
      const response = await apiClient.get('/api/user/payments/pending');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get pending payments error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load pending payments',
        status: error.response?.status
      };
    }
  }

  static async getPaymentHistory(params = {}) {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.status && { status: params.status }),
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }).toString();

      const response = await apiClient.get(`/api/user/payments?${queryString}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get payment history error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load payment history',
        status: error.response?.status
      };
    }
  }

  static async getPaymentDetails(paymentId) {
    try {
      const response = await apiClient.get(`/api/user/payments/${paymentId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get payment details error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load payment details',
        status: error.response?.status
      };
    }
  }

  // ========== FAVORITES & SEARCH ==========
  static async getFavoriteHotels(params = {}) {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10
      }).toString();

      const response = await apiClient.get(`/api/user/favorites?${queryString}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get favorite hotels error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load favorite hotels',
        status: error.response?.status
      };
    }
  }

  static async addToFavorites(hotelId) {
    try {
      const response = await apiClient.post(`/api/user/favorites/${hotelId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Add to favorites error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add to favorites',
        status: error.response?.status
      };
    }
  }

  static async removeFromFavorites(hotelId) {
    try {
      const response = await apiClient.delete(`/api/user/favorites/${hotelId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Remove from favorites error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove from favorites',
        status: error.response?.status
      };
    }
  }

  // ========== PREFERENCES ==========
  static async getPreferences() {
    try {
      const response = await apiClient.get('/api/user/preferences');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get preferences error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load preferences',
        status: error.response?.status
      };
    }
  }

  static async updatePreferences(preferences) {
    try {
      const response = await apiClient.put('/api/user/preferences', preferences);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Update preferences error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update preferences',
        status: error.response?.status
      };
    }
  }

  // ========== NOTIFICATIONS ==========
  static async getNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.type && { type: params.type }),
        ...(params.read !== undefined && { read: params.read })
      }).toString();

      const response = await apiClient.get(`/api/user/notifications?${queryString}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load notifications',
        status: error.response?.status
      };
    }
  }

  static async markNotificationAsRead(notificationId) {
    try {
      const response = await apiClient.put(`/api/user/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark notification as read',
        status: error.response?.status
      };
    }
  }

  static async markAllNotificationsAsRead() {
    try {
      const response = await apiClient.put('/api/user/notifications/mark-all-read');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all notifications as read',
        status: error.response?.status
      };
    }
  }

  // ========== REVIEWS ==========
  static async getMyReviews(params = {}) {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10
      }).toString();

      const response = await apiClient.get(`/api/user/reviews?${queryString}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get reviews error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load reviews',
        status: error.response?.status
      };
    }
  }

  static async createReview(reviewData) {
    try {
      const response = await apiClient.post('/api/user/reviews', reviewData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Create review error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create review',
        status: error.response?.status,
        validationErrors: error.response?.data?.errors
      };
    }
  }

  // ========== SUPPORT TICKETS ==========
  static async createSupportTicket(ticketData) {
    try {
      const response = await apiClient.post('/api/user/support/tickets', ticketData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Create support ticket error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create support ticket',
        status: error.response?.status,
        validationErrors: error.response?.data?.errors
      };
    }
  }

  static async getMySupportTickets(params = {}) {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.status && { status: params.status }),
        ...(params.priority && { priority: params.priority })
      }).toString();

      const response = await apiClient.get(`/api/user/support/tickets?${queryString}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get support tickets error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load support tickets',
        status: error.response?.status
      };
    }
  }

  // ========== TRAVEL INSIGHTS ==========
  static async getTravelInsights(year) {
    try {
      const response = await apiClient.get(`/api/user/insights/travel?year=${year || new Date().getFullYear()}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get travel insights error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load travel insights',
        status: error.response?.status
      };
    }
  }

  // ========== UTILITY METHODS ==========
  static async downloadUserData() {
    try {
      const response = await apiClient.get('/api/user/data/export', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user-data-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Data download started'
      };
    } catch (error) {
      console.error('Download user data error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to download user data',
        status: error.response?.status
      };
    }
  }

  static async deleteAccount(password) {
    try {
      const response = await apiClient.delete('/api/user/account', {
        data: { password }
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete account',
        status: error.response?.status
      };
    }
  }

  // ========== HOTEL SEARCH (for dashboard context) ==========
  static async searchHotels(searchParams) {
    try {
      const queryString = new URLSearchParams({
        ...searchParams,
        page: searchParams.page || 1,
        limit: searchParams.limit || 10
      }).toString();

      const response = await apiClient.get(`/api/user/search/hotels?${queryString}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Search hotels error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search hotels',
        status: error.response?.status
      };
    }
  }
}

// ========== ERROR HANDLING UTILITIES ==========
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error?.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.message || 'Invalid request data';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Requested resource not found';
      case 409:
        return data?.message || 'Conflict occurred';
      case 422:
        return data?.message || 'Validation failed';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data?.message || defaultMessage;
    }
  } else if (error?.request) {
    // Request was made but no response received
    return 'Network error. Please check your internet connection.';
  } else {
    // Something else happened
    return error?.message || defaultMessage;
  }
};

// ========== VALIDATION UTILITIES ==========
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    // Check required
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${fieldRules.label || field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') return;
    
    // Check minimum length
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
      return;
    }
    
    // Check maximum length
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `${fieldRules.label || field} must not exceed ${fieldRules.maxLength} characters`;
      return;
    }
    
    // Check email format
    if (fieldRules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field] = 'Please enter a valid email address';
        return;
      }
    }
    
    // Check phone format
    if (fieldRules.phone) {
      const phoneRegex = /^\+?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-()]/g, ''))) {
        errors[field] = 'Please enter a valid phone number';
        return;
      }
    }
    
    // Custom validation
    if (fieldRules.validator && typeof fieldRules.validator === 'function') {
      const customError = fieldRules.validator(value, data);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ========== FORMAT UTILITIES ==========
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount || 0);
};

export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString('en-US', {
    ...defaultOptions,
    ...options
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ========== LOCAL STORAGE UTILITIES ==========
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

export default DashboardAPIService;