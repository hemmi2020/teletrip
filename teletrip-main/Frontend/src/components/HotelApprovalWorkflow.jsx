import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Clock } from 'lucide-react';
import { AdminDashboardAPI } from '../services/adminApi';

const HotelApprovalWorkflow = ({ showToast }) => {
  const [pendingHotels, setPendingHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingHotels();
  }, []);

  const loadPendingHotels = async () => {
    setLoading(true);
    try {
      const result = await AdminDashboardAPI.getAllHotels({ status: 'pending' });
      if (result.success) {
        setPendingHotels(result.data.hotels || []);
      }
    } catch (error) {
      showToast?.('Failed to load pending hotels', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (hotelId, action) => {
    try {
      const result = await AdminDashboardAPI.updateHotelStatus(hotelId, {
        status: action === 'approve' ? 'active' : 'rejected',
        reason: `Admin ${action}d`
      });
      if (result.success) {
        showToast?.(`Hotel ${action}d successfully`, 'success');
        loadPendingHotels();
      }
    } catch (error) {
      showToast?.(`Failed to ${action} hotel`, 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock size={20} />
        Hotel Approval Workflow ({pendingHotels.length})
      </h3>

      <div className="space-y-3">
        {pendingHotels.map((hotel) => (
          <div key={hotel._id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium">{hotel.name}</h4>
              <p className="text-sm text-gray-600">{hotel.location?.city}</p>
              <p className="text-xs text-gray-500">Submitted: {new Date(hotel.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApproval(hotel._id, 'approve')}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
              >
                <Check size={16} />
                Approve
              </button>
              <button
                onClick={() => handleApproval(hotel._id, 'reject')}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
              >
                <X size={16} />
                Reject
              </button>
            </div>
          </div>
        ))}
        {pendingHotels.length === 0 && (
          <p className="text-center text-gray-500 py-8">No pending hotels</p>
        )}
      </div>
    </div>
  );
};

export default HotelApprovalWorkflow;
