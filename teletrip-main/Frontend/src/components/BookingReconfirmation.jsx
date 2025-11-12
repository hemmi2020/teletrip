import React, { useState } from 'react';
import { RefreshCw, CheckCircle, Clock, Calendar, Search } from 'lucide-react';
import axios from 'axios';

const BookingReconfirmation = ({ showToast }) => {
  const [loading, setLoading] = useState(false);
  const [reconfirmations, setReconfirmations] = useState([]);
  const [filterType, setFilterType] = useState('CHECKIN');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReconfirmations = async () => {
    if (!startDate || !endDate) {
      showToast('Please select start and end dates', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const params = new URLSearchParams({
        from: 1,
        to: 100,
        start: startDate,
        end: endDate,
        filterType: filterType
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/hotels/bookings/reconfirmations?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReconfirmations(response.data.data.bookings || []);
        showToast(`Found ${response.data.data.bookings?.length || 0} reconfirmations`, 'success');
      } else {
        showToast('Failed to fetch reconfirmations', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch reconfirmations', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Booking Reconfirmations</h2>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Retrieve hotel confirmation numbers from Hotelbeds for your bookings. These numbers are provided by hotels after booking confirmation.
      </p>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="CHECKIN">Check-in Date</option>
            <option value="RECONFIRMATION">Reconfirmation Date</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchReconfirmations}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Fetch
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {reconfirmations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Booking Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hotel Confirmation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hotel Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reconfirmations.map((booking, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.reference || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.hotel?.supplierReference || (
                      <span className="text-yellow-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {booking.hotel?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.hotel?.checkIn ? new Date(booking.hotel.checkIn).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status || 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No reconfirmations found</p>
          <p className="text-sm text-gray-500 mt-1">
            Select dates and click Fetch to retrieve hotel confirmation numbers
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Hotel confirmation numbers are provided asynchronously by hotels. 
          If a booking shows "Pending", the hotel hasn't provided the confirmation number yet. 
          Check back later or contact the hotel directly.
        </p>
      </div>
    </div>
  );
};

export default BookingReconfirmation;
