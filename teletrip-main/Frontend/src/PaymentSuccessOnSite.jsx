import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Calendar, MapPin, CreditCard, Home, FileText, Building2,
  BedDouble, Users, Clock, AlertCircle, Printer, ArrowRight, Hotel,
  Phone, Mail, ShieldCheck, BadgeCheck
} from 'lucide-react';
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

  const fmtShortDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Supplier notice (mandatory per Hotelbeds certification)
  const supplierName = bookingDetails.supplierName || bookingDetails.invoiceCompany || 'HOTELBEDS DMCC';
  const supplierVAT = bookingDetails.supplierVAT || bookingDetails.registrationNumber || '100035906500003';
  const confirmationRef = bookingReference || bookingDetails.bookingReference || 'N/A';
  const supplierNotice = `Payable through ${supplierName}, acting as agent for the service operating company, details of which can be provided upon request. VAT: ${supplierVAT} Reference: ${confirmationRef}`;

  return (
    <>
      <Header />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">

          {/* Success Hero Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
              <CheckCircle className="w-8 h-8 text-amber-600" strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2"
              style={{ fontFamily: '"Apfel Grotezk", "Inter", -apple-system, sans-serif', letterSpacing: '-0.03em' }}>
              Booking Reserved
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
              {message || 'Your hotel room is reserved. Please visit the Telitrip office to complete payment before check-in.'}
            </p>
          </div>

          {/* Status Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5 mb-6 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-amber-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Payment Required</h3>
              <p className="text-sm text-amber-800 mt-0.5 leading-relaxed">
                This booking is currently <strong>RESERVED</strong>. Your room will be confirmed with the hotel once payment is received at the Telitrip office.
              </p>
            </div>
          </div>

          {/* Booking Reference Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1" style={{ letterSpacing: '0.14em' }}>
                  Booking Reference
                </p>
                <p className="text-xl font-bold text-gray-900 font-mono tracking-tight">{bookingReference}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <Clock className="w-3 h-3" /> Payment Pending
                </span>
              </div>
            </div>
          </div>

          {/* Hotel & Dates Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              {bookingDetails.hotelName || 'Hotel Booking'}
            </h2>

            {/* Date strip */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex-1">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1" style={{ letterSpacing: '0.12em' }}>Check-in</p>
                <p className="text-sm font-semibold text-gray-900">{fmtShortDate(bookingDetails.checkIn)}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1" style={{ letterSpacing: '0.12em' }}>Check-out</p>
                <p className="text-sm font-semibold text-gray-900">{fmtShortDate(bookingDetails.checkOut)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Calendar className="w-4 h-4 text-blue-600 mx-auto mb-1" strokeWidth={1.8} />
                <p className="text-xs text-gray-500">Nights</p>
                <p className="text-sm font-bold text-gray-900">{nights}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" strokeWidth={1.8} />
                <p className="text-xs text-gray-500">Guests</p>
                <p className="text-sm font-bold text-gray-900">{bookingDetails.guests || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <BedDouble className="w-4 h-4 text-blue-600 mx-auto mb-1" strokeWidth={1.8} />
                <p className="text-xs text-gray-500">Rooms</p>
                <p className="text-sm font-bold text-gray-900">{bookingDetails.rooms || roomsList.length || 1}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <CreditCard className="w-4 h-4 text-blue-600 mx-auto mb-1" strokeWidth={1.8} />
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold text-gray-900">{currency} {amount?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Room Breakdown */}
          {roomsList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BedDouble className="w-4 h-4 text-blue-600" strokeWidth={1.8} />
                </div>
                <h2 className="text-base font-bold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Room Breakdown</h2>
              </div>

              <div className="space-y-4">
                {roomsList.map((room, idx) => {
                  const roomNights = room.nights || nights || 1;
                  const perNight = roomNights > 0 && (room.netPrice || 0) > 0
                    ? (room.netPrice || 0) / roomNights
                    : 0;
                  return (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            {roomsList.length > 1 ? `Room ${idx + 1}: ` : ''}{room.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <BedDouble className="w-3 h-3" /> {room.boardName || 'Room Only'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            EUR {(room.netPrice || 0).toFixed(2)}
                          </p>
                          {(room.netPrice || 0) > 0 && roomNights > 0 && (
                            <p className="text-[10px] text-gray-400">
                              {roomNights} night{roomNights !== 1 ? 's' : ''} × EUR {perNight.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Occupancy Pill */}
                      <div className="bg-white border border-gray-100 rounded-lg p-3">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5" style={{ letterSpacing: '0.12em' }}>Occupancy</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            <Users className="w-3 h-3" /> {room.adults || 1} Adult{(room.adults || 1) !== 1 ? 's' : ''}
                          </span>
                          {(room.children || 0) > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                              <Clock className="w-3 h-3" /> {room.children} Child{room.children !== 1 ? 'ren' : ''}
                            </span>
                          )}
                        </div>
                        {room.childAges && room.childAges.length > 0 && (
                          <p className="text-[11px] text-amber-700 font-medium mt-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Child age{room.childAges.length !== 1 ? 's' : ''}: {room.childAges.map(a => `${a} yr`).join(', ')}
                          </p>
                        )}
                      </div>

                      {room.rateComments && (
                        <div className="mt-2 p-2.5 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-[11px] text-slate-700 leading-relaxed">
                          <strong className="text-blue-800">Rate Comments:</strong> {room.rateComments}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-green-600" strokeWidth={1.8} />
              </div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Booking Summary</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Booking Amount (EUR)</span>
                {totalNetEUR > 0 ? (
                  <span className="font-semibold text-gray-900">EUR {totalNetEUR.toFixed(2)}</span>
                ) : (
                  <span className="font-semibold text-gray-900">—</span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Payable</span>
                <span className="text-lg font-bold text-gray-900">{currency} {amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-100">
                <span className="text-gray-500">Payment Method</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  <Building2 className="w-3 h-3" /> Pay at Office
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-green-600" strokeWidth={1.8} />
              </div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Payment Instructions</h2>
            </div>

            <ul className="space-y-3">
              {(instructions.length > 0 ? instructions : [
                'Your hotel room is reserved',
                'Payment must be completed at the Telitrip office before check-in',
                'Please bring a valid ID and payment method (cash or card accepted)',
                'Booking will be confirmed once payment is received',
                'You can view this booking in your dashboard'
              ]).map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Supplier Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-gray-500" strokeWidth={1.8} />
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ letterSpacing: '0.08em' }}>Supplier Information</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{supplierNotice}</p>
            <p className="text-[11px] text-gray-400 mt-1.5 italic">Full supplier details will appear on your voucher after payment confirmation.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => navigate('/account')}
              className="flex-1 text-white rounded-full px-6 py-3.5 text-[13px] font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                letterSpacing: '0.08em'
              }}
            >
              <FileText className="w-4 h-4" />
              View My Bookings
            </button>

            <button
              onClick={() => navigate('/home')}
              className="flex-1 px-6 py-3.5 rounded-full text-[13px] font-semibold text-gray-600 border border-gray-300 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </div>

          {/* Email Notice */}
          <div className="text-center pb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs text-gray-500">A confirmation email has been sent to your registered email address.</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default PaymentSuccessOnSite;
