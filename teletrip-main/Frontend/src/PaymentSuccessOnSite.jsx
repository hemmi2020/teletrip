import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, CreditCard, Home, FileText } from 'lucide-react';
import Header from './components/Header';

const PaymentSuccessOnSite = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state || {};

  const {
    bookingReference,
    paymentId,
    orderId,
    amount,
    currency = 'PKR',
    message,
    instructions = [],
    bookingDetails = {},
    bookingType = 'hotel'
  } = bookingData;

  return (
    <>
      <Header />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              {message || 'Your booking has been confirmed. Payment will be collected on site.'}
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Booking Reference</span>
                <span className="font-semibold text-gray-900">{bookingReference}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Payment ID</span>
                <span className="font-mono text-sm text-gray-900">{paymentId}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-sm text-gray-900">{orderId}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold text-lg text-green-600">
                  {currency} {amount?.toLocaleString()}
                </span>
              </div>

              {bookingDetails.hotelName && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">{bookingType === 'activity' ? 'Activity' : 'Hotel'}</span>
                  <span className="font-medium text-gray-900">{bookingDetails.hotelName}</span>
                </div>
              )}

              {bookingDetails.checkIn && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium text-gray-900">
                    {new Date(bookingDetails.checkIn).toLocaleDateString()}
                  </span>
                </div>
              )}

              {bookingDetails.checkOut && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium text-gray-900">
                    {new Date(bookingDetails.checkOut).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Instructions
            </h3>
            <ul className="space-y-2">
              {instructions.length > 0 ? (
                instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start text-green-800">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>{instruction}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start text-green-800">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Your booking is confirmed</span>
                  </li>
                  <li className="flex items-start text-green-800">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Payment will be collected when you arrive</span>
                  </li>
                  <li className="flex items-start text-green-800">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Please bring a valid ID and payment method</span>
                  </li>
                  <li className="flex items-start text-green-800">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>You can view this booking in your dashboard</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>View My Bookings</span>
            </button>
            
            <button
              onClick={() => navigate('/home')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>

          {/* Confirmation Email Notice */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>A confirmation email has been sent to your registered email address.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccessOnSite;
