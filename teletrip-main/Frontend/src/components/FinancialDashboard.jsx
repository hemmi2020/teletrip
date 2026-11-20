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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
        <RefreshCw className="w-7 h-7 animate-spin text-blue-600 mb-2" />
        <p className="text-xs font-semibold text-slate-500">Calculating financial metrics...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={loadFinancialData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-98"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">PKR {(financialData?.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1.5">
            <TrendingUp size={12} />
            +{financialData?.revenueGrowth || 0}% vs last period
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calculator size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">PKR {(financialData?.netProfit || 0).toLocaleString()}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1.5">
            Operating Margin: {financialData?.profitMargin || 0}%
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Commission</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">PKR {(financialData?.totalCommission || 0).toLocaleString()}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1.5">
            Platform Rate: {financialData?.commissionRate || 10}%
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Refunds & Disputed</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">PKR {(financialData?.totalRefunds || 0).toLocaleString()}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1.5">
            {financialData?.refundCount || 0} processed refunds
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
        <h3 className="text-sm font-extrabold text-slate-900 mb-4">Revenue Breakdown by Category</h3>
        <div className="space-y-4">
          {(!financialData?.revenueByCategory || financialData.revenueByCategory.length === 0) ? (
            <div className="text-xs text-slate-400 py-3 text-center">No category data recorded for this date range</div>
          ) : (
            financialData.revenueByCategory.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-xs">
                    <span className="font-bold text-slate-700">{cat.category}</span>
                    <span className="font-extrabold text-slate-900">PKR {(cat.amount || 0).toLocaleString()} ({cat.percentage || 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, cat.percentage || 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tax Summary */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
        <h3 className="text-sm font-extrabold text-slate-900 mb-4">Tax Calculation & Net Settlement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Taxable Gross Amount</div>
            <div className="text-lg font-extrabold text-slate-900 mt-1">PKR {(financialData?.taxableAmount || 0).toLocaleString()}</div>
          </div>
          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Tax Liability ({financialData?.taxRate || 17}%)</div>
            <div className="text-lg font-extrabold text-slate-900 mt-1">PKR {(financialData?.taxAmount || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
