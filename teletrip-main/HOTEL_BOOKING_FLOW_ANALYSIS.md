# 🏨 Hotel Booking Flow Analysis & Implementation Guide

**Date:** January 2025  
**Purpose:** Verify and implement correct Hotelbeds Hotel Booking API flow  
**Documentation Reference:** transfers.txt (Hotelbeds Hotel Booking API)

---

## 📋 HOTELBEDS BOOKING API - OFFICIAL FLOW

According to Hotelbeds documentation, the booking process follows these steps:

### **Standard 2-Step Booking Process:**
1. **Availability Request** (`/hotels`) - Search for hotels
2. **Booking Request** (`/bookings`) - Confirm the booking

### **3-Step Booking Process (for RECHECK rates):**
1. **Availability Request** (`/hotels`) - Search for hotels
2. **CheckRate Request** (`/checkrates`) - Re-evaluate pricing (for rates with "RECHECK" tag)
3. **Booking Request** (`/bookings`) - Confirm the booking

---

## 🔍 CURRENT IMPLEMENTATION ANALYSIS

### ✅ **What We Have Implemented:**

#### 1. **Availability/Search** (`/hotels/search` and `/hotels/search-auth`)
- **Location:** `Backend/routes/hotel.route.js`
- **Status:** ✅ CORRECTLY IMPLEMENTED
- **API Endpoint:** `POST https://api.test.hotelbeds.com/hotel-api/1.0/hotels`
- **Features:**
  - Proper authentication (Api-key, X-Signature)
  - Request body forwarding
  - Image enhancement with Content API
  - Amenities mapping

```javascript
// Current implementation in hotel.route.js
router.post('/hotels/search', async (req, res) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/hotels`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Api-key': HOTELBEDS_API_KEY,
            'X-Signature': signature,
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip'
        },
        body: JSON.stringify(req.body)
    });
    // ... response handling
});
```

**✅ This is CORRECT** - Matches Hotelbeds documentation

---

#### 2. **Booking Creation** (`/bookings/create`)
- **Location:** `Backend/controllers/booking.controller.js`
- **Status:** ❌ **MISSING HOTELBEDS API CALL**
- **Current Behavior:** Only saves to local database
- **Required:** Must call Hotelbeds Booking API

**❌ CRITICAL ISSUE:** We are NOT calling Hotelbeds `/bookings` API endpoint!

---

### ❌ **What We Are MISSING:**

#### 1. **CheckRate API** (for RECHECK rates)
- **API Endpoint:** `POST https://api.test.hotelbeds.com/hotel-api/1.0/checkrates`
- **Purpose:** Re-validate pricing before booking
- **When to use:** When `rateType === "RECHECK"`
- **Status:** ❌ NOT IMPLEMENTED

#### 2. **Hotelbeds Booking Confirmation API**
- **API Endpoint:** `POST https://api.test.hotelbeds.com/hotel-api/1.0/bookings`
- **Purpose:** Actually book the hotel with Hotelbeds
- **Status:** ❌ NOT IMPLEMENTED

#### 3. **Booking Retrieval from Hotelbeds**
- **API Endpoint:** `GET https://api.test.hotelbeds.com/hotel-api/1.0/bookings/{bookingId}`
- **Purpose:** Get booking details from Hotelbeds
- **Status:** ❌ NOT IMPLEMENTED

#### 4. **Booking Cancellation with Hotelbeds**
- **API Endpoint:** `DELETE https://api.test.hotelbeds.com/hotel-api/1.0/bookings/{bookingId}`
- **Purpose:** Cancel booking with Hotelbeds
- **Status:** ❌ NOT IMPLEMENTED

---

## 🎯 REQUIRED IMPLEMENTATION - STEP BY STEP

### **STEP 1: Implement CheckRate API** (Optional but Recommended)

**Purpose:** Validate rate before booking (required for RECHECK rates)

**Create:** `Backend/routes/hotel.route.js` - Add new endpoint

```javascript
// CheckRate endpoint - Re-validate pricing
router.post('/hotels/checkrate', async (req, res) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

        const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/checkrates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-key': HOTELBEDS_API_KEY,
                'X-Signature': signature,
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hotelbeds CheckRate Error:', response.status, errorText);
            return res.status(response.status).json({
                success: false,
                error: 'Failed to check rate',
                details: errorText
            });
        }

        const data = await response.json();

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('CheckRate Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});
```

**Request Body Format:**
```json
{
  "rooms": [
    {
      "rateKey": "20201205|20201207|W|256|217516|DBL.DX|GC-ALL|RO||1~2~1|6|N@05~~20c65~107727977~N~~~C8707DE2DC8C4F4159912750444500AAUK0200059001000021020c65"
    }
  ]
}
```

---

### **STEP 2: Implement Hotelbeds Booking Confirmation API** ⚠️ CRITICAL

**Purpose:** Actually book the hotel with Hotelbeds

**Modify:** `Backend/controllers/booking.controller.js`

```javascript
// NEW: Call Hotelbeds Booking API
async function confirmHotelbedsBooking(bookingData) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateHotelbedsSignature(
        process.env.HOTELBEDS_API_KEY,
        process.env.HOTELBEDS_SECRET,
        timestamp
    );

    const hotelbedsRequest = {
        holder: {
            name: bookingData.guestInfo.primaryGuest.firstName,
            surname: bookingData.guestInfo.primaryGuest.lastName
        },
        rooms: [
            {
                rateKey: bookingData.rateKey, // MUST be passed from frontend
                paxes: [
                    {
                        roomId: 1,
                        type: "AD", // AD = Adult, CH = Child
                        name: bookingData.guestInfo.primaryGuest.firstName,
                        surname: bookingData.guestInfo.primaryGuest.lastName
                    }
                ]
            }
        ],
        clientReference: bookingData.bookingReference,
        remark: bookingData.specialRequests || "",
        tolerance: 2.00 // Price tolerance in percentage
    };

    const response = await fetch(`${process.env.HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Api-key': process.env.HOTELBEDS_API_KEY,
            'X-Signature': signature,
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip'
        },
        body: JSON.stringify(hotelbedsRequest)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hotelbeds booking failed: ${errorText}`);
    }

    return await response.json();
}

// MODIFY: createBooking controller
module.exports.createBooking = asyncErrorHandler(async (req, res) => {
    const {
        hotelName,
        roomName,
        location,
        checkIn,
        checkOut,
        guests,
        totalAmount,
        boardType = 'Room Only',
        rateClass = 'NOR',
        rateKey, // ⚠️ CRITICAL: Must be passed from frontend
        items = []
    } = req.body;

    // Validate rateKey
    if (!rateKey) {
        return ApiResponse.badRequest(res, 'rateKey is required for booking');
    }

    const userId = req.user._id;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Create booking data
    const bookingData = {
        user: userId,
        bookingType: 'hotel',
        bookingReference: generateBookingReference('hotel'),
        rateKey: rateKey, // Store rateKey
        status: 'pending',
        pricing: {
            basePrice: totalAmount,
            totalAmount: totalAmount,
            currency: 'PKR',
            taxes: 0,
            fees: 0,
            discounts: 0
        },
        hotelBooking: {
            hotelName: hotelName,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights: nights,
            rooms: [{
                roomName: roomName,
                boardName: boardType,
                rateClass: rateClass,
                adults: guests || 1,
                children: 0,
                netPrice: totalAmount,
                sellingPrice: totalAmount
            }],
            hotelAddress: {
                city: location ? location.split(',')[0] : '',
                country: location ? location.split(',')[1] : ''
            }
        },
        guestInfo: {
            primaryGuest: {
                firstName: req.user.fullname?.firstname || req.user.email.split('@')[0],
                lastName: req.user.fullname?.lastname || '',
                email: req.user.email,
                phone: req.user.phone || ''
            },
            totalGuests: {
                adults: guests || 1,
                children: 0,
                infants: 0
            }
        },
        payment: {
            status: 'pending',
            method: null,
            paidAmount: 0
        },
        travelDates: {
            departureDate: checkInDate,
            returnDate: checkOutDate,
            duration: nights
        },
        source: {
            platform: 'web'
        }
    };

    try {
        // ⚠️ STEP 1: Call Hotelbeds Booking API
        console.log('📞 Calling Hotelbeds Booking API...');
        const hotelbedsResponse = await confirmHotelbedsBooking(bookingData);

        // ⚠️ STEP 2: Store Hotelbeds booking reference
        bookingData.hotelbedsReference = hotelbedsResponse.booking.reference;
        bookingData.status = 'confirmed'; // Update status to confirmed
        bookingData.backup = {
            hotelbedsResponse: hotelbedsResponse
        };

        // STEP 3: Save to local database
        const booking = await bookingModel.create(bookingData);

        // STEP 4: Send notification
        try {
            await notificationService.sendBookingNotification(
                userId,
                'bookingCreated',
                { ...booking.toObject(), userDetails: req.user }
            );
        } catch (notificationError) {
            console.log('Notification failed:', notificationError.message);
        }

        return ApiResponse.created(res, {
            booking,
            hotelbedsReference: hotelbedsResponse.booking.reference,
            voucher: hotelbedsResponse.booking
        }, 'Booking confirmed successfully');

    } catch (error) {
        console.error('Booking creation error:', error);

        // If Hotelbeds booking fails, don't save to database
        return ApiResponse.error(res, 'Booking failed: ' + error.message, 500);
    }
});
```

**Hotelbeds Booking Request Format:**
```json
{
  "holder": {
    "name": "John",
    "surname": "Doe"
  },
  "rooms": [
    {
      "rateKey": "20201205|20201207|W|256|217516|DBL.DX|GC-ALL|RO||1~2~1|6|N@05~~...",
      "paxes": [
        {
          "roomId": 1,
          "type": "AD",
          "name": "John",
          "surname": "Doe"
        }
      ]
    }
  ],
  "clientReference": "H12345678ABCD",
  "remark": "Special request here",
  "tolerance": 2.00
}
```

---

### **STEP 3: Update Frontend to Pass rateKey**

**Modify:** `Frontend/src/Checkout.jsx` or booking component

```javascript
// When user clicks "Book Now", capture the rateKey
const handleBooking = async () => {
    const bookingData = {
        hotelName: selectedHotel.name,
        roomName: selectedRoom.name,
        location: selectedHotel.location,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: adults,
        totalAmount: selectedRoom.price,
        boardType: selectedRoom.boardName,
        rateClass: selectedRoom.rateClass,
        rateKey: selectedRoom.rateKey, // ⚠️ CRITICAL: Pass rateKey from availability response
    };

    const response = await fetch(`${API_BASE_URL}/api/bookings/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
    });

    // Handle response...
};
```

---

### **STEP 4: Implement Booking Retrieval**

**Add to:** `Backend/routes/hotel.route.js`

```javascript
// Get booking details from Hotelbeds
router.get('/bookings/:bookingReference', authUser, async (req, res) => {
    try {
        const { bookingReference } = req.params;
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

        const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings/${bookingReference}`, {
            method: 'GET',
            headers: {
                'Api-key': HOTELBEDS_API_KEY,
                'X-Signature': signature,
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                success: false,
                error: 'Failed to retrieve booking',
                details: errorText
            });
        }

        const data = await response.json();

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Booking Retrieval Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});
```

---

### **STEP 5: Implement Booking Cancellation**

**Add to:** `Backend/routes/hotel.route.js`

```javascript
// Cancel booking with Hotelbeds
router.delete('/bookings/:bookingReference', authUser, async (req, res) => {
    try {
        const { bookingReference } = req.params;
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

        // Optional: Simulate cancellation first to get cancellation fees
        const simulateResponse = await fetch(
            `${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings/${bookingReference}?cancellationFlag=SIMULATION`,
            {
                method: 'DELETE',
                headers: {
                    'Api-key': HOTELBEDS_API_KEY,
                    'X-Signature': signature,
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip'
                }
            }
        );

        const simulationData = await simulateResponse.json();

        // Actual cancellation
        const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings/${bookingReference}`, {
            method: 'DELETE',
            headers: {
                'Api-key': HOTELBEDS_API_KEY,
                'X-Signature': signature,
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                success: false,
                error: 'Failed to cancel booking',
                details: errorText
            });
        }

        const data = await response.json();

        // Update local database
        await bookingModel.findOneAndUpdate(
            { hotelbedsReference: bookingReference },
            { status: 'cancelled', cancellation: { cancelledAt: new Date(), cancellationFee: simulationData.cancellationFee } }
        );

        res.json({
            success: true,
            data: data,
            cancellationFee: simulationData.cancellationFee
        });

    } catch (error) {
        console.error('Booking Cancellation Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});
```

---

## 📊 IMPLEMENTATION PRIORITY

### **CRITICAL (Must Implement Immediately):**
1. ✅ **STEP 2:** Hotelbeds Booking Confirmation API
2. ✅ **STEP 3:** Frontend rateKey passing

### **HIGH PRIORITY:**
3. ✅ **STEP 4:** Booking Retrieval from Hotelbeds
4. ✅ **STEP 5:** Booking Cancellation with Hotelbeds

### **MEDIUM PRIORITY:**
5. ✅ **STEP 1:** CheckRate API (for RECHECK rates)

---

## 🔑 KEY FIELDS REQUIRED

### **From Availability Response (Frontend must capture):**
- `rateKey` - CRITICAL for booking
- `rateType` - Check if "RECHECK" or "BOOKABLE"
- `net` - Price
- `boardCode` - Board type
- `boardName` - Board name
- `rooms` - Number of rooms
- `adults` - Number of adults
- `children` - Number of children

### **For Booking Request:**
- `holder.name` - Guest first name
- `holder.surname` - Guest last name
- `rooms[].rateKey` - From availability
- `rooms[].paxes[]` - Guest details
- `clientReference` - Your booking reference
- `remark` - Special requests (optional)
- `tolerance` - Price tolerance (optional, default 2%)

---

## ⚠️ CRITICAL NOTES

1. **rateKey is MANDATORY** - Without it, you cannot book
2. **rateKey expires** - Must be used within a short time (usually 30 minutes)
3. **RECHECK rates** - Must call CheckRate before booking
4. **Price tolerance** - Hotelbeds may return slightly different price, set tolerance
5. **Holder information** - Must match payment card holder
6. **Test environment** - Use `https://api.test.hotelbeds.com` for testing
7. **Production environment** - Use `https://api.hotelbeds.com` for production

---

## 📝 NEXT STEPS

1. **Review this document** with your team
2. **Implement STEP 2 first** (Hotelbeds Booking API) - CRITICAL
3. **Update Frontend** to capture and pass rateKey
4. **Test in sandbox** environment
5. **Implement remaining steps** (CheckRate, Retrieval, Cancellation)
6. **Update documentation** with actual API responses
7. **Request production credentials** from client

---

## 📞 SUPPORT

If you encounter issues:
- **Hotelbeds Support:** apitude@hotelbeds.com
- **Documentation:** https://developer.hotelbeds.com
- **Test Environment:** https://api.test.hotelbeds.com

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Ready for Implementation
