import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calculator, RefreshCw, Download } from 'lucide-react';
import { financialApi } from '../services/financialApi';

const FinancialDashboard = ({ showToast }) => {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const data = await financialApi.getFinancialOverview(dateRange.start, dateRange.end);
      setFinancialData(data);
    } catch (error) {
      showToast?.('Failed to load financial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={loadFinancialData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
            <DollarSign className="text-green-600" size={20} />
          </div>
          <div className="text-2xl font-bold">PKR {(financialData?.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp size={12} />
            {financialData?.revenueGrowth || 0}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Net Profit</span>
            <Calculator className="text-blue-600" size={20} />
          </div>
          <div className="text-2xl font-bold">PKR {(financialData?.netProfit || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">
            Margin: {financialData?.profitMargin || 0}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Commission</span>
            <DollarSign className="text-purple-600" size={20} />
          </div>
          <div className="text-2xl font-bold">PKR {(financialData?.totalCommission || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">
            Rate: {financialData?.commissionRate || 0}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Refunds</span>
            <TrendingDown className="text-red-600" size={20} />
          </div>
          <div className="text-2xl font-bold">PKR {(financialData?.totalRefunds || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">
            {financialData?.refundCount || 0} transactions
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Breakdown by Category</h3>
        <div className="space-y-3">
          {financialData?.revenueByCategory?.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{cat.category}</span>
                  <span className="text-sm text-gray-600">PKR {(cat.amount || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tax Calculation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Taxable Amount</div>
            <div className="text-xl font-bold">PKR {(financialData?.taxableAmount || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Tax Amount ({financialData?.taxRate || 0}%)</div>
            <div className="text-xl font-bold">PKR {(financialData?.taxAmount || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
