// ✅ HOTELBEDS BOOKING INTEGRATION EXAMPLE
// This shows how to integrate Hotelbeds booking API with both payment methods

import { useState } from 'react';
import hotelApi from './services/hotelApi';

export default function HotelBookingExample() {
  const [bookingData, setBookingData] = useState(null);
  const [rateKey, setRateKey] = useState('');

  // Step 1: After user selects a room, call checkRate
  const handleRoomSelection = async (selectedRoom) => {
    try {
      // Call checkRate to validate price and get fresh rateKey
      const checkRateResponse = await hotelApi.checkRates({
        rooms: [
          {
            rateKey: selectedRoom.rateKey
          }
        ]
      });

      // Store the validated rateKey (CRITICAL - expires in 1 minute!)
      const validatedRateKey = checkRateResponse.hotel.rooms[0].rates[0].rateKey;
      setRateKey(validatedRateKey);

      console.log('✅ RateKey validated:', validatedRateKey);
      
      // Show booking form to user
      showBookingForm();
      
    } catch (error) {
      console.error('❌ CheckRate failed:', error);
      alert('Failed to validate room availability. Please try again.');
    }
  };

  // Step 2: Build Hotelbeds booking request
  const buildHotelbedsBookingRequest = (formData) => {
    return {
      holder: {
        name: formData.firstName,
        surname: formData.lastName
      },
      rooms: [
        {
          rateKey: rateKey,  // ✅ From checkRate response
          paxes: [
            {
              roomId: 1,
              type: "AD",  // AD = Adult, CH = Child
              name: formData.firstName,
              surname: formData.lastName
            },
            // Add more guests if needed
            ...(formData.additionalGuests || []).map((guest, index) => ({
              roomId: 1,
              type: guest.type || "AD",
              name: guest.firstName,
              surname: guest.lastName
            }))
          ]
        }
      ],
      clientReference: `TELI_${Date.now()}`,
      remark: formData.specialRequests || "",
      tolerance: 2.00
    };
  };

  // Step 3A: Pay with Card (HBLPay)
  const handleCardPayment = async (formData) => {
    try {
      // Build Hotelbeds booking request
      const hotelbedsBookingRequest = buildHotelbedsBookingRequest(formData);

      // Prepare payment data
      const paymentData = {
        bookingData: {
          hotelName: formData.hotelName,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          nights: formData.nights,
          guests: {
            adults: formData.adults,
            children: formData.children
          },
          items: [
            {
              name: formData.roomName,
              price: formData.totalAmount,
              quantity: 1
            }
          ],
          
          // ✅ CRITICAL: Include Hotelbeds booking request
          hotelbedsBookingRequest: hotelbedsBookingRequest
        },
        userData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country || 'PK'
        },
        amount: formData.totalAmount,
        currency: "PKR",
        bookingId: `BOOKING_${Date.now()}`
      };

      console.log('📤 Initiating HBLPay payment with Hotelbeds booking request...');

      // Call HBLPay API
      const response = await hotelApi.initiateHBLPayPayment(paymentData);

      if (response.success) {
        console.log('✅ Payment session created:', response.sessionId);
        
        // Redirect user to HBL payment page
        window.location.href = response.paymentUrl;
      }

    } catch (error) {
      console.error('❌ Payment initiation failed:', error);
      handleBookingError(error);
    }
  };

  // Step 3B: Pay on Site
  const handlePayOnSite = async (formData) => {
    try {
      // Build Hotelbeds booking request
      const hotelbedsBookingRequest = buildHotelbedsBookingRequest(formData);

      // Prepare booking data
      const bookingData = {
        bookingData: {
          hotelName: formData.hotelName,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          nights: formData.nights,
          guests: {
            adults: formData.adults,
            children: formData.children
          },
          items: [
            {
              name: formData.roomName,
              price: formData.totalAmount,
              quantity: 1
            }
          ],
          
          // ✅ CRITICAL: Include Hotelbeds booking request
          hotelbedsBookingRequest: hotelbedsBookingRequest
        },
        userData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country || 'PK'
        },
        amount: formData.totalAmount,
        currency: "PKR",
        bookingId: `BOOKING_${Date.now()}`
      };

      console.log('📤 Creating Pay on Site booking with Hotelbeds...');

      // Call Pay on Site API
      const response = await hotelApi.createPayOnSiteBooking(bookingData);

      if (response.success) {
        console.log('✅ Booking confirmed with Hotelbeds!');
        console.log('📋 Hotelbeds Reference:', response.hotelbedsReference);
        
        // Show success message
        showBookingConfirmation({
          bookingReference: response.hotelbedsReference,
          message: response.message,
          instructions: response.instructions,
          bookingDetails: response.bookingDetails
        });
      }

    } catch (error) {
      console.error('❌ Booking failed:', error);
      handleBookingError(error);
    }
  };

  // Error handling
  const handleBookingError = (error) => {
    const errorMessage = error.message || error.toString();

    if (errorMessage.includes('no longer available')) {
      alert('This room is no longer available. Please search again.');
      redirectToSearch();
    } 
    else if (errorMessage.includes('Price has changed')) {
      alert('Room price has changed. Please search again for updated pricing.');
      redirectToSearch();
    }
    else if (errorMessage.includes('Invalid rateKey') || errorMessage.includes('expired')) {
      alert('Your session expired. Please search again.');
      redirectToSearch();
    }
    else {
      alert('Booking failed. Please try again or contact support.');
    }
  };

  // Success confirmation
  const showBookingConfirmation = (data) => {
    return (
      <div className="booking-confirmation">
        <h2>✅ Booking Confirmed!</h2>
        <p><strong>Booking Reference:</strong> {data.bookingReference}</p>
        <p>{data.message}</p>
        
        <div className="instructions">
          <h3>Important Instructions:</h3>
          <ul>
            {data.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>

        <div className="booking-details">
          <h3>Booking Details:</h3>
          <p><strong>Hotel:</strong> {data.bookingDetails.hotelName}</p>
          <p><strong>Check-in:</strong> {data.bookingDetails.checkIn}</p>
          <p><strong>Check-out:</strong> {data.bookingDetails.checkOut}</p>
          <p><strong>Guests:</strong> {data.bookingDetails.guests.adults} Adults, {data.bookingDetails.guests.children} Children</p>
        </div>

        <button onClick={() => window.location.href = '/dashboard'}>
          View in Dashboard
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Your booking form UI here */}
    </div>
  );
}

// ============================================================================
// COMPLETE EXAMPLE WITH FULL FLOW
// ============================================================================

export function CompleteBookingFlow() {
  const [searchResults, setSearchResults] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [validatedRateKey, setValidatedRateKey] = useState('');
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  // Step 1: Search hotels
  const searchHotels = async (searchParams) => {
    const results = await hotelApi.searchHotels(searchParams);
    setSearchResults(results);
  };

  // Step 2: User selects a room
  const selectRoom = async (room) => {
    setSelectedRoom(room);
    
    // Validate price with checkRate
    const checkRateResponse = await hotelApi.checkRates({
      rooms: [{ rateKey: room.rateKey }]
    });
    
    const freshRateKey = checkRateResponse.hotel.rooms[0].rates[0].rateKey;
    setValidatedRateKey(freshRateKey);
  };

  // Step 3: Submit booking
  const submitBooking = async (paymentMethod) => {
    // Build Hotelbeds booking request
    const hotelbedsBookingRequest = {
      holder: {
        name: bookingForm.firstName,
        surname: bookingForm.lastName
      },
      rooms: [
        {
          rateKey: validatedRateKey,  // ✅ Fresh rateKey from checkRate
          paxes: [
            {
              roomId: 1,
              type: "AD",
              name: bookingForm.firstName,
              surname: bookingForm.lastName
            }
          ]
        }
      ],
      clientReference: `TELI_${Date.now()}`,
      remark: bookingForm.specialRequests,
      tolerance: 2.00
    };

    const paymentData = {
      bookingData: {
        hotelName: selectedRoom.hotelName,
        checkIn: selectedRoom.checkIn,
        checkOut: selectedRoom.checkOut,
        items: [{ name: selectedRoom.name, price: selectedRoom.price }],
        hotelbedsBookingRequest: hotelbedsBookingRequest  // ✅ Include this
      },
      userData: bookingForm,
      amount: selectedRoom.price,
      currency: "PKR",
      bookingId: `BOOKING_${Date.now()}`
    };

    if (paymentMethod === 'card') {
      const response = await hotelApi.initiateHBLPayPayment(paymentData);
      window.location.href = response.paymentUrl;
    } else {
      const response = await hotelApi.createPayOnSiteBooking(paymentData);
      showConfirmation(response);
    }
  };

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}

// ============================================================================
// MINIMAL EXAMPLE
// ============================================================================

export async function quickBookingExample() {
  // 1. Get rateKey from checkRate
  const checkRateResponse = await hotelApi.checkRates({
    rooms: [{ rateKey: "YOUR_RATE_KEY" }]
  });
  const rateKey = checkRateResponse.hotel.rooms[0].rates[0].rateKey;

  // 2. Build booking request
  const hotelbedsBookingRequest = {
    holder: { name: "John", surname: "Doe" },
    rooms: [{
      rateKey: rateKey,
      paxes: [{ roomId: 1, type: "AD", name: "John", surname: "Doe" }]
    }],
    clientReference: `TELI_${Date.now()}`,
    remark: "",
    tolerance: 2.00
  };

  // 3. Book with Pay on Site
  const response = await hotelApi.createPayOnSiteBooking({
    bookingData: {
      hotelName: "Test Hotel",
      checkIn: "2024-02-01",
      checkOut: "2024-02-05",
      items: [{ name: "Room", price: 15000 }],
      hotelbedsBookingRequest: hotelbedsBookingRequest  // ✅ This is the key!
    },
    userData: {
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      phone: "+923001234567"
    },
    amount: 15000,
    currency: "PKR",
    bookingId: "TEST_123"
  });

  console.log('Hotelbeds Reference:', response.hotelbedsReference);
}
