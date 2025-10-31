import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, MapPin, Calendar, Package, CreditCard, 
  Hotel, MessageSquare, Edit, Save, Download, Clock, CheckCircle,
  XCircle, AlertCircle, FileText, Image, Star, DollarSign, Loader2
} from 'lucide-react';
import { AdminDashboardAPI } from '../services/adminApi';

// Modal Wrapper Component
const Modal = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 z-[9998]" onClick={onClose} />
        
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full relative z-[9999]`}>
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="bg-white px-6 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Profile Modal
export const UserProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchUserBookings();
    }
  }, [isOpen, user?._id]);

  const fetchUserBookings = async () => {
    setLoadingBookings(true);
    try {
      const result = await AdminDashboardAPI.getAllBookings({ userId: user._id });
      if (result.success) {
        const bookings = result.data.bookings || [];
        setUserBookings(bookings.slice(0, 5));
        
        const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
        console.log('Bookings stats:', { count: bookings.length, totalSpent, bookings });
        
        setFormData(prev => ({
          ...prev,
          totalBookings: bookings.length,
          totalSpent: totalSpent
        }));
      }
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };
  
  if (!user) return null;

  const userData = {
    ...user,
    fullname: user.fullname || { firstname: 'N/A', lastname: '' },
    email: user.email || 'N/A',
    phone: user.phone || 'Not provided',
    dateOfBirth: user.dateOfBirth || null,
    gender: user.gender || 'Not specified',
    address: user.address || {},
    isActive: user.isActive !== undefined ? user.isActive : true,
    createdAt: user.createdAt || new Date(),
    totalBookings: formData.totalBookings || 0,
    totalSpent: formData.totalSpent || 0,
    loyaltyPoints: user.loyaltyPoints || 0
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile Details" size="xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {userData.fullname?.firstname?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {userData.fullname?.firstname} {userData.fullname?.lastname}
            </h2>
            <p className="text-gray-600">{userData.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                userData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {userData.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-sm text-gray-500">
                Member since {new Date(userData.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <span>{userData.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span>{userData.gender}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Address</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p>{userData.address?.street || 'No address'}</p>
                  <p>{userData.address?.city || 'N/A'}, {userData.address?.state || 'N/A'}</p>
                  <p>{userData.address?.country || 'N/A'} - {userData.address?.postalCode || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking History</h3>
          <div className="space-y-3">
            {loadingBookings ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : userBookings.length > 0 ? (
              userBookings.map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">
                        {booking.hotelBooking?.hotelName || booking.hotelName || booking.hotelId?.name || 'Hotel Booking'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Ref: {booking.bookingReference || booking._id?.slice(-8) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    booking.status === 'completed' || booking.status === 'confirmed' ? 
                      'bg-green-100 text-green-800' : 
                    booking.status === 'pending' ? 
                      'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                  }`}>
                    {booking.status || 'pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No bookings yet</p>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600">{userData.totalBookings}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-green-600">PKR {userData.totalSpent?.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Loyalty Points</p>
            <p className="text-2xl font-bold text-purple-600">{userData.loyaltyPoints}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Booking Details Modal
export const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  const nights = booking.nights || booking.travelDates?.duration || booking.hotelBooking?.rooms?.[0]?.nights || 1;
  
  const bookingData = {
    ...booking,
    bookingReference: booking.bookingReference || booking._id?.slice(-8) || 'N/A',
    createdAt: booking.createdAt || new Date(),
    status: booking.status || 'pending',
    hotelBooking: booking.hotelBooking || {},
    guestInfo: booking.guestInfo || { primaryGuest: {} },
    checkInDate: booking.checkInDate || booking.travelDates?.departureDate || booking.hotelBooking?.checkIn || booking.hotelBooking?.rooms?.[0]?.checkIn,
    checkOutDate: booking.checkOutDate || booking.travelDates?.returnDate || booking.hotelBooking?.checkOut || booking.hotelBooking?.rooms?.[0]?.checkOut,
    nights: nights,
    guests: booking.guests || booking.guestInfo?.totalGuests?.adults || booking.hotelBooking?.rooms?.[0]?.adults || 1,
    totalAmount: booking.totalAmount || booking.pricing?.totalAmount || 0
  };

  const timeline = [
    { status: 'created', label: 'Booking Created', date: bookingData.createdAt, completed: true },
    { status: 'confirmed', label: 'Confirmed', date: bookingData.confirmedAt, completed: bookingData.status !== 'pending' },
    { status: 'checkin', label: 'Check-in', date: bookingData.checkInDate, completed: bookingData.status === 'completed' },
    { status: 'checkout', label: 'Check-out', date: bookingData.checkOutDate, completed: bookingData.status === 'completed' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="xl">
      <div className="space-y-6">
        {/* Booking Header */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {bookingData.hotelBooking?.hotelName || bookingData.hotelBooking?.rooms?.[0]?.hotelName || 'Booking'}
              </h2>
              <p className="text-gray-600">Booking Reference: {bookingData.bookingReference} • {bookingData.nights} Night(s)</p>
              <p className="text-sm text-gray-500 mt-1">
                Created on {new Date(bookingData.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              bookingData.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              bookingData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              bookingData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {bookingData.status}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h3>
          <div className="relative">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-4 mb-6 last:mb-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">
                    {item.date ? new Date(item.date).toLocaleString() : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Information */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span>{bookingData.guestInfo?.primaryGuest?.firstName || 'N/A'} {bookingData.guestInfo?.primaryGuest?.lastName || ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{bookingData.guestInfo?.primaryGuest?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{bookingData.guestInfo?.primaryGuest?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium">{bookingData.checkInDate ? new Date(bookingData.checkInDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium">{bookingData.checkOutDate ? new Date(bookingData.checkOutDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nights:</span>
                <span className="font-medium">{bookingData.nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-medium">{bookingData.guests}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Details</h3>
          {bookingData.hotelBooking?.rooms?.map((room, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{room.roomName}</p>
                  <p className="text-sm text-gray-600">{room.boardName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {room.adults} Adult(s) {room.children > 0 && `• ${room.children} Child(ren)`}
                  </p>
                </div>
                <p className="text-lg font-bold text-blue-600">PKR {room.net}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Information */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">
                {bookingData.hotelBooking?.rooms?.[0]?.paymentType === 'AT_WEB' ? 'Credit Card' : 'Pay on Site'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`font-medium ${
                bookingData.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {bookingData.status === 'confirmed' ? 'Paid' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total Amount:</span>
              <span className="text-blue-600">PKR {bookingData.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Voucher
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Send Email
          </button>
        </div>
      </div>
    </Modal>
  );
};
