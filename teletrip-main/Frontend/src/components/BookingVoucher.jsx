import React, { useRef, useState, useEffect } from 'react';
import { Printer } from 'lucide-react';

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
          if (data.success) {
            setPkrRate(data.data);
          }
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

  const handlePrint = () => {
    const printContent = voucherRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Voucher - ${booking.hotelBooking?.confirmationNumber || booking.bookingReference}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #1a73e8; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #1a73e8; margin: 0; font-size: 28px; }
            .header p { color: #666; margin: 5px 0 0; }
            .section { margin-bottom: 24px; }
            .section h3 { color: #1a73e8; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5; }
            .room-card { background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
            .room-card h4 { margin: 0 0 8px; font-size: 14px; }
            .rate-comments { background: #f0f7ff; border-left: 3px solid #1a73e8; padding: 10px 14px; margin-top: 10px; font-size: 11px; color: #555; line-height: 1.5; }
            .taxes-section { margin-top: 8px; padding: 8px 12px; background: #fffbeb; border-radius: 6px; font-size: 11px; }
            .supplier-notice { background: #f5f5f5; border: 1px solid #ddd; padding: 12px 16px; margin-top: 20px; font-size: 11px; line-height: 1.6; color: #444; }
            .important { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; margin-top: 20px; font-size: 12px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Data extraction
  const hb = booking.hotelBooking || {};
  const backup = booking.backup?.hotelbedsBookingData;
  const hbBooking = backup?.booking;
  const hbHotel = hbBooking?.hotel || {};
  const supplier = hb.supplier || hbHotel.supplier || hbBooking?.supplier;
  const invoiceCompany = hb.invoiceCompany || hbBooking?.invoiceCompany;
  
  // ⚠️ Critical: confirmationNumber must be the HOTELBEDS reference (148-XXXXXXX), not internal ref
  const hotelbedsRef = hb.confirmationNumber || hbBooking?.reference;
  const confirmationNumber = hotelbedsRef || booking.bookingReference;
  
  const rooms = hbHotel.rooms || hb.rooms || [];
  const primaryGuest = booking.guestInfo?.primaryGuest || {};
  const checkIn = hb.checkIn || booking.checkInDate;
  const checkOut = hb.checkOut || booking.checkOutDate;
  // Currency must be from Hotelbeds booking response (mandatory - do not convert)
  const bookingCurrency = hbBooking?.currency || hb.currency || booking.pricing?.currency || 'EUR';
  const categoryName = hb.categoryName || hbHotel.categoryName || '';
  const categoryCode = hb.categoryCode || hbHotel.categoryCode || '';
  const destinationName = hb.destinationName || hbHotel.destinationName || '';
  const zoneName = hb.zoneName || hbHotel.zoneName || '';
  const hotelName = hb.hotelName || hbHotel.name || 'Hotel';
  // Accommodation type from Content API (mandatory - must be property type like Hotel/Hostel/Apartment)
  const accommodationType = hb.accommodationType || hbHotel.accommodationType || 
    (categoryCode === '4EST' ? 'Hotel' : categoryCode === '5EST' ? 'Hotel' : categoryCode === '3EST' ? 'Hotel' : categoryCode === 'STD' ? 'Hotel' : 'Hotel');
  // Paid facilities (indFee=true) - mandatory display
  const paidFacilities = hb.paidFacilities || [];

  // Total in EUR from Hotelbeds
  const totalNetEUR = parseFloat(hbBooking?.totalNet) || parseFloat(hb.totalNet) || parseFloat(hbHotel?.totalNet) || parseFloat(booking.totalAmount) || 0;
  // Total in PKR from our pricing
  const totalPKR = booking.pricing?.totalAmount || 0;
  // Display amount: prefer PKR conversion from EUR, fallback to stored PKR
  const pkrConverted = formatPKR(totalNetEUR);
  const displayTotal = totalPKR > 100 ? `PKR ${Math.round(totalPKR).toLocaleString()}` : (pkrConverted || `PKR ${Math.round(totalNetEUR * 310).toLocaleString()}`);

  // Payment method
  const paymentMethod = booking.payment?.method || booking.paymentMethod ||
    (hb.rooms?.[0]?.paymentType === 'AT_HOTEL' || hbHotel.rooms?.[0]?.rates?.[0]?.paymentType === 'AT_HOTEL' ? 'pay_on_site' : 'card');

  // Address
  const addressParts = [hb.hotelAddress?.street, hb.hotelAddress?.fullAddress, zoneName, destinationName].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts[0] : (hb.hotelAddress?.city || '');

  // Supplier notice (mandatory per Hotelbeds)
  const supplierName = supplier?.name || invoiceCompany?.company || hbBooking?.invoiceCompany?.company || 'HOTELBEDS DMCC';
  const supplierVAT = supplier?.vatNumber || invoiceCompany?.registrationNumber || hbBooking?.invoiceCompany?.registrationNumber || '100035906500003';
  const supplierNotice = `Payable through ${supplierName}, acting as agent for the service operating company, details of which can be provided upon request. VAT: ${supplierVAT} Reference: ${confirmationNumber}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">Booking Voucher</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Close</button>
          </div>
        </div>

        <div ref={voucherRef} className="p-6">
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #1a73e8', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ color: '#1a73e8', margin: 0, fontSize: '28px' }}>Telitrip</h1>
            <p style={{ color: '#666', margin: '5px 0 0' }}>Booking Confirmation Voucher</p>
          </div>

          {/* Hotel Information */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#1a73e8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Hotel Information</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Hotel Name</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{hotelName}</span>
            </div>
            {categoryName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>Category</span>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{categoryName}</span>
              </div>
            )}
            {/* Accommodation Type from Content API (mandatory - actual property type like Hotel/Hostel/Apartment) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Accommodation Type</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{accommodationType}</span>
            </div>
            {fullAddress && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>Address</span>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{fullAddress}</span>
              </div>
            )}
            {(hb.hotelPhone || hbHotel.phones?.[0]?.phoneNumber) ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>Phone</span>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{hb.hotelPhone || hbHotel.phones?.[0]?.phoneNumber}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>Phone</span>
                <span style={{ fontWeight: 500, fontSize: '13px', color: '#999' }}>Contact hotel directly</span>
              </div>
            )}
            {destinationName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>Destination</span>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{destinationName}</span>
              </div>
            )}
          </div>

          {/* Paid Facilities Section - mandatory: show all facilities with extra charges (indFee=true) */}
          {paidFacilities && paidFacilities.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#e53e3e', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #fee2e2', paddingBottom: '8px' }}>
                ⚠ Facilities with Additional Charges (payable on-site)
              </h3>
              <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '12px' }}>
                <p style={{ fontSize: '11px', color: '#742a2a', marginBottom: '8px' }}>The following hotel facilities require additional payment directly at the property:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {paidFacilities.map((f, i) => (
                    <span key={i} style={{ fontSize: '11px', padding: '3px 8px', background: '#fed7d7', color: '#742a2a', borderRadius: '4px' }}>
                      {f.description}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#1a73e8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Booking Details</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Confirmation Number</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{confirmationNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Check-in</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{checkIn ? new Date(checkIn).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Check-out</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{checkOut ? new Date(checkOut).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Nights</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{hb.nights || 1}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Booking Currency</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{bookingCurrency}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Status</span>
              <span style={{ fontWeight: 600, fontSize: '13px', color: booking.status === 'confirmed' ? '#28a745' : '#f59e0b' }}>{booking.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}</span>
            </div>
          </div>

          {/* Room Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#1a73e8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Room Details</h3>
            {rooms.map((room, idx) => {
              const rate = room.rates?.[0] || room;
              const rateComments = rate.rateComments || room.rateComments || '';
              const taxes = rate.taxes || room.taxes;
              const childAges = room.childAges || room.paxes?.filter(p => p.type === 'CH').map(p => p.age) || [];
              const adults = rate.adults || room.adults || 1;
              const children = rate.children || room.children || 0;
              const netPrice = parseFloat(rate.net || room.netPrice || 0);
              const boardName = rate.boardName || room.boardName || 'Room Only';
              const payType = rate.paymentType || room.paymentType || '';

              return (
                <div key={idx} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>
                    {rooms.length > 1 ? `Room ${idx + 1}: ` : ''}{room.name || room.roomName || 'Standard Room'}
                  </h4>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>Board: {boardName}</p>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>
                    Guests: {adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
                  </p>
                  {childAges.length > 0 && (
                    <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>Children Ages: {childAges.join(', ')}</p>
                  )}
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#555', fontWeight: 500 }}>
                    Rate: {formatPKR(netPrice) || `PKR ${Math.round(netPrice * 310).toLocaleString()}`}
                    <span style={{ color: '#999', fontSize: '11px' }}> ({bookingCurrency} {netPrice.toFixed(2)})</span>
                  </p>
                  {payType && (
                    <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>
                      Payment: {paymentMethod === 'pay_on_site' ? 'Pay at Hotel/Office' : payType === 'AT_WEB' ? 'Prepaid' : payType === 'AT_HOTEL' ? 'Pay at Hotel' : payType}
                    </p>
                  )}

                  {/* Excluded Taxes */}
                  {taxes && taxes.taxes && taxes.taxes.length > 0 && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: '#fffbeb', borderRadius: '6px', fontSize: '11px' }}>
                      <strong>Excluded Taxes & Fees (payable locally):</strong>
                      {taxes.taxes.map((tax, tIdx) => (
                        <div key={tIdx} style={{ marginTop: '4px' }}>
                          {tax.subType || tax.type || 'Tax'}: {tax.currency} {parseFloat(tax.amount).toFixed(2)}
                          {tax.clientAmount && ` (≈ ${tax.clientCurrency} ${parseFloat(tax.clientAmount).toFixed(2)})`}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rate Comments - mandatory */}
                  {rateComments && (
                    <div style={{ background: '#f0f7ff', borderLeft: '3px solid #1a73e8', padding: '10px 14px', marginTop: '10px', fontSize: '11px', color: '#555', lineHeight: '1.5' }}>
                      <strong>Rate Comments:</strong><br />{rateComments}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Guest Information */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#1a73e8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Guest Information</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Name</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{primaryGuest.firstName} {primaryGuest.lastName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Email</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{primaryGuest.email}</span>
            </div>
            {primaryGuest.phone && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>Phone</span>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{primaryGuest.phone}</span>
              </div>
            )}
          </div>

          {/* Payment */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#1a73e8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Payment</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Total Amount</span>
              <span style={{ fontWeight: 600, fontSize: '15px', color: '#1a73e8' }}>{displayTotal}</span>
            </div>
            {totalNetEUR > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>Booking Amount ({bookingCurrency})</span>
                <span style={{ fontWeight: 500, fontSize: '13px', color: '#666' }}>{bookingCurrency} {totalNetEUR.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Payment Method</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{paymentMethod === 'pay_on_site' ? 'Pay at Hotel/Office' : 'Prepaid (Credit Card)'}</span>
            </div>
          </div>

          {/* Mandatory Supplier Notice */}
          <div style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 16px', marginTop: '20px', fontSize: '11px', lineHeight: '1.6', color: '#444' }}>
            {supplierNotice}
          </div>

          {/* Important Notice */}
          <div style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '12px 16px', marginTop: '16px', fontSize: '12px' }}>
            <strong>Important:</strong> Please present this voucher at check-in along with a valid photo ID. Check-in and check-out times are subject to hotel policy.
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', color: '#999', fontSize: '11px' }}>
            <p>Telitrip - Your Travel Partner</p>
            <p>Contact: customer@telitrip.com | www.telitrip.com</p>
            <p>This voucher was generated on {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingVoucher;
