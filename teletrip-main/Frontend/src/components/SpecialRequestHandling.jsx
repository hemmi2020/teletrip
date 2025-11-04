import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const SpecialRequestHandling = ({ bookingId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [bookingId]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/special-requests`);
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/special-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return styles[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Star className="w-6 h-6 text-yellow-600 mr-2" />
        <h3 className="text-xl font-bold">Special Requests</h3>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No special requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{request.type}</h4>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'approved')}
                    className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'rejected')}
                    className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium mb-3">Request Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </p>
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </p>
            <p className="text-sm text-green-700">Approved</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </p>
            <p className="text-sm text-red-700">Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialRequestHandling;
