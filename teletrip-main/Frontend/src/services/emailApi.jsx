// src/services/emailApi.jsx
// Email Management API service for admin dashboard

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Create axios instance for email management
const emailApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor - attach admin auth token
emailApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
emailApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

const BASE = '/api/v1/admin/email';

// ========== EMAIL MANAGEMENT API ==========
export const EmailManagementAPI = {

  // ========== TEMPLATES ==========
  listTemplates: async (params = {}) => {
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
      ).toString();
      const response = await emailApi.get(`${BASE}/templates${query ? `?${query}` : ''}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load templates' };
    }
  },

  getTemplate: async (id) => {
    try {
      const response = await emailApi.get(`${BASE}/templates/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load template' };
    }
  },

  createTemplate: async (templateData) => {
    try {
      const response = await emailApi.post(`${BASE}/templates`, templateData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create template' };
    }
  },

  updateTemplate: async (id, templateData) => {
    try {
      const response = await emailApi.put(`${BASE}/templates/${id}`, templateData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update template' };
    }
  },

  deleteTemplate: async (id) => {
    try {
      const response = await emailApi.delete(`${BASE}/templates/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete template' };
    }
  },

  duplicateTemplate: async (id, newSlug) => {
    try {
      const response = await emailApi.post(`${BASE}/templates/${id}/duplicate`, { slug: newSlug });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to duplicate template' };
    }
  },

  previewTemplate: async (id, { htmlContent, subject, sampleData }) => {
    try {
      const response = await emailApi.post(`${BASE}/templates/${id}/preview`, { htmlContent, subject, sampleData });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to preview template' };
    }
  },

  sendTestEmail: async (id, sampleData = {}) => {
    try {
      const response = await emailApi.post(`${BASE}/templates/${id}/test`, { sampleData });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to send test email' };
    }
  },

  seedTemplates: async () => {
    try {
      const response = await emailApi.post(`${BASE}/templates/seed`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to seed templates' };
    }
  },

  // ========== BULK EMAIL ==========
  sendBulkEmail: async ({ templateId, recipientFilter, customVariables }) => {
    try {
      const response = await emailApi.post(`${BASE}/bulk`, { templateId, recipientFilter, customVariables });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to send bulk email' };
    }
  },

  // ========== LOGS ==========
  getEmailLogs: async (params = {}) => {
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
      ).toString();
      const response = await emailApi.get(`${BASE}/logs${query ? `?${query}` : ''}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load email logs' };
    }
  },

  // ========== STATS ==========
  getEmailStats: async (params = {}) => {
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
      ).toString();
      const response = await emailApi.get(`${BASE}/stats${query ? `?${query}` : ''}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load email stats' };
    }
  },
};

export default EmailManagementAPI;
