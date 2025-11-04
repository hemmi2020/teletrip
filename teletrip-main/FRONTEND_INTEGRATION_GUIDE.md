# 🎨 Frontend Integration Guide - Hotelbeds Booking

## 🎯 What You Need to Do

The backend now calls Hotelbeds API to make **real hotel bookings**. You need to pass the complete Hotelbeds booking request from the frontend.

---

## 📋 Required Changes

### 1. **Store rateKey from checkRate Response**

When user selects a room, you call `POST /checkrates`. Store the **entire rateKey** from the response:

```javascript
// After checkRate API call
const checkRateResponse = await hotelApi.checkRates(checkRateData);

// Store this rateKey - YOU NEED IT FOR BOOKING!
const rateKey = checkRateResponse.hotel.rooms[0].rates[0].rateKey;

// Example rateKey (very long string):
// "20240115|20240120|W|256|123456|DBL.ST|ID_B2B_48|RO|AllInclusive~1~2~~N@07~~2563cf~~2263cf~-1876046556~10~~0~3710000000"
```

⚠️ **IMPORTANT**: RateKey expires in **1 minute**. User must complete booking quickly!

---

### 2. **Build hotelbedsBookingRequest Object**

Before calling payment API, build the Hotelbeds booking request:

```javascript
const hotelbedsBookingRequest = {
  holder: {
    name: userData.firstName,
    surname: userData.lastName,
    email: userData.email,
    phone: userData.phone  // Format: +1234567890
  },
  rooms: [
    {
      rateKey: rateKey,  // ✅ From checkRate response
      paxes: [
        {
          roomId: 1,
          type: "AD",  // AD = Adult, CH = Child
          name: userData.firstName,
          surname: userData.lastName
        },
        // Add more guests if needed
        {
          roomId: 1,
          type: "AD",
          name: additionalGuest.firstName,
          surname: additionalGuest.lastName
        }
      ]
    }
  ],
  clientReference: `BOOKING_${Date.now()}`,  // Your unique reference
  remark: specialRequests || "",  // Optional special requests
  tolerance: 2.00  // Optional price tolerance (2%)
};
```

---

### 3. **Update HBLPay Payment Call**

```javascript
// When user clicks "Pay with Card"
const paymentData = {
  bookingData: {
    hotelName: selectedHotel.name,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    nights: numberOfNights,
    guests: {
      adults: searchParams.adults,
      children: searchParams.children
    },
    items: [
      {
        name: selectedRoom.name,
        price: selectedRoom.price,
        quantity: 1
      }
    ],
    
    // ✅ ADD THIS - Hotelbeds booking request
    hotelbedsBookingRequest: hotelbedsBookingRequest
  },
  userData: {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    address: form.address,
    city: form.city,
    country: form.country
  },
  amount: totalAmount,
  currency: "PKR",
  bookingId: bookingId  // Your local booking ID
};

// Call HBLPay API
const response = await hotelApi.initiateHBLPayPayment(paymentData);
```

---

### 4. **Update Pay on Site Call**

```javascript
// When user clicks "Pay on Site"
const payOnSiteData = {
  bookingData: {
    hotelName: selectedHotel.name,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    items: [...],
    
    // ✅ ADD THIS - Hotelbeds booking request
    hotelbedsBookingRequest: hotelbedsBookingRequest
  },
  userData: { ... },
  amount: totalAmount,
  currency: "PKR",
  bookingId: `HOTELBEDS_${Date.now()}`  // Can be any unique ID
};

// Call Pay on Site API
const response = await hotelApi.createPayOnSiteBooking(payOnSiteData);

// Response will include:
// - hotelbedsReference: "1-3816248" (Hotelbeds booking reference)
// - status: "confirmed"
// - message: "Booking confirmed with hotel!"
```

---

## 🔍 Complete Example

```javascript
// Step 1: User searches hotels
const searchResults = await hotelApi.searchHotels(searchParams);

// Step 2: User selects a room and clicks "Book Now"
const selectedRoom = searchResults.hotels[0].rooms[0];

// Step 3: Call checkRate to validate price and get rateKey
const checkRateData = {
  rooms: [
    {
      rateKey: selectedRoom.rates[0].rateKey
    }
  ]
};

const checkRateResponse = await hotelApi.checkRates(checkRateData);
const validatedRateKey = checkRateResponse.hotel.rooms[0].rates[0].rateKey;

// Step 4: User fills booking form
const bookingForm = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+923001234567",
  specialRequests: "Late check-in please"
};

// Step 5: Build Hotelbeds booking request
const hotelbedsBookingRequest = {
  holder: {
    name: bookingForm.firstName,
    surname: bookingForm.lastName,
    email: bookingForm.email,
    phone: bookingForm.phone
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

// Step 6: Choose payment method

// Option A: HBLPay (Card Payment)
if (paymentMethod === "card") {
  const paymentData = {
    bookingData: {
      hotelName: selectedRoom.hotelName,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      items: [{ name: selectedRoom.name, price: selectedRoom.price }],
      hotelbedsBookingRequest: hotelbedsBookingRequest  // ✅
    },
    userData: bookingForm,
    amount: selectedRoom.price,
    currency: "PKR",
    bookingId: `BOOKING_${Date.now()}`
  };
  
  const response = await hotelApi.initiateHBLPayPayment(paymentData);
  // Redirect user to response.paymentUrl
  window.location.href = response.paymentUrl;
}

// Option B: Pay on Site
if (paymentMethod === "pay_on_site") {
  const payOnSiteData = {
    bookingData: {
      hotelName: selectedRoom.hotelName,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      items: [{ name: selectedRoom.name, price: selectedRoom.price }],
      hotelbedsBookingRequest: hotelbedsBookingRequest  // ✅
    },
    userData: bookingForm,
    amount: selectedRoom.price,
    currency: "PKR",
    bookingId: `BOOKING_${Date.now()}`
  };
  
  const response = await hotelApi.createPayOnSiteBooking(payOnSiteData);
  
  // Show success message with Hotelbeds reference
  showSuccessMessage({
    bookingReference: response.hotelbedsReference,
    message: response.message,
    instructions: response.instructions
  });
}
```

---

## ⚠️ Error Handling

### Handle Hotelbeds Errors:

```javascript
try {
  const response = await hotelApi.createPayOnSiteBooking(payOnSiteData);
  
  if (response.success) {
    // Show success
    showBookingConfirmation(response);
  }
  
} catch (error) {
  // Handle specific errors
  if (error.message.includes("no longer available")) {
    showError("This room is no longer available. Please search again.");
    redirectToSearch();
  } 
  else if (error.message.includes("Price has changed")) {
    showError("Room price has changed. Please search again for updated pricing.");
    redirectToSearch();
  }
  else if (error.message.includes("Invalid rateKey")) {
    showError("Your session expired. Please search again.");
    redirectToSearch();
  }
  else {
    showError("Booking failed. Please try again or contact support.");
  }
}
```

---

## 📊 Response Format

### Successful Booking Response:

```javascript
{
  success: true,
  bookingReference: "1-3816248",  // Hotelbeds reference
  hotelbedsReference: "1-3816248",
  paymentId: "PAY_123",
  orderId: "ORD_456",
  amount: 15000,
  currency: "PKR",
  paymentMethod: "pay_on_site",
  status: "confirmed",
  message: "Booking confirmed with hotel! Payment will be collected on site.",
  instructions: [
    "Your booking is confirmed",
    "Payment will be collected when you arrive",
    "Please bring a valid ID and payment method",
    "You can view this booking in your dashboard"
  ],
  bookingDetails: {
    hotelName: "Grand Hotel",
    checkIn: "2024-02-01",
    checkOut: "2024-02-05",
    guests: { adults: 2, children: 0 }
  }
}
```

---

## ✅ Checklist

Before testing:

- [ ] Store rateKey from checkRate response
- [ ] Build hotelbedsBookingRequest with all required fields
- [ ] Include hotelbedsBookingRequest in bookingData
- [ ] Handle "room no longer available" error
- [ ] Handle "price changed" error
- [ ] Handle "rateKey expired" error
- [ ] Display Hotelbeds booking reference to user
- [ ] Test both HBLPay and Pay on Site flows

---

## 🧪 Testing

### Test Data:

```javascript
// Test booking request
const testBookingRequest = {
  holder: {
    name: "Test",
    surname: "User",
    email: "test@example.com",
    phone: "+923001234567"
  },
  rooms: [
    {
      rateKey: "YOUR_RATE_KEY_FROM_CHECKRATE",
      paxes: [
        {
          roomId: 1,
          type: "AD",
          name: "Test",
          surname: "User"
        }
      ]
    }
  ],
  clientReference: "TEST_BOOKING_123",
  remark: "Test booking",
  tolerance: 2.00
};
```

---

## 📞 Support

If you encounter issues:

1. **Check rateKey** - Must be fresh (< 1 minute old)
2. **Check phone format** - Must include country code (+92...)
3. **Check paxes count** - Must match room occupancy
4. **Check logs** - Look for `[HOTELBEDS]` entries in backend logs

---

## 🎯 Summary

**What changed**: Backend now calls Hotelbeds API to make real bookings

**What you need to do**: Pass `hotelbedsBookingRequest` in `bookingData`

**Critical field**: `rateKey` from checkRate response (expires in 1 minute)

**Result**: Users get real Hotelbeds booking references

---

**Status**: Ready for frontend integration ✅
