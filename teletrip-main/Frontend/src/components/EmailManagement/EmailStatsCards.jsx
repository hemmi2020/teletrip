import React, { useState, useEffect, useCallback } from 'react';
import {
  Send, CheckCircle, XCircle, AlertTriangle, Loader2, Calendar, RefreshCw
} from 'lucide-react';
import { EmailManagementAPI } from '../../services/emailApi';

const EmailStatsCards = ({ showToast }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    const result = await EmailManagementAPI.getEmailStats({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    if (result.success) {
      setStats(result.data);
    } else {
      showToast?.(result.error, 'error');
    }
    setLoading(false);
  }, [dateFrom, dateTo, showToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Quick date range presets
  const setPreset = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  };

  const cards = [
    {
      label: 'Total Sent',
      value: stats?.sent ?? 0,
      icon: Send,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Delivered',
      value: stats?.delivered ?? 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      label: 'Failed',
      value: stats?.failed ?? 0,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    {
      label: 'Bounced',
      value: stats?.bounced ?? 0,
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Date range selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={loadStats}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setPreset(7)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Last 7 days
            </button>
            <button
              onClick={() => setPreset(30)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Last 30 days
            </button>
            <button
              onClick={() => setPreset(90)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Last 90 days
            </button>
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`bg-white rounded-xl shadow-sm border ${card.borderColor} p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {(card.value ?? 0).toLocaleString()}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {stats && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Delivery Summary</h3>
          <div className="space-y-3">
            {(() => {
              const total = (stats.sent || 0) + (stats.delivered || 0) + (stats.failed || 0) + (stats.bounced || 0);
              if (total === 0) return <p className="text-sm text-gray-400">No email data for the selected period.</p>;
              const deliveryRate = total > 0 ? (((stats.delivered || 0) / total) * 100).toFixed(1) : 0;
              const failureRate = total > 0 ? (((stats.failed || 0) / total) * 100).toFixed(1) : 0;
              const bounceRate = total > 0 ? (((stats.bounced || 0) / total) * 100).toFixed(1) : 0;
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Emails</span>
                    <span className="text-sm font-semibold text-gray-900">{total.toLocaleString()}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Delivery Rate</span>
                      <span className="text-sm font-semibold text-green-600">{deliveryRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${deliveryRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Failure Rate</span>
                      <span className="text-sm font-semibold text-red-600">{failureRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${failureRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Bounce Rate</span>
                      <span className="text-sm font-semibold text-orange-600">{bounceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${bounceRate}%` }} />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailStatsCards;
