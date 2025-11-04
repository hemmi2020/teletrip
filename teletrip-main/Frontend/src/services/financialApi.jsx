import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
});

export const financialApi = {
  getFinancialOverview: async (startDate, endDate) => {
    try {
      const response = await axios.get(`${API_URL}/api/financial/overview`, {
        ...getAuthHeaders(),
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('Financial overview error:', error);
      return {
        totalRevenue: 0,
        netProfit: 0,
        profitMargin: 0,
        totalCommission: 0,
        commissionRate: 10,
        totalRefunds: 0,
        refundCount: 0,
        revenueGrowth: 0,
        revenueByCategory: [],
        taxableAmount: 0,
        taxRate: 17,
        taxAmount: 0
      };
    }
  },

  getRefunds: async (status) => {
    try {
      const response = await axios.get(`${API_URL}/api/financial/refunds`, {
        ...getAuthHeaders(),
        params: { status }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Refunds error:', error);
      return [];
    }
  },

  processRefund: async (refundId, action) => {
    const response = await axios.post(`${API_URL}/api/financial/refunds/${refundId}/${action}`, {}, getAuthHeaders());
    return response.data;
  },

  getCommissions: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/financial/commissions`, getAuthHeaders());
      return response.data.data || { commissions: [], summary: { total: 0, paid: 0, pending: 0 } };
    } catch (error) {
      console.error('Commissions error:', error);
      return { commissions: [], summary: { total: 0, paid: 0, pending: 0 } };
    }
  },

  reconcilePayments: async () => {
    try {
      const response = await axios.post(`${API_URL}/api/financial/reconcile`, {}, getAuthHeaders());
      return response.data.data;
    } catch (error) {
      console.error('Reconciliation error:', error);
      return {
        matched: 0,
        matchedAmount: 0,
        unmatched: 0,
        unmatchedAmount: 0,
        pending: 0,
        pendingAmount: 0,
        discrepancies: []
      };
    }
  },

  getForecast: async (period) => {
    try {
      const response = await axios.get(`${API_URL}/api/financial/forecast`, {
        ...getAuthHeaders(),
        params: { period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Forecast error:', error);
      return {
        projectedRevenue: 0,
        revenueGrowth: 0,
        projectedProfit: 0,
        profitGrowth: 0,
        confidence: 0,
        chartData: []
      };
    }
  }
};
