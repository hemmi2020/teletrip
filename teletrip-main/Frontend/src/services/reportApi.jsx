import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const reportApi = {
  // Generate custom report
  generateReport: async (reportConfig) => {
    const response = await axios.post(`${API_URL}/reports/generate`, reportConfig, getAuthHeaders());
    return response.data;
  },

  // Get revenue report by date range
  getRevenueReport: async (startDate, endDate) => {
    const response = await axios.get(`${API_URL}/reports/revenue`, {
      ...getAuthHeaders(),
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get user activity report
  getUserActivityReport: async (startDate, endDate) => {
    const response = await axios.get(`${API_URL}/reports/user-activity`, {
      ...getAuthHeaders(),
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get booking analytics report
  getBookingAnalyticsReport: async (startDate, endDate) => {
    const response = await axios.get(`${API_URL}/reports/booking-analytics`, {
      ...getAuthHeaders(),
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get scheduled reports
  getScheduledReports: async () => {
    const response = await axios.get(`${API_URL}/reports/scheduled`, getAuthHeaders());
    return response.data;
  },

  // Create scheduled report
  createScheduledReport: async (scheduleConfig) => {
    const response = await axios.post(`${API_URL}/reports/scheduled`, scheduleConfig, getAuthHeaders());
    return response.data;
  },

  // Update scheduled report
  updateScheduledReport: async (id, scheduleConfig) => {
    const response = await axios.put(`${API_URL}/reports/scheduled/${id}`, scheduleConfig, getAuthHeaders());
    return response.data;
  },

  // Delete scheduled report
  deleteScheduledReport: async (id) => {
    const response = await axios.delete(`${API_URL}/reports/scheduled/${id}`, getAuthHeaders());
    return response.data;
  },

  // Email report
  emailReport: async (reportData, recipients) => {
    const response = await axios.post(`${API_URL}/reports/email`, { reportData, recipients }, getAuthHeaders());
    return response.data;
  },

  // Generate invoice PDF
  generateInvoice: async (bookingId) => {
    const response = await axios.get(`${API_URL}/reports/invoice/${bookingId}`, getAuthHeaders());
    return response.data;
  }
};
