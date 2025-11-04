import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hotelApi } from '../../services/hotelApi';
import { Loader2, MapPin, Calendar, Users, DollarSign, Phone, Mail } from 'lucide-react';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await hotelApi.getBookingDetails(bookingId);
      setBooking(response.data?.booking);
    } catch (error) {
      console.error('Failed to load booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{booking.hotel?.name}</h1>
            <p className="text-gray-600">Booking Reference: {booking.reference}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{booking.hotel?.destinationName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="font-medium">{new Date(booking.hotel?.checkIn).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="font-medium">{new Date(booking.hotel?.checkOut).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Rooms</p>
                <p className="font-medium">{booking.hotel?.rooms?.length || 1} Room(s)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium text-lg">{booking.currency} {booking.totalNet}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Guest Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{booking.holder?.name} {booking.holder?.surname}</span>
            </div>
          </div>
        </div>

        {booking.hotel?.rooms && (
          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-4">Room Details</h3>
            {booking.hotel.rooms.map((room, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="font-medium">{room.name}</p>
                <p className="text-sm text-gray-600">Room Code: {room.code}</p>
                {room.rates && room.rates[0] && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Board: {room.rates[0].boardName}</p>
                    <p className="text-sm font-medium text-blue-600">{booking.currency} {room.rates[0].net}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {booking.remark && (
          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-2">Special Requests</h3>
            <p className="text-gray-600">{booking.remark}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
