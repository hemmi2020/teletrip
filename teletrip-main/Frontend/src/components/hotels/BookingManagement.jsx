import { useState, useEffect } from 'react';
import { hotelApi } from '../../services/hotelApi';
import { Calendar, Users, DollarSign, Loader2 } from 'lucide-react';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'ALL', from: 1, to: 10, filterType: 'CHECKIN' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { loadBookings(); }, [filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await hotelApi.getBookings(filters);
      setBookings(response.data?.bookings?.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancelling(true);
      await hotelApi.cancelBooking(bookingId, 'CANCELLATION');
      setShowCancelModal(false);
      loadBookings();
    } catch (error) {
      alert('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border rounded px-3 py-2">
            <option value="ALL">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select value={filters.filterType} onChange={(e) => setFilters({ ...filters, filterType: e.target.value })} className="border rounded px-3 py-2">
            <option value="CHECKIN">By Check-in Date</option>
            <option value="CREATION">By Booking Date</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow"><p className="text-gray-500">No bookings found</p></div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.reference} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{booking.hotel?.name}</h3>
                  <p className="text-gray-600">Ref: {booking.reference}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Check-in</p>
                    <p className="text-sm font-medium">{new Date(booking.hotel?.checkIn).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Check-out</p>
                    <p className="text-sm font-medium">{new Date(booking.hotel?.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Guests</p>
                    <p className="text-sm font-medium">{booking.hotel?.rooms?.length || 1} Room(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-medium">{booking.currency} {booking.totalNet}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => hotelApi.getBookingDetails(booking.reference).then(r => setSelectedBooking(r.data?.booking))} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  View Details
                </button>
                {booking.status === 'CONFIRMED' && booking.modificationPolicies?.cancellation && (
                  <button onClick={() => { setSelectedBooking(booking); setShowCancelModal(true); }} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel booking {selectedBooking?.reference}?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50" disabled={cancelling}>No, Keep It</button>
              <button onClick={() => handleCancelBooking(selectedBooking?.reference)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50" disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
