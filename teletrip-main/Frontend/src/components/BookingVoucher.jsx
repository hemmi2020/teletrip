import React, { useRef, useState, useEffect } from 'react';
import { Printer, MapPin, Phone, Mail, Calendar, Users, CreditCard, AlertTriangle, Building2, BedDouble, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';

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

  const handlePrint = () => {
    const printContent = voucherRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Voucher - ${booking.hotelBooking?.confirmationNumber || booking.bookingReference}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            * { box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 0; margin: 0; color: #1f2937; font-size: 13px;
              line-height: 1.5; background: #fff;
            }
            .voucher-container { max-width: 800px; margin: 0 auto; padding: 24px; }
            .voucher-header {
              display: flex; justify-content: space-between; align-items: center;
              border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;
            }
            .voucher-header-left h1 { margin: 0; font-size: 26px; color: #0f172a; letter-spacing: -0.5px; }
            .voucher-header-left p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
            .voucher-header-right { text-align: right; }
            .voucher-header-right .conf-label { font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
            .voucher-header-right .conf-number { font-size: 18px; font-weight: 700; color: #0f172a; font-family: monospace; }
            .status-banner {
              padding: 8px 14px; border-radius: 6px; margin-bottom: 16px;
              font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
              display: flex; align-items: center; gap: 8px;
            }
            .status-confirmed { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
            .status-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .status-cancelled { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
            .section { margin-bottom: 20px; page-break-inside: avoid; }
            .section-title {
              font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
              color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;
            }
            .two-col { display: flex; gap: 24px; }
            .two-col > div { flex: 1; }
            .detail-table { width: 100%; border-collapse: collapse; }
            .detail-table td { padding: 6px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
            .detail-table td:first-child { color: #64748b; width: 40%; font-size: 12px; }
            .detail-table td:last-child { font-weight: 600; color: #0f172a; text-align: right; font-size: 12px; }
            .room-card {
              border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 10px;
              background: #f8fafc; page-break-inside: avoid;
            }
            .room-card-header {
              display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;
            }
            .room-card-header h4 { margin: 0; font-size: 13px; color: #0f172a; }
            .room-price-block { text-align: right; }
            .room-price-block .total { font-weight: 700; color: #0f172a; font-size: 15px; }
            .room-price-block .per-night { font-size: 10px; color: #64748b; }
            .room-price-block .pkr { font-size: 11px; color: #059669; font-weight: 600; }
            .room-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 11px; color: #475569; margin-bottom: 8px; }
            .room-meta span { display: flex; align-items: center; gap: 4px; }
            .pax-block {
              background: #fff; border: 1px solid #e2e8f0; border-radius: 6px;
              padding: 8px 12px; margin-top: 8px;
            }
            .pax-block .pax-title { font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px; }
            .pax-block .pax-row { font-size: 12px; color: #334155; }
            .child-ages { font-size: 11px; color: #92400e; margin-top: 2px; font-weight: 500; }
            .rate-comments {
              background: #eff6ff; border-left: 3px solid #3b82f6; padding: 8px 12px;
              margin-top: 10px; font-size: 11px; color: #334155; line-height: 1.5; border-radius: 0 4px 4px 0;
            }
            .taxes-box {
              margin-top: 8px; padding: 8px 12px; background: #fffbeb; border: 1px solid #fde68a;
              border-radius: 6px; font-size: 11px; color: #713f12;
            }
            .paid-facilities-box {
              background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;
              padding: 10px 12px; margin-bottom: 20px; page-break-inside: avoid;
            }
            .paid-facilities-box h4 { margin: 0 0 6px; font-size: 11px; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; }
            .paid-facilities-box p { margin: 0; font-size: 11px; color: #7f1d1d; }
            .facility-tag {
              display: inline-block; padding: 2px 8px; background: #fee2e2; color: #991b1b;
              border-radius: 4px; font-size: 10px; margin: 4px 4px 0 0;
            }
            .no-facilities {
              background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;
              padding: 10px 12px; margin-bottom: 20px; page-break-inside: avoid;
              display: flex; align-items: center; gap: 8px;
            }
            .no-facilities span { font-size: 11px; color: #166534; font-weight: 500; }
            .supplier-notice {
              background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px;
              padding: 12px; margin-top: 16px; font-size: 10px; line-height: 1.6; color: #334155;
            }
            .important-notice {
              background: #fff7ed; border-left: 4px solid #f97316; padding: 10px 14px;
              margin-top: 14px; font-size: 11px; color: #7c2d12; border-radius: 0 4px 4px 0;
            }
            .voucher-footer {
              text-align: center; margin-top: 32px; padding-top: 16px;
              border-top: 2px solid #e2e8f0; color: #94a3b8; font-size: 10px;
            }
            .payment-summary {
              background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
              padding: 14px; margin-bottom: 16px;
            }
            .payment-summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
            .payment-summary-row.total { font-size: 14px; font-weight: 700; color: #0f172a; border-top: 1px solid #bbf7d0; margin-top: 6px; padding-top: 6px; }
            @media print {
              body { padding: 0; }
              .voucher-container { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body><div class="voucher-container">${printContent}</div></body>
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

  // Confirmation number: prefer Hotelbeds reference
  const hotelbedsRef = hb.confirmationNumber || hbBooking?.reference || booking.hotelBooking?.hotelbedsReference || '';
  const confirmationNumber = hotelbedsRef || booking.bookingReference;

  // Prefer stored booking room data over Hotelbeds response
  const rooms = hb.rooms || hbHotel.rooms || hbBooking?.hotel?.rooms || [];
  const primaryGuest = booking.guestInfo?.primaryGuest || {};
  const checkIn = hb.checkIn || booking.checkInDate;
  const checkOut = hb.checkOut || booking.checkOutDate;
  const nights = hb.nights || 1;

  // Currency (mandatory per Hotelbeds certification)
  const bookingCurrency = hbBooking?.currency || hb.currency || booking.pricing?.currency || 'EUR';

  const categoryName = hb.categoryName || hbHotel.categoryName || '';
  const categoryCode = hb.categoryCode || hbHotel.categoryCode || '';
  const destinationName = hb.destinationName || hbHotel.destinationName || '';
  const zoneName = hb.zoneName || hbHotel.zoneName || '';
  const hotelName = hb.hotelName || hbHotel.name || 'Hotel';
  const accommodationType = hb.accommodationType || hbHotel.accommodationType ||
    (categoryCode === '4EST' ? '4 Star Hotel' : categoryCode === '5EST' ? '5 Star Hotel' : categoryCode === '3EST' ? '3 Star Hotel' : categoryCode === 'STD' ? 'Standard Hotel' : 'Hotel');

  // Paid facilities (mandatory per Hotelbeds certification)
  const paidFacilities = hb.paidFacilities || [];

  // Phone (mandatory per Hotelbeds certification)
  const hotelPhone = hb.hotelPhone || hbHotel.phones?.[0]?.phoneNumber || hbBooking?.hotel?.phones?.[0]?.phoneNumber || '';

  // Address
  const addressParts = [hb.hotelAddress?.street, hb.hotelAddress?.fullAddress, zoneName, destinationName].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts[0] : (hb.hotelAddress?.city || zoneName || destinationName || '');

  // Totals
  const totalNetEUR = parseFloat(hbBooking?.totalNet) || parseFloat(hb.totalNet) || parseFloat(hbHotel?.totalNet) || rooms.reduce((sum, r) => sum + parseFloat(r.netPrice || r.sellingPrice || 0), 0);
  const totalPKR = booking.pricing?.totalAmount || 0;
  const pkrConverted = formatPKR(totalNetEUR);
  const displayTotal = totalPKR > 100 ? `PKR ${Math.round(totalPKR).toLocaleString()}` : (pkrConverted || `PKR ${Math.round(totalNetEUR * 310).toLocaleString()}`);

  // Payment method
  const paymentMethod = booking.payment?.method || booking.paymentMethod ||
    (hb.rooms?.[0]?.paymentType === 'AT_HOTEL' ? 'pay_on_site' : 'card');

  // Supplier notice (mandatory per Hotelbeds certification)
  const supplierName = supplier?.name || invoiceCompany?.company || hbBooking?.invoiceCompany?.company || 'HOTELBEDS DMCC';
  const supplierVAT = supplier?.vatNumber || invoiceCompany?.registrationNumber || hbBooking?.invoiceCompany?.registrationNumber || '100035906500003';
  const supplierNotice = `Payable through ${supplierName}, acting as agent for the service operating company, details of which can be provided upon request. VAT: ${supplierVAT} Reference: ${confirmationNumber}`;

  // Status logic
  const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';
  const isReserved = booking.status === 'pending' && paymentMethod === 'pay_on_site';
  const statusLabel = isCancelled ? 'Cancelled' : isConfirmed ? 'Confirmed' : isReserved ? 'Reserved — Payment Pending' : 'Pending';
  const statusColor = isCancelled ? 'bg-red-100 text-red-700' : isConfirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-3 flex items-center justify-between z-10 no-print">
          <h2 className="text-lg font-semibold text-gray-900">Booking Voucher</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Close</button>
          </div>
        </div>

        {/* Voucher Content */}
        <div ref={voucherRef} className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-start border-b-[3px] border-slate-900 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Telitrip</h1>
              <p className="text-xs text-slate-500 mt-1">Booking Confirmation Voucher</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-500 tracking-wider">Confirmation #</div>
              <div className="text-lg font-bold text-slate-900 font-mono">{confirmationNumber}</div>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Status Banner */}
          {isReserved && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800 font-medium">
                This booking is RESERVED. Payment must be completed at the Telitrip office before check-in. The room will be confirmed with the hotel once payment is received.
              </p>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Hotel Info */}
            <div className="flex-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5 mb-3">Hotel Information</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500 text-xs w-2/5">Hotel Name</td>
                    <td className="py-1.5 font-semibold text-slate-900 text-right">{hotelName}</td>
                  </tr>
                  {categoryName && (
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-500 text-xs">Category</td>
                      <td className="py-1.5 font-semibold text-slate-900 text-right">{categoryName}</td>
                    </tr>
                  )}
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500 text-xs">Accommodation Type</td>
                    <td className="py-1.5 font-semibold text-slate-900 text-right">{accommodationType}</td>
                  </tr>
                  {fullAddress && (
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-500 text-xs">Address</td>
                      <td className="py-1.5 font-semibold text-slate-900 text-right">{fullAddress}</td>
                    </tr>
                  )}
                  {hotelPhone && (
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-500 text-xs">Phone</td>
                      <td className="py-1.5 font-semibold text-slate-900 text-right">{hotelPhone}</td>
                    </tr>
                  )}
                  {destinationName && (
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-500 text-xs">Destination</td>
                      <td className="py-1.5 font-semibold text-slate-900 text-right">{destinationName}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Booking Details */}
            <div className="flex-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5 mb-3">Booking Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500 text-xs w-2/5">Check-in</td>
                    <td className="py-1.5 font-semibold text-slate-900 text-right">{fmtDate(checkIn)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500 text-xs">Check-out</td>
                    <td className="py-1.5 font-semibold text-slate-900 text-right">{fmtDate(checkOut)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500 text-xs">Nights</td>
                    <td className="py-1.5 font-semibold text-slate-900 text-right">{nights}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500 text-xs">Booking Currency</td>
                    <td className="py-1.5 font-semibold text-slate-900 text-right">{bookingCurrency}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500 text-xs">Payment</td>
                    <td className="py-1.5 font-semibold text-slate-900 text-right">
                      {paymentMethod === 'pay_on_site' ? 'Pay at Hotel/Office' : 'Prepaid (Credit Card)'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Paid Facilities - Mandatory */}
          {paidFacilities.length > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              <h4 className="text-[11px] font-bold uppercase text-red-800 tracking-wider mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Facilities with Additional Charges
              </h4>
              <p className="text-[11px] text-red-700 mb-2">The following facilities require extra payment directly at the property:</p>
              <div className="flex flex-wrap gap-1.5">
                {paidFacilities.map((f, i) => (
                  <span key={i} className="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-[10px] rounded font-medium">
                    {f.description}{f.roomName ? ` (${f.roomName})` : ''}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-[11px] text-green-800 font-medium">
                All facilities included in this rate are complimentary. No additional charges apply.
              </p>
            </div>
          )}

          {/* Room Details */}
          <div className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5 mb-3">Room Details</h3>
            {rooms.map((room, idx) => {
              // Prefer stored room data directly (most accurate)
              const adults = room.adults || 1;
              const children = room.children || 0;
              const childAges = room.childAges || [];
              const netPrice = parseFloat(room.netPrice || room.sellingPrice || 0);
              const boardName = room.boardName || 'Room Only';
              const rateComments = room.rateComments || '';
              const taxes = room.taxes;
              const roomName = room.roomName || room.name || `Room ${idx + 1}`;
              const perNight = nights > 0 ? netPrice / nights : netPrice;

              return (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 mb-3 bg-slate-50">
                  {/* Room header with name and price */}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {rooms.length > 1 ? `Room ${idx + 1}: ` : ''}{roomName}
                    </h4>
                    <div className="text-right">
                      <div className="text-[15px] font-bold text-slate-900">
                        {bookingCurrency} {netPrice.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {nights} night{nights !== 1 ? 's' : ''} × {bookingCurrency} {perNight.toFixed(2)} / night
                      </div>
                      {formatPKR(netPrice) && (
                        <div className="text-[11px] text-green-700 font-semibold mt-0.5">
                          {formatPKR(netPrice)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Board and basic meta */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mb-2">
                    <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {boardName}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Pax block - prominently displayed */}
                  <div className="bg-white border border-slate-200 rounded-md p-2.5 mt-2">
                    <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-1">Occupancy</div>
                    <div className="text-xs text-slate-800">
                      <span className="font-semibold">{adults}</span> Adult{adults !== 1 ? 's' : ''}
                      {children > 0 && (
                        <>, <span className="font-semibold">{children}</span> Child{children !== 1 ? 'ren' : ''}</>
                      )}
                    </div>
                    {childAges.length > 0 && (
                      <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Child Age{childAges.length !== 1 ? 's' : ''}: {childAges.map(a => `${a} year${a !== 1 ? 's' : ''}`).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Taxes */}
                  {taxes && taxes.taxes && taxes.taxes.length > 0 && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900">
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
                    <div className="mt-2 p-2.5 bg-blue-50 border-l-4 border-blue-500 rounded-r-md text-[11px] text-slate-700 leading-relaxed">
                      <strong className="text-blue-800">Rate Comments:</strong> {rateComments}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Guest Information */}
          <div className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5 mb-3">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-0.5">Name</div>
                <div className="text-sm font-semibold text-slate-900">{primaryGuest.firstName} {primaryGuest.lastName}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-0.5">Email</div>
                <div className="text-sm font-semibold text-slate-900">{primaryGuest.email || '-'}</div>
              </div>
              {primaryGuest.phone && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-0.5">Phone</div>
                  <div className="text-sm font-semibold text-slate-900">{primaryGuest.phone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-green-900 border-b border-green-200 pb-1.5 mb-2">Payment Summary</h3>
            <div className="flex justify-between items-center py-1 text-sm">
              <span className="text-slate-600">Total Amount (PKR)</span>
              <span className="text-lg font-bold text-slate-900">{displayTotal}</span>
            </div>
            {totalNetEUR > 0 && (
              <div className="flex justify-between items-center py-1 text-xs text-slate-500">
                <span>Booking Amount ({bookingCurrency})</span>
                <span>{bookingCurrency} {totalNetEUR.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1 text-xs text-slate-500">
              <span>Payment Method</span>
              <span className="font-medium text-slate-700">{paymentMethod === 'pay_on_site' ? 'Pay at Hotel/Office' : 'Prepaid (Credit Card)'}</span>
            </div>
            {isReserved && (
              <div className="mt-2 p-2 bg-amber-100 border border-amber-300 rounded text-[11px] text-amber-900 font-medium">
                ⚠ Payment not yet received. Booking will be confirmed once payment is completed.
              </div>
            )}
          </div>

          {/* Supplier Notice - Mandatory */}
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-[11px] text-slate-600 leading-relaxed">
            {supplierNotice}
          </div>

          {/* Important Notice */}
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-3 mt-3 text-[11px] text-orange-900">
            <strong>Important:</strong> Please present this voucher at check-in along with a valid photo ID. Check-in and check-out times are subject to hotel policy.
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-4 border-t-2 border-slate-200 text-[10px] text-slate-400">
            <p className="font-semibold text-slate-500">Telitrip - Your Travel Partner</p>
            <p>Contact: customer@telitrip.com | www.telitrip.com</p>
            <p>This voucher was generated on {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingVoucher;
