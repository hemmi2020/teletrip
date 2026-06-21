import React, { useRef } from 'react';
import { Printer } from 'lucide-react';

const BookingVoucher = ({ booking, onClose }) => {
  const voucherRef = useRef(null);

  const handlePrint = () => {
    const printContent = voucherRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Voucher - ${booking.bookingReference || booking.hotelBooking?.confirmationNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #1a73e8; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #1a73e8; margin: 0; font-size: 28px; }
            .header p { color: #666; margin: 5px 0 0; }
            .section { margin-bottom: 24px; }
            .section h3 { color: #1a73e8; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5; }
            .detail-row .label { color: #666; font-size: 13px; }
            .detail-row .value { font-weight: 600; font-size: 13px; }
            .room-card { background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
            .room-card h4 { margin: 0 0 8px; font-size: 14px; }
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

  const confirmationNumber = booking.hotelBooking?.confirmationNumber || booking.bookingReference;
  const rooms = booking.hotelBooking?.rooms || [];
  const primaryGuest = booking.guestInfo?.primaryGuest || {};
  const checkIn = booking.hotelBooking?.checkIn || booking.checkInDate;
  const checkOut = booking.hotelBooking?.checkOut || booking.checkOutDate;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Actions */}
        <div className="sticky top-0 bg-white border-b px-6 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">Booking Voucher</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Close</button>
          </div>
        </div>

        {/* Voucher Content */}
        <div ref={voucherRef} className="p-6">
          <div className="header" style={{ textAlign: 'center', borderBottom: '2px solid #1a73e8', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ color: '#1a73e8', margin: 0, fontSize: '28px' }}>Telitrip</h1>
            <p style={{ color: '#666', margin: '5px 0 0' }}>Booking Confirmation Voucher</p>
          </div>

          <div className="section" style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#1a73e8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Booking Details</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Confirmation Number</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{confirmationNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Hotel</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{booking.hotelBooking?.hotelName || 'Hotel'}</span>
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
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{booking.hotelBooking?.nights || 1}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Status</span>
              <span style={{ fontWeight: 600, fontSize: '13px', color: booking.status === 'confirmed' ? '#28a745' : '#f59e0b' }}>{booking.status === 'confirmed' ? 'CONFIRMED' : 'PENDING PAYMENT'}</span>
            </div>
          </div>

          <div className="section" style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#1a73e8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Room Details</h3>
            {rooms.map((room, idx) => (
              <div key={idx} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>{rooms.length > 1 ? `Room ${idx + 1}: ` : ''}{room.roomName || 'Standard Room'}</h4>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>Board: {room.boardName || 'Room Only'}</p>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>Guests: {room.adults || 0} Adult{(room.adults || 0) !== 1 ? 's' : ''}{room.children > 0 ? `, ${room.children} Child${room.children !== 1 ? 'ren' : ''}` : ''}</p>
              </div>
            ))}
          </div>

          <div className="section" style={{ marginBottom: '24px' }}>
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

          <div className="section" style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#1a73e8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Payment</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Total Amount</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{booking.pricing?.currency || 'EUR'} {booking.pricing?.totalAmount?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>Payment Method</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{booking.payment?.method === 'pay_on_site' ? 'Pay at Office' : 'Credit Card'}</span>
            </div>
          </div>

          <div style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '12px 16px', marginTop: '20px', fontSize: '12px' }}>
            <strong>Important:</strong> Please present this voucher at check-in along with a valid photo ID. Check-in and check-out times are subject to hotel policy.
          </div>

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
