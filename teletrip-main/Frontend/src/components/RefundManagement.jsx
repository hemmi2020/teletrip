import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, X, DollarSign } from 'lucide-react';
import { financialApi } from '../services/financialApi';

const RefundManagement = ({ showToast }) => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadRefunds();
  }, [filter]);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const data = await financialApi.getRefunds(filter);
      setRefunds(data);
    } catch (error) {
      showToast?.('Failed to load refunds', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (refundId, action) => {
    try {
      await financialApi.processRefund(refundId, action);
      showToast?.(`Refund ${action}`, 'success');
      loadRefunds();
    } catch (error) {
      showToast?.('Failed to process refund', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Refund Management</h3>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={loadRefunds}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {refunds.map((refund) => (
          <div key={refund.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">Booking #{refund.bookingId}</div>
              <div className="text-sm text-gray-600">{refund.userName}</div>
              <div className="text-sm text-gray-500">Reason: {refund.reason}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">PKR {(refund.amount || 0).toLocaleString()}</div>
              {refund.status === 'pending' && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleRefund(refund.id, 'approve')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleRefund(refund.id, 'reject')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {refund.status !== 'pending' && (
                <span className={`text-xs px-2 py-1 rounded ${
                  refund.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {refund.status}
                </span>
              )}
            </div>
          </div>
        ))}
        {refunds.length === 0 && (
          <div className="text-center py-8 text-gray-500">No refunds found</div>
        )}
      </div>
    </div>
  );
};

export default RefundManagement;
