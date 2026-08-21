import React, { useRef, useState, useEffect } from 'react';
import {
  Printer, Phone, Mail, Calendar, Users, CreditCard, AlertTriangle,
  Building2, BedDouble, Clock, CheckCircle, Ban, ShieldCheck,
  MapPin, BadgeCheck, ArrowRight
} from 'lucide-react';

const BookingVoucher = ({ booking, onClose }) => {
  const voucherRef = useRef(null);
  const [pkrRate, setPkrRate] = useState(null);

  // Fetch PKR conversion rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const API = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';
        const res = await fetch(`${API}/currency/rate`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) setPkrRate(data.data);
        }
      } catch (e) { /* silent */ }
    };
    fetchRate();
  }, []);

  const toPKR = (eurAmount) => {
    if (!pkrRate || !eurAmount) return null;
    const base = eurAmount * (pkrRate.exchangeRate || 310);
    const markup = eurAmount * (pkrRate.markupPerEuro || 0);
    const subtotal = base + markup;
    const fee = (subtotal * (pkrRate.transactionFeePercentage || 0)) / 100;
    return Math.round(subtotal + fee);
  };

  const formatPKR = (eurAmount) => {
    const pkr = toPKR(eurAmount);
    return pkr ? `PKR ${pkr.toLocaleString()}` : null;
  };

  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fmtShortDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handlePrint = () => {
    const printContent = voucherRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Voucher - ${booking.hotelBooking?.confirmationNumber || booking.bookingReference}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #111827; font-size: 13px; line-height: 1.6;
              background: #fff;
            }
            .v-container { max-width: 720px; margin: 0 auto; padding: 24px; }

            /* Header */
            .v-header {
              display: flex; justify-content: space-between; align-items: flex-start;
              padding-bottom: 16px; margin-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
            }
            .v-brand h1 { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.03em; margin: 0; }
            .v-brand p { font-size: 12px; color: #6b7280; margin-top: 2px; }
            .v-conf { text-align: right; }
            .v-conf-label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.12em; }
            .v-conf-num { font-size: 16px; font-weight: 700; color: #111827; font-family: ui-monospace, monospace; margin-top: 2px; }
            .v-status {
              display: inline-block; margin-top: 6px; padding: 4px 12px; border-radius: 9999px;
              font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
            }
            .v-status-confirmed { background: #dcfce7; color: #166534; }
            .v-status-pending { background: #fef3c7; color: #92400e; }
            .v-status-cancelled { background: #fee2e2; color: #991b1b; }

            /* Cards */
            .v-card {
              background: #fff; border: 1px solid #e5e7eb; border-radius: 16px;
              padding: 16px; margin-bottom: 14px;
            }
            .v-card-title {
              font-size: 13px; font-weight: 700; color: #111827;
              letter-spacing: -0.02em; margin-bottom: 12px;
              display: flex; align-items: center; gap: 8px;
            }
            .v-card-title-icon {
              width: 28px; height: 28px; border-radius: 8px;
              display: flex; align-items: center; justify-content: center;
            }

            /* Two column */
            .v-two-col { display: flex; gap: 16px; }
            .v-two-col > div { flex: 1; }
            .v-table { width: 100%; border-collapse: collapse; }
            .v-table td { padding: 5px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
            .v-table td:first-child { color: #6b7280; font-size: 12px; width: 42%; }
            .v-table td:last-child { font-weight: 600; color: #111827; font-size: 12px; text-align: right; }

            /* Date strip */
            .v-date-strip {
              display: flex; align-items: center; gap: 12px;
              background: #f9fafb; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px;
            }
            .v-date-block { flex: 1; }
            .v-date-label { font-size: 9px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.12em; }
            .v-date-val { font-size: 13px; font-weight: 600; color: #111827; }
            .v-date-arrow { width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; }

            /* Room card */
            .v-room {
              background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px;
              padding: 14px; margin-bottom: 10px;
            }
            .v-room-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
            .v-room-name { font-size: 13px; font-weight: 700; color: #111827; }
            .v-room-price { text-align: right; }
            .v-room-price-total { font-size: 15px; font-weight: 700; color: #111827; }
            .v-room-price-detail { font-size: 10px; color: #6b7280; }
            .v-room-meta { display: flex; gap: 12px; font-size: 11px; color: #6b7280; margin-bottom: 8px; }
            .v-pax-box {
              background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
              padding: 8px 12px;
            }
            .v-pax-label { font-size: 9px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.12em; margin-bottom: 4px; }
            .v-pax-row { font-size: 12px; color: #374151; }
            .v-child-ages { font-size: 11px; color: #92400e; font-weight: 500; margin-top: 2px; }
            .v-rate-comment {
              background: #eff6ff; border-left: 3px solid #3b82f6; padding: 8px 12px;
              margin-top: 8px; font-size: 11px; color: #334155; line-height: 1.5; border-radius: 0 6px 6px 0;
            }
            .v-tax-box {
              margin-top: 8px; padding: 8px 12px; background: #fffbeb; border: 1px solid #fde68a;
              border-radius: 6px; font-size: 11px; color: #713f12;
            }

            /* Guest grid */
            .v-guest-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
            .v-guest-cell { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; }
            .v-guest-label { font-size: 9px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.12em; margin-bottom: 2px; }
            .v-guest-val { font-size: 13px; font-weight: 600; color: #111827; }

            /* Paid facilities */
            .v-facilities-red {
              background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;
              padding: 12px; margin-bottom: 14px;
            }
            .v-facilities-red h4 { margin: 0 0 6px; font-size: 11px; color: #991b1b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
            .v-facilities-red p { margin: 0; font-size: 11px; color: #7f1d1d; }
            .v-facility-tag { display: inline-block; padding: 2px 8px; background: #fee2e2; color: #991b1b; border-radius: 4px; font-size: 10px; margin: 3px 3px 0 0; }
            .v-facilities-green {
              background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;
              padding: 12px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
            }
            .v-facilities-green span { font-size: 11px; color: #166534; font-weight: 500; }

            /* Summary */
            .v-summary { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 16px; margin-bottom: 14px; }
            .v-summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
            .v-summary-row.total { font-size: 15px; font-weight: 700; color: #111827; border-top: 1px solid #bbf7d0; margin-top: 6px; padding-top: 6px; }
            .v-summary-warning {
              margin-top: 8px; padding: 8px 12px; background: #fef3c7; border: 1px solid #fde68a;
              border-radius: 8px; font-size: 11px; color: #92400e; font-weight: 500;
            }

            /* Supplier */
            .v-supplier { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; font-size: 11px; color: #4b5563; line-height: 1.6; }

            /* Notice */
            .v-notice { background: #fff7ed; border-left: 4px solid #f97316; padding: 10px 14px; margin-top: 12px; font-size: 11px; color: #7c2d12; border-radius: 0 8px 8px 0; }

            /* Footer */
            .v-footer { text-align: center; margin-top: 28px; padding-top: 16px; border-top: 2px solid #e5e7eb; }
            .v-footer p { color: #9ca3af; font-size: 10px; }
            .v-footer .brand { color: #6b7280; font-weight: 600; font-size: 11px; margin-bottom: 2px; }

            @media print {
              body { padding: 0; background: #fff; }
              .v-container { padding: 0; max-width: 100%; }
              .no-print { display: none !important; }
              .v-card { break-inside: avoid; }
              .v-room { break-inside: avoid; }
              .v-two-col { break-inside: avoid; }
            }
          </style>
        </head>
        <body><div class="v-container">${printContent}</div></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ===== DATA EXTRACTION =====
  const hb = booking.hotelBooking || {};
  const backup = booking.backup?.hotelbedsBookingData;
  const hbBooking = backup?.booking;
  const hbHotel = hbBooking?.hotel || {};
  const supplier = hb.supplier || hbHotel.supplier || hbBooking?.supplier;
  const invoiceCompany = hb.invoiceCompany || hbBooking?.invoiceCompany;

  const hotelbedsRef = hb.confirmationNumber || hbBooking?.reference || booking.hotelBooking?.hotelbedsReference || '';
  const confirmationNumber = hotelbedsRef || booking.bookingReference;

  const rooms = hb.rooms || hbHotel.rooms || hbBooking?.hotel?.rooms || [];
  const primaryGuest = booking.guestInfo?.primaryGuest || {};
  const checkIn = hb.checkIn || booking.checkInDate;
  const checkOut = hb.checkOut || booking.checkOutDate;
  const nights = hb.nights || 1;

  const bookingCurrency = hbBooking?.currency || hb.currency || booking.pricing?.currency || 'EUR';
  const categoryName = hb.categoryName || hbHotel.categoryName || '';
  const categoryCode = hb.categoryCode || hbHotel.categoryCode || '';
  const destinationName = hb.destinationName || hbHotel.destinationName || '';
  const zoneName = hb.zoneName || hbHotel.zoneName || '';
  const hotelName = hb.hotelName || hbHotel.name || 'Hotel';
  const accommodationType = hb.accommodationType || hbHotel.accommodationType ||
    (categoryCode === '4EST' ? '4 Star Hotel' : categoryCode === '5EST' ? '5 Star Hotel' : categoryCode === '3EST' ? '3 Star Hotel' : categoryCode === 'STD' ? 'Standard Hotel' : 'Hotel');

  const paidFacilities = hb.paidFacilities || [];
  const hotelPhone = hb.hotelPhone || hbHotel.phones?.[0]?.phoneNumber || hbBooking?.hotel?.phones?.[0]?.phoneNumber || '';

  const addressParts = [hb.hotelAddress?.street, hb.hotelAddress?.fullAddress, zoneName, destinationName].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts[0] : (hb.hotelAddress?.city || zoneName || destinationName || '');

  const totalNetEUR = parseFloat(hbBooking?.totalNet) || parseFloat(hb.totalNet) || parseFloat(hbHotel?.totalNet) || rooms.reduce((sum, r) => sum + parseFloat(r.netPrice || r.sellingPrice || 0), 0);
  const totalPKR = booking.pricing?.totalAmount || 0;
  const pkrConverted = formatPKR(totalNetEUR);
  const displayTotal = totalPKR > 100 ? `PKR ${Math.round(totalPKR).toLocaleString()}` : (pkrConverted || `PKR ${Math.round(totalNetEUR * 310).toLocaleString()}`);

  const paymentMethod = booking.payment?.method || booking.paymentMethod ||
    (hb.rooms?.[0]?.paymentType === 'AT_HOTEL' ? 'pay_on_site' : 'card');

  const supplierName = supplier?.name || invoiceCompany?.company || hbBooking?.invoiceCompany?.company || 'HOTELBEDS DMCC';
  const supplierVAT = supplier?.vatNumber || invoiceCompany?.registrationNumber || hbBooking?.invoiceCompany?.registrationNumber || '100035906500003';
  const supplierNotice = `Payable through ${supplierName}, acting as agent for the service operating company, details of which can be provided upon request. VAT: ${supplierVAT} Reference: ${confirmationNumber}`;

  const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';
  const isReserved = booking.status === 'pending' && paymentMethod === 'pay_on_site';
  const statusLabel = isCancelled ? 'Cancelled' : isConfirmed ? 'Confirmed' : isReserved ? 'Reserved — Payment Pending' : 'Pending';
  const statusColor = isCancelled ? 'bg-red-100 text-red-700' : isConfirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between z-10 no-print">
          <h2 className="text-base font-bold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Booking Voucher</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-white rounded-full text-xs font-bold tracking-widest uppercase transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', letterSpacing: '0.08em' }}>
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-full text-xs font-semibold transition-colors">
              Close
            </button>
          </div>
        </div>

        {/* Voucher Content */}
        <div ref={voucherRef} className="p-5 md:p-8 bg-gray-50">

          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: '"Apfel Grotezk", "Inter", sans-serif', letterSpacing: '-0.03em' }}>
                  Telitrip
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">Booking Confirmation Voucher</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400" style={{ letterSpacing: '0.12em' }}>Confirmation #</p>
                <p className="text-base font-bold text-gray-900 font-mono tracking-tight">{confirmationNumber}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`} style={{ letterSpacing: '0.08em' }}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          {isReserved && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-600" strokeWidth={2} />
              </div>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                This booking is <strong>RESERVED</strong>. Payment must be completed at the Telitrip office before check-in. The room will be confirmed with the hotel once payment is received.
              </p>
            </div>
          )}

          {/* Hotel & Dates */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Hotel & Stay Details</h3>
            </div>

            {/* Date Strip */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-4">
              <div className="flex-1">
                <p className="text-[9px] font-semibold tracking-widest uppercase text-gray-400" style={{ letterSpacing: '0.12em' }}>Check-in</p>
                <p className="text-sm font-semibold text-gray-900">{fmtShortDate(checkIn)}</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-[9px] font-semibold tracking-widest uppercase text-gray-400" style={{ letterSpacing: '0.12em' }}>Check-out</p>
                <p className="text-sm font-semibold text-gray-900">{fmtShortDate(checkOut)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hotel Info */}
              <div>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-400 text-xs w-2/5">Hotel</td>
                      <td className="py-1.5 font-semibold text-gray-900 text-right text-xs">{hotelName}</td>
                    </tr>
                    {categoryName && (
                      <tr className="border-b border-gray-50">
                        <td className="py-1.5 text-gray-400 text-xs">Category</td>
                        <td className="py-1.5 font-semibold text-gray-900 text-right text-xs">{categoryName}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-400 text-xs">Type</td>
                      <td className="py-1.5 font-semibold text-gray-900 text-right text-xs">{accommodationType}</td>
                    </tr>
                    {fullAddress && (
                      <tr className="border-b border-gray-50">
                        <td className="py-1.5 text-gray-400 text-xs">Address</td>
                        <td className="py-1.5 font-semibold text-gray-900 text-right text-xs">{fullAddress}</td>
                      </tr>
                    )}
                    {hotelPhone && (
                      <tr className="border-b border-gray-50">
                        <td className="py-1.5 text-gray-400 text-xs">Phone</td>
                        <td className="py-1.5 font-semibold text-gray-900 text-right text-xs">{hotelPhone}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Booking Info */}
              <div>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-400 text-xs w-2/5">Nights</td>
                      <td className="py-1.5 font-semibold text-gray-900 text-right text-xs">{nights}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-400 text-xs">Currency</td>
                      <td className="py-1.5 font-semibold text-gray-900 text-right text-xs">{bookingCurrency}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-400 text-xs">Payment</td>
                      <td className="py-1.5 font-semibold text-gray-900 text-right text-xs">
                        {paymentMethod === 'pay_on_site' ? 'Pay at Office' : 'Credit Card'}
                      </td>
                    </tr>
                    {destinationName && (
                      <tr className="border-b border-gray-50">
                        <td className="py-1.5 text-gray-400 text-xs">Destination</td>
                        <td className="py-1.5 font-semibold text-gray-900 text-right text-xs">{destinationName}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Paid Facilities */}
          {paidFacilities.length > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" strokeWidth={2} />
                <h4 className="text-[11px] font-bold uppercase text-red-800 tracking-wider" style={{ letterSpacing: '0.08em' }}>Facilities with Extra Charges</h4>
              </div>
              <p className="text-[11px] text-red-700 mb-2">The following facilities require extra payment directly at the property:</p>
              <div className="flex flex-wrap gap-1.5">
                {paidFacilities.map((f, i) => (
                  <span key={i} className="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-[10px] rounded-full font-medium">
                    {f.description}{f.roomName ? ` (${f.roomName})` : ''}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" strokeWidth={2} />
              <p className="text-[11px] text-green-800 font-medium">
                All facilities included in this rate are complimentary. No additional charges apply.
              </p>
            </div>
          )}

          {/* Room Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <BedDouble className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Room Details</h3>
            </div>

            {rooms.map((room, idx) => {
              const adults = room.adults || 1;
              const children = room.children || 0;
              const childAges = room.childAges || [];
              const netPrice = parseFloat(room.netPrice || room.sellingPrice || 0);
              const boardName = room.boardName || 'Room Only';
              const rateComments = room.rateComments || '';
              const taxes = room.taxes;
              const roomName = room.roomName || room.name || `Room ${idx + 1}`;
              const perNight = nights > 0 && netPrice > 0 ? netPrice / nights : 0;

              return (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-3 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {rooms.length > 1 ? `Room ${idx + 1}: ` : ''}{roomName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <BedDouble className="w-3 h-3" /> {boardName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-bold text-gray-900">{bookingCurrency} {netPrice.toFixed(2)}</p>
                      {nights > 0 && netPrice > 0 && (
                        <p className="text-[10px] text-gray-400">{nights} night{nights !== 1 ? 's' : ''} × {bookingCurrency} {perNight.toFixed(2)}</p>
                      )}
                      {formatPKR(netPrice) && (
                        <p className="text-[11px] text-green-700 font-semibold mt-0.5">{formatPKR(netPrice)}</p>
                      )}
                    </div>
                  </div>

                  {/* Occupancy */}
                  <div className="bg-white border border-gray-100 rounded-lg p-2.5 mt-2">
                    <p className="text-[9px] font-semibold tracking-widest uppercase text-gray-400 mb-1" style={{ letterSpacing: '0.12em' }}>Occupancy</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px] font-medium">
                        <Users className="w-3 h-3" /> {adults} Adult{adults !== 1 ? 's' : ''}
                      </span>
                      {children > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-medium">
                          <Clock className="w-3 h-3" /> {children} Child{children !== 1 ? 'ren' : ''}
                        </span>
                      )}
                    </div>
                    {childAges.length > 0 && (
                      <p className="text-[11px] text-amber-700 font-medium mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Child age{childAges.length !== 1 ? 's' : ''}: {childAges.map(a => `${a} year${a !== 1 ? 's' : ''}`).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Taxes */}
                  {taxes && taxes.taxes && taxes.taxes.length > 0 && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                      <strong>Excluded Taxes & Fees (payable locally):</strong>
                      {taxes.taxes.map((tax, tIdx) => (
                        <div key={tIdx} className="mt-1">
                          {tax.subType || tax.type || 'Tax'}: {tax.currency} {parseFloat(tax.amount).toFixed(2)}
                          {tax.clientAmount && ` (≈ ${tax.clientCurrency} ${parseFloat(tax.clientAmount).toFixed(2)})`}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rate Comments */}
                  {rateComments && (
                    <div className="mt-2 p-2.5 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-[11px] text-slate-700 leading-relaxed">
                      <strong className="text-blue-800">Rate Comments:</strong> {rateComments}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Guest Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Guest Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[9px] font-semibold tracking-widest uppercase text-gray-400 mb-1" style={{ letterSpacing: '0.12em' }}>Name</p>
                <p className="text-sm font-semibold text-gray-900">{primaryGuest.firstName} {primaryGuest.lastName}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[9px] font-semibold tracking-widest uppercase text-gray-400 mb-1" style={{ letterSpacing: '0.12em' }}>Email</p>
                <p className="text-sm font-semibold text-gray-900">{primaryGuest.email || '-'}</p>
              </div>
              {primaryGuest.phone && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-[9px] font-semibold tracking-widest uppercase text-gray-400 mb-1" style={{ letterSpacing: '0.12em' }}>Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{primaryGuest.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-green-600" strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Payment Summary</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Booking Amount ({bookingCurrency})</span>
                <span className="font-semibold text-gray-900">{bookingCurrency} {totalNetEUR.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Payable</span>
                <span className="text-lg font-bold text-gray-900">{displayTotal}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-500">Payment Method</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  <Building2 className="w-3 h-3" />
                  {paymentMethod === 'pay_on_site' ? 'Pay at Office' : 'Credit Card'}
                </span>
              </div>
            </div>
            {isReserved && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                Payment not yet received. Booking will be confirmed once payment is completed.
              </div>
            )}
          </div>

          {/* Supplier Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-gray-400" strokeWidth={1.8} />
              <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider" style={{ letterSpacing: '0.08em' }}>Supplier Information</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{supplierNotice}</p>
          </div>

          {/* Important Notice */}
          <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-2xl p-3.5 mb-4">
            <p className="text-xs text-orange-900 leading-relaxed">
              <strong>Important:</strong> Please present this voucher at check-in along with a valid photo ID. Check-in and check-out times are subject to hotel policy.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600">Telitrip — Your Travel Partner</p>
            <p className="text-[10px] text-gray-400 mt-1">Contact: customer@telitrip.com | www.telitrip.com</p>
            <p className="text-[10px] text-gray-400 mt-0.5">This voucher was generated on {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingVoucher;
