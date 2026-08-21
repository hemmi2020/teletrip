import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, CreditCard, Home, FileText, Building2, BedDouble, Users, Clock, AlertCircle, Printer } from 'lucide-react';
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

  // Supplier notice (mandatory per Hotelbeds certification)
  const supplierName = bookingDetails.supplierName || bookingDetails.invoiceCompany || 'HOTELBEDS DMCC';
  const supplierVAT = bookingDetails.supplierVAT || bookingDetails.registrationNumber || '100035906500003';
  const confirmationRef = bookingReference || bookingDetails.bookingReference || 'N/A';
  const supplierNotice = `Payable through ${supplierName}, acting as agent for the service operating company, details of which can be provided upon request. VAT: ${supplierVAT} Reference: ${confirmationRef}`;

  const roomsList = bookingDetails.roomsList || [];
  const totalNetEUR = bookingDetails.totalNetEUR || 0;
  const nights = bookingDetails.nights ||
    (bookingDetails.checkIn && bookingDetails.checkOut
      ? Math.ceil((new Date(bookingDetails.checkOut) - new Date(bookingDetails.checkIn)) / (1000 * 60 * 60 * 24))
      : 1);

  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <Header />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Reserved
            </h1>
            <p className="text-lg text-gray-600">
              {message || 'Your hotel room is reserved. Please visit the Telitrip office to complete payment before check-in.'}
            </p>
          </div>

          {/* Status Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Payment Required</h3>
              <p className="text-sm text-amber-800 mt-1">
                This booking is currently RESERVED. Your room will be confirmed with the hotel once payment is received at the Telitrip office.
              </p>
            </div>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Booking Reference</span>
                <span className="font-semibold text-gray-900 font-mono">{bookingReference}</span>
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
                  <span className="font-medium text-gray-900">{fmtDate(bookingDetails.checkIn)}</span>
                </div>
              )}

              {bookingDetails.checkOut && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium text-gray-900">{fmtDate(bookingDetails.checkOut)}</span>
                </div>
              )}

              {nights > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
              )}

              {totalNetEUR > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Booking Amount (EUR)</span>
                  <span className="font-medium text-gray-900">EUR {totalNetEUR.toFixed(2)}</span>
                </div>
              )}

              {bookingDetails.guests && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total Travelers</span>
                  <span className="font-medium text-gray-900">
                    {bookingDetails.guests} Guest{bookingDetails.guests > 1 ? 's' : ''}{bookingDetails.rooms > 1 ? ` (${bookingDetails.rooms} Rooms)` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Room Breakdown */}
          {roomsList.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Breakdown</h2>
              <div className="space-y-4">
                {roomsList.map((room, idx) => {
                  const roomNights = room.nights || nights || 1;
                  const perNight = roomNights > 0 ? (room.netPrice || 0) / roomNights : (room.netPrice || 0);
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-gray-900">
                          {roomsList.length > 1 ? `Room ${idx + 1}: ` : ''}{room.name}
                        </h4>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            EUR {(room.netPrice || 0).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {roomNights} night{roomNights !== 1 ? 's' : ''} × EUR {perNight.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                        <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {room.boardName || 'Room Only'}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {roomNights} night{roomNights !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-md p-2.5">
                        <div className="text-[10px] uppercase text-gray-500 tracking-wider mb-1">Occupancy</div>
                        <div className="text-xs text-gray-800">
                          <span className="font-semibold">{room.adults || 1}</span> Adult{(room.adults || 1) !== 1 ? 's' : ''}
                          {(room.children || 0) > 0 && (
                            <>, <span className="font-semibold">{room.children}</span> Child{(room.children) !== 1 ? 'ren' : ''}</>
                          )}
                        </div>
                        {room.childAges && room.childAges.length > 0 && (
                          <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Child Age{room.childAges.length !== 1 ? 's' : ''}: {room.childAges.map(a => `${a} year${a !== 1 ? 's' : ''}`).join(', ')}
                          </div>
                        )}
                      </div>
                      {room.rateComments && (
                        <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-500 rounded-r text-[11px] text-slate-700">
                          <strong className="text-blue-800">Rate Comments:</strong> {room.rateComments}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                    <span>Your hotel room is reserved</span>
                  </li>
                  <li className="flex items-start text-green-800">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Please visit the Telitrip office to complete payment before check-in</span>
                  </li>
                  <li className="flex items-start text-green-800">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Bring a valid ID and payment method (cash or card accepted)</span>
                  </li>
                  <li className="flex items-start text-green-800">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Booking will be confirmed once payment is received</span>
                  </li>
                  <li className="flex items-start text-green-800">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>You can view this booking in your dashboard</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Supplier Notice - Mandatory per Hotelbeds */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Supplier Information
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">{supplierNotice}</p>
            <p className="text-xs text-gray-500 mt-1 italic">Full supplier details will appear on your voucher after payment confirmation.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/account')}
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
