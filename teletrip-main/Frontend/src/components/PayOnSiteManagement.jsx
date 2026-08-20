import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, Building2, User, Calendar, 
  CreditCard, Phone, Mail, MapPin, Check, X,
  Loader2, AlertCircle, Hotel, ArrowRight, RefreshCw,
  Filter, Search, ChevronDown
} from 'lucide-react';
import { AdminDashboardAPI } from '../services/adminApi';

const PayOnSiteManagement = ({ showToast }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const API_BASE = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await AdminDashboardAPI.getPayOnSiteBookings({
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      if (result.success) {
        setBookings(result.data.payments || []);
      } else {
        showToast(result.error || 'Failed to load bookings', 'error');
      }
    } catch (error) {
      showToast('Failed to load pay-on-site bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsPaid = async () => {
    if (!selectedBooking) return;
    
    setProcessingId(selectedBooking._id);
    setShowConfirmModal(false);
    
    try {
      const result = await AdminDashboardAPI.markPayOnSiteAsPaid(selectedBooking._id, {
        paymentMethod,
        notes
      });
      
      if (result.success) {
        const hasHotelbedsRef = result.data?.hotelbedsReference;
        showToast(
          hasHotelbedsRef 
            ? `Payment confirmed! Hotelbeds Reference: ${result.data.hotelbedsReference}`
            : 'Payment marked as paid successfully',
          'success'
        );
        await loadBookings();
      } else {
        showToast(result.error || 'Failed to confirm payment', 'error');
      }
    } catch (error) {
      showToast('Failed to process payment confirmation', 'error');
    } finally {
      setProcessingId(null);
      setSelectedBooking(null);
      setNotes('');
    }
  };

  const openConfirmModal = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && b.status === 'pending') ||
      (filter === 'completed' && b.status === 'completed');
    
    const matchesSearch = !searchTerm || 
      (b.billing?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.billing?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.billing?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.bookingDetails?.hotelName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalAmount = bookings
    .filter(b => b.status === 'pending')
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <h3 className="text-2xl font-bold text-gray-900">{pendingCount}</h3>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Today</p>
              <h3 className="text-2xl font-bold text-gray-900">{completedCount}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pending Amount</p>
              <h3 className="text-2xl font-bold text-gray-900">PKR {totalAmount.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {['all', 'pending', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All Bookings' : f === 'pending' ? 'Pending' : 'Completed'}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={loadBookings}
              className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="text-gray-500 mt-1">
            {filter === 'pending' ? 'No pending pay-on-site bookings.' : 'No bookings match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => {
            const isPending = booking.status === 'pending';
            const isProcessing = processingId === booking._id;
            const hotelbedsRef = booking.metadata?.hotelbedsReference;
            const hasHotelbedsError = booking.metadata?.hotelbedsError;
            
            return (
              <div 
                key={booking._id} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition ${
                  isPending ? 'border-yellow-200' : 'border-green-200'
                }`}
              >
                {/* Header */}
                <div className={`px-5 py-3 flex items-center justify-between ${
                  isPending ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    <span className={`text-sm font-semibold ${
                      isPending ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      {isPending ? 'Payment Pending' : 'Payment Completed'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{booking.paymentId}</span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Hotel Info */}
                  <div className="flex items-start gap-3">
                    <Hotel className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {booking.bookingDetails?.hotelName || 'Hotel Booking'}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.bookingDetails?.checkIn 
                            ? new Date(booking.bookingDetails.checkIn).toLocaleDateString() 
                            : 'N/A'}
                          {' - '}
                          {booking.bookingDetails?.checkOut 
                            ? new Date(booking.bookingDetails.checkOut).toLocaleDateString() 
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.billing?.firstName} {booking.billing?.lastName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {booking.billing?.email}
                        </span>
                        {booking.billing?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.billing?.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {booking.currency || 'PKR'} {booking.amount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Booked</p>
                      <p className="text-sm text-gray-600">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Hotelbeds Status */}
                  {hotelbedsRef && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Hotelbeds Confirmed
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1 font-mono">
                        Reference: {hotelbedsRef}
                      </p>
                    </div>
                  )}
                  
                  {hasHotelbedsError && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Hotelbeds Booking Failed
                        </span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        {booking.metadata.hotelbedsError}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {isPending && (
                    <button
                      onClick={() => openConfirmModal(booking)}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Confirming with Hotelbeds...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Mark Payment Received & Confirm Booking
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Payment Received</h2>
              <p className="text-sm text-gray-500 mt-1">
                This will mark the payment as paid and immediately confirm the booking with Hotelbeds.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Guest</span>
                <span className="font-medium">{selectedBooking.billing?.firstName} {selectedBooking.billing?.lastName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">{selectedBooking.currency || 'PKR'} {selectedBooking.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hotel</span>
                <span className="font-medium truncate max-w-[200px]">{selectedBooking.bookingDetails?.hotelName || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card (Swipe/Insert)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Transaction ID, receipt number..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedBooking(null);
                  setNotes('');
                }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPaid}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm & Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayOnSiteManagement;
