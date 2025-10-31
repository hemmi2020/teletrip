import React, { useState } from 'react';
import { 
  X, CreditCard, Download, CheckCircle, XCircle, Clock, 
  Hotel, Star, MapPin, Image, Wifi, Coffee, Tv, Wind,
  MessageSquare, Send, User, AlertCircle, Edit, Save
} from 'lucide-react';

// Modal Wrapper
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

// Payment Details Modal
export const PaymentDetailsModal = ({ isOpen, onClose, payment }) => {
  if (!payment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Transaction Details" size="lg">
      <div className="space-y-6">
        {/* Payment Header */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                PKR {payment.amount?.toLocaleString()}
              </h2>
              <p className="text-gray-600">Transaction ID: {payment.transactionId || payment._id}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(payment.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              payment.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {payment.status}
            </span>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {payment.paymentMethod || 'Credit Card'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Gateway:</span>
                <span className="font-medium">HBL Pay</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{payment.currency || 'PKR'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Fee:</span>
                <span className="font-medium">PKR {(payment.amount * 0.02).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{payment.userId?.fullname?.firstname} {payment.userId?.fullname?.lastname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{payment.userId?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Ref:</span>
                <span className="font-medium">{payment.bookingId?.bookingReference}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>PKR {(payment.amount * 0.98).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee:</span>
              <span>PKR {(payment.amount * 0.02).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total Paid:</span>
              <span className="text-green-600">PKR {payment.amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Receipt Actions */}
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" />
            Process Refund
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Hotel Information Modal
export const HotelDetailsModal = ({ isOpen, onClose, hotel }) => {
  if (!hotel) return null;

  const amenityIcons = {
    'WiFi': Wifi,
    'Restaurant': Coffee,
    'TV': Tv,
    'AC': Wind
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hotel Information" size="xl">
      <div className="space-y-6">
        {/* Hotel Images */}
        {hotel.images && hotel.images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {hotel.images.slice(0, 6).map((img, index) => (
              <div key={index} className="aspect-video rounded-lg overflow-hidden">
                <img src={img} alt={`Hotel ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Hotel Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < hotel.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{hotel.rating} Star Hotel</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{hotel.address || hotel.location?.city}</span>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            hotel.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {hotel.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Hotel Details */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Rooms:</span>
                <span className="font-medium">{hotel.totalRooms || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in Time:</span>
                <span className="font-medium">{hotel.checkInTime || '2:00 PM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out Time:</span>
                <span className="font-medium">{hotel.checkOutTime || '12:00 PM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Property Type:</span>
                <span className="font-medium">{hotel.propertyType || 'Hotel'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{hotel.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{hotel.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Website:</span>
                <span className="font-medium text-blue-600">{hotel.website || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
          <div className="grid grid-cols-3 gap-3">
            {hotel.amenities?.map((amenity, index) => {
              const Icon = amenityIcons[amenity] || Hotel;
              return (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">{amenity}</span>
                </div>
              );
            }) || <p className="text-gray-500">No amenities listed</p>}
          </div>
        </div>

        {/* Description */}
        {hotel.description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-600">{hotel.description}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600">{hotel.totalBookings || 0}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-2xl font-bold text-green-600">{hotel.averageRating || 0}/5</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Reviews</p>
            <p className="text-2xl font-bold text-purple-600">{hotel.totalReviews || 0}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Support Ticket Modal
export const SupportTicketModal = ({ isOpen, onClose, ticket, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  if (!ticket) return null;

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(ticket._id, message);
      setMessage('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Support Ticket" size="lg">
      <div className="space-y-6">
        {/* Ticket Header */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{ticket.subject}</h2>
              <p className="text-gray-600">Ticket ID: {ticket._id?.slice(-8)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Created {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {ticket.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {ticket.priority || 'Normal'} Priority
              </span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {ticket.user?.fullname?.firstname?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium">{ticket.user?.fullname?.firstname} {ticket.user?.fullname?.lastname}</p>
            <p className="text-sm text-gray-600">{ticket.user?.email}</p>
          </div>
        </div>

        {/* Conversation Thread */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Initial Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                {ticket.user?.fullname?.firstname?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{ticket.message}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Responses */}
            {ticket.responses?.map((response, index) => (
              <div key={index} className={`flex gap-3 ${response.isAdmin ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                  response.isAdmin ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                  {response.isAdmin ? 'A' : 'U'}
                </div>
                <div className="flex-1">
                  <div className={`rounded-lg p-4 ${response.isAdmin ? 'bg-green-50' : 'bg-blue-50'}`}>
                    <p className="text-sm text-gray-900">{response.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(response.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Box */}
        {ticket.status !== 'closed' && (
          <div className="border-t pt-4">
            <div className="flex gap-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
              />
              <button
                onClick={handleSend}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
