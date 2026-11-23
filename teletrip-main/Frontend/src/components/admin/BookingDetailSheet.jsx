import React, { useState } from 'react';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { getBookingStatusConfig, getPaymentStatusConfig } from '../../lib/stateMachines';
import { AdminDashboardAPI } from '../../services/adminApi';
import { 
  Building2, User, Calendar, DollarSign, Clock, ShieldCheck, 
  AlertTriangle, FileText, ChevronDown, ChevronRight, CheckCircle2,
  ExternalLink, Printer, Send
} from 'lucide-react';

export const BookingDetailSheet = ({ 
  booking, 
  open, 
  onOpenChange, 
  onStatusTransition, 
  onOpenVoucher,
  showToast 
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [simulatingCancellation, setSimulatingCancellation] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  if (!booking) return null;

  const handleSimulateCancellation = async () => {
    const ref = booking.bookingReference || booking.reference || booking._id;
    if (!ref) {
      showToast?.('No booking reference found to simulate', 'error');
      return;
    }
    setSimulatingCancellation(true);
    setSimulationResult(null);
    try {
      const res = await AdminDashboardAPI.simulateBookingCancellation(ref);
      if (res.success && res.data) {
        setSimulationResult(res.data);
        showToast?.('Bedsonline cancellation simulation retrieved successfully', 'success');
      } else {
        showToast?.(res.error || 'Failed to simulate cancellation', 'error');
      }
    } catch (err) {
      showToast?.(err.message || 'Simulation error', 'error');
    } finally {
      setSimulatingCancellation(false);
    }
  };

  const statusConfig = getBookingStatusConfig(booking.status);
  const paymentConfig = getPaymentStatusConfig(booking.paymentDetails?.status || booking.paymentStatus);

  const hotelName = booking.hotelBooking?.hotel?.name || 
                    booking.hotelName || 
                    booking.backup?.hotelbedsBookingData?.booking?.hotel?.name || 
                    'Hotel Reservation';

  const roomName = booking.hotelBooking?.rooms?.[0]?.name || 
                   booking.roomType || 
                   'Standard Room';

  const checkIn = booking.hotelBooking?.checkIn || booking.checkIn;
  const checkOut = booking.hotelBooking?.checkOut || booking.checkOut;
  const guestName = booking.holder 
    ? `${booking.holder.name} ${booking.holder.surname}` 
    : (booking.user ? `${booking.user.fullname?.firstname || ''} ${booking.user.fullname?.lastname || ''}`.trim() : 'Guest');

  const guestEmail = booking.holder?.email || booking.user?.email || 'N/A';
  const guestPhone = booking.holder?.phone || booking.user?.phone || 'N/A';
  const pnr = booking.bookingReference || booking.bookingId || booking._id;
  const supplierRef = booking.hotelBooking?.reference || booking.supplierReference || 'N/A';

  const totalPKR = booking.currencyConversion?.totalPKR 
    ? Math.round(booking.currencyConversion.totalPKR) 
    : (booking.totalAmount || booking.pricing?.totalAmount || 0);

  const supplierNet = booking.hotelBooking?.totalNet || 
                      booking.backup?.hotelbedsBookingData?.booking?.totalNet || 
                      0;

  const supplierCurrency = (
    booking.currencyConversion?.originalCurrency || 
    booking.hotelBooking?.currency || 
    'AED'
  ).toUpperCase();

  const cancellationPolicies = booking.hotelBooking?.rooms?.[0]?.cancellationPolicies || [];

  const handleActionClick = async (action) => {
    if (!window.confirm(`Are you sure you want to transition this booking to "${action.label}"?`)) {
      return;
    }

    try {
      setTransitioning(true);
      await onStatusTransition(booking._id, action.targetStatus, adminNote);
      if (showToast) showToast(`Booking status updated to ${action.targetStatus}`, 'success');
      setAdminNote('');
    } catch (err) {
      if (showToast) showToast(err.message || 'Transition failed', 'error');
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  PNR: {pnr}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusConfig.badgeClass}`}>
                  {statusConfig.label}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${paymentConfig.badgeClass}`}>
                  Payment: {paymentConfig.label}
                </span>
              </div>
              <SheetTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
                {hotelName}
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500 mt-0.5">
                Supplier Reference: <span className="font-mono font-semibold text-slate-700">{supplierRef}</span>
              </SheetDescription>
            </div>

            {onOpenVoucher && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onOpenVoucher(booking)}
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                Voucher
              </Button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 text-sm text-slate-700">
          {/* Guest Information */}
          <div className="rounded-xl border border-slate-200/90 p-4 bg-white shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Guest Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Lead Guest:</span>
                <span className="font-bold text-slate-900 text-sm">{guestName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address:</span>
                <span className="font-semibold text-slate-900 truncate block">{guestEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone Number:</span>
                <span className="font-semibold text-slate-900">{guestPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Rooms / Guests:</span>
                <span className="font-semibold text-slate-900">
                  {booking.hotelBooking?.rooms?.length || 1} Room(s)
                </span>
              </div>
            </div>
          </div>

          {/* Stay & Room Details */}
          <div className="rounded-xl border border-slate-200/90 p-4 bg-white shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Reservation & Room Specs
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Check-In Date:</span>
                <span className="font-bold text-slate-900">
                  {checkIn ? new Date(checkIn).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Check-Out Date:</span>
                <span className="font-bold text-slate-900">
                  {checkOut ? new Date(checkOut).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Room Category:</span>
                <span className="font-semibold text-slate-900">{roomName}</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-xl border border-slate-200/90 p-4 bg-white shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              Financial & Currency Accounting
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Customer Total:</span>
                <span className="text-base font-extrabold text-blue-700">
                  PKR {totalPKR.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Supplier Net Cost:</span>
                <span className="text-base font-bold text-slate-800">
                  {supplierCurrency} {supplierNet}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[11px]">Estimated Margin:</span>
                <span className="text-base font-bold text-emerald-600">
                  {totalPKR > 0 && supplierNet > 0 ? 'Verified' : 'Net Rate'}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Rules */}
          {cancellationPolicies.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Cancellation Deadlines & Penalties
              </h4>
              <div className="space-y-1.5 text-xs text-amber-900">
                {cancellationPolicies.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-amber-200/60 last:border-0">
                    <span>From: {new Date(p.from).toLocaleString()}</span>
                    <span className="font-bold">Penalty: {supplierCurrency} {p.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bedsonline APITUDE Cancellation Simulation Engine */}
          {(booking.status === 'confirmed' || booking.bookingReference) && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Bedsonline APITUDE Cancellation Simulator
                  </h4>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Simulate real-time penalty charges and cancellation reference directly from Bedsonline without cancelling.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={simulatingCancellation}
                  onClick={handleSimulateCancellation}
                  className="bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shrink-0 cursor-pointer"
                >
                  {simulatingCancellation ? 'Simulating...' : 'Simulate Penalty'}
                </Button>
              </div>

              {simulationResult && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200 text-xs text-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-900 border-b pb-1.5">
                    <span>Simulation Status:</span>
                    <Badge variant="emerald">{simulationResult.booking?.status || 'SIMULATED'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Supplier Penalty Amount:</span>
                    <span className="font-bold text-red-600">
                      {simulationResult.booking?.cancellationAmount != null 
                        ? `${simulationResult.booking?.currency || 'EUR'} ${simulationResult.booking?.cancellationAmount}` 
                        : '0.00 (Free Cancellation)'}
                    </span>
                  </div>
                  {simulationResult.booking?.cancellationReference && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Simulation Reference:</span>
                      <span className="font-mono text-slate-700">{simulationResult.booking.cancellationReference}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 pt-1 italic">
                    Simulation completed against Bedsonline live APITUDE. The booking remains ACTIVE until you trigger cancellation.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* State Machine Transition Actions */}
          <div className="rounded-xl border border-slate-200/90 p-4 bg-slate-50/50 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              State Machine Status Transition Controls
            </h4>

            {statusConfig.actions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Booking is in terminal state ({statusConfig.label}). No further automatic transitions are permitted.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {statusConfig.actions.map(action => (
                    <Button
                      key={action.id}
                      variant={action.variant === 'destructive' ? 'destructive' : (action.variant === 'primary' ? 'default' : 'outline')}
                      size="sm"
                      disabled={transitioning}
                      onClick={() => handleActionClick(action)}
                      className="text-xs font-bold"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Optional transition reason / admin audit note..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            )}
          </div>

          {/* Raw Hotelbeds Payload Inspector */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Raw Booking & Supplier JSON Payload
              </span>
              {showRawJson ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {showRawJson && (
              <div className="p-3 bg-slate-900 text-slate-100 max-h-72 overflow-auto text-xs font-mono">
                <pre>{JSON.stringify(booking, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default BookingDetailSheet;
