import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';
import { financialApi } from '../services/financialApi';

const CommissionTracker = ({ showToast }) => {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      const data = await financialApi.getCommissions();
      setCommissions(data.commissions);
      setSummary(data.summary);
    } catch (error) {
      showToast?.('Failed to load commissions', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp size={20} />
        Commission Tracking
      </h3>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 rounded p-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Commission</div>
            <div className="text-xl font-bold">PKR {(summary.total || 0).toLocaleString()}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 rounded p-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">Paid</div>
            <div className="text-xl font-bold">PKR {(summary.paid || 0).toLocaleString()}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded p-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
            <div className="text-xl font-bold">PKR {(summary.pending || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium">Booking</th>
              <th className="px-4 py-2 text-left text-xs font-medium">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-medium">Rate</th>
              <th className="px-4 py-2 text-left text-xs font-medium">Commission</th>
              <th className="px-4 py-2 text-left text-xs font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {commissions.map((comm) => (
              <tr key={comm.id}>
                <td className="px-4 py-3 text-sm">#{comm.bookingId}</td>
                <td className="px-4 py-3 text-sm">PKR {(comm.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{comm.rate || 0}%</td>
                <td className="px-4 py-3 text-sm font-bold">PKR {(comm.commission || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    comm.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {comm.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommissionTracker;
