# Hotelbeds Booking API Integration with Payment Flow

## Current Issue
Currently, when users pay via HBLPay or Pay on Site, the booking is **NOT confirmed with Hotelbeds**. We only store the booking data in MongoDB.

## Required Changes

### 1. **HBLPay Flow** (Card Payment)
```
User selects room → CheckRate → User pays via HBLPay → Payment Success → 
→ Call Hotelbeds POST /bookings → Store Hotelbeds booking reference → Update MongoDB
```

### 2. **Pay on Site Flow**
```
User selects room → CheckRate → User confirms Pay on Site → 
→ Call Hotelbeds POST /bookings → Store Hotelbeds booking reference → Update MongoDB
```

## Implementation Steps

### Step 1: Add Hotelbeds Booking Helper Function
Add to `payment.controller.js`:

```javascript
const fetch = require('node-fetch');

// Hotelbeds API configuration
const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
const HOTELBEDS_BASE_URL = 'https://api.test.hotelbeds.com';

function generateHotelbedsSignature(apiKey, secret, timestamp) {
  const crypto = require('crypto');
  const stringToSign = apiKey + secret + timestamp;
  return crypto.createHash('sha256').update(stringToSign).digest('hex');
}

async function confirmBookingWithHotelbeds(bookingData) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    console.log('📞 Calling Hotelbeds POST /bookings API...');
    console.log('📦 Booking data:', JSON.stringify(bookingData, null, 2));

    const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-key': HOTELBEDS_API_KEY,
        'X-Signature': signature,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Hotelbeds booking failed:', response.status, errorText);
      throw new Error(`Hotelbeds booking failed: ${errorText}`);
    }

    const hotelbedsResponse = await response.json();
    console.log('✅ Hotelbeds booking confirmed:', hotelbedsResponse.booking?.reference);

    return {
      success: true,
      hotelbedsReference: hotelbedsResponse.booking?.reference,
      hotelbedsData: hotelbedsResponse
    };

  } catch (error) {
    console.error('❌ Error confirming booking with Hotelbeds:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Step 2: Update HBLPay Success Handler
Modify `handlePaymentSuccess` in `payment.controller.js`:

```javascript
module.exports.handlePaymentSuccess = asyncErrorHandler(async (req, res) => {
  console.log('\n🎉 ========== PAYMENT SUCCESS CALLBACK ==========');
  
  try {
    // ... existing decryption code ...

    const responseCode = decryptedResponse.RESPONSE_CODE;
    const orderRefNumber = decryptedResponse.ORDER_REF_NUMBER;
    const transactionId = decryptedResponse.TRANSACTION_ID;

    if (orderRefNumber) {
      const payment = await paymentModel.findOne({ 
        'gateway.orderRefNumber': orderRefNumber 
      });

      if (payment) {
        const isSuccess = responseCode === '0' || responseCode === '100';
        
        if (isSuccess) {
          // ✅ NEW: Confirm booking with Hotelbeds
          console.log('💳 Payment successful, confirming with Hotelbeds...');
          
          const bookingRecord = await bookingModel.findById(payment.bookingId);
          
          if (bookingRecord && bookingRecord.hotelBooking) {
            // Call Hotelbeds booking API
            const hotelbedsResult = await confirmBookingWithHotelbeds(bookingRecord.hotelBooking);
            
            if (hotelbedsResult.success) {
              // Update booking with Hotelbeds reference
              await bookingRecord.updateOne({
                hotelbedsReference: hotelbedsResult.hotelbedsReference,
                hotelbedsBookingData: hotelbedsResult.hotelbedsData,
                status: 'confirmed',
                paymentStatus: 'paid',
                confirmedAt: new Date()
              });
              
              console.log('✅ Booking confirmed with Hotelbeds:', hotelbedsResult.hotelbedsReference);
            } else {
              console.error('❌ Hotelbeds booking failed:', hotelbedsResult.error);
              // Still mark payment as completed but flag booking issue
              await bookingRecord.updateOne({
                status: 'payment_completed_booking_pending',
                paymentStatus: 'paid',
                hotelbedsError: hotelbedsResult.error
              });
            }
          }
          
          // Update payment status
          await payment.updateOne({
            status: 'completed',
            completedAt: new Date(),
            'gateway.transactionId': transactionId,
            'gateway.responseCode': responseCode,
            'gateway.responseMessage': decryptedResponse.RESPONSE_MESSAGE,
            updatedAt: new Date()
          });
        }
      }
    }

    // ... rest of success redirect code ...
  } catch (error) {
    console.error('❌ [SUCCESS] Error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=server_error`);
  }
});
```

### Step 3: Update Pay on Site Handler
Modify `createPayOnSiteBooking` in `payment.controller.js`:

```javascript
module.exports.createPayOnSiteBooking = asyncErrorHandler(async (req, res) => {
  const { bookingData, userData, amount, currency = 'PKR', bookingId } = req.body;
  const userId = req.user._id;

  console.log('🏨 Creating Pay on Site booking with Hotelbeds confirmation...');

  // Validation...

  try {
    // ✅ NEW: Confirm booking with Hotelbeds FIRST
    console.log('📞 Confirming booking with Hotelbeds...');
    
    const hotelbedsResult = await confirmBookingWithHotelbeds(bookingData.hotelbedsBookingRequest);
    
    if (!hotelbedsResult.success) {
      return ApiResponse.error(res, 
        `Failed to confirm booking with hotel: ${hotelbedsResult.error}`, 
        400
      );
    }

    console.log('✅ Hotelbeds booking confirmed:', hotelbedsResult.hotelbedsReference);

    // Create payment record
    const paymentId = generatePaymentId();
    const orderId = generateOrderId();

    const payment = new paymentModel({
      paymentId,
      userId,
      bookingId: hotelbedsResult.hotelbedsReference, // Use Hotelbeds reference
      amount: parseFloat(amount),
      currency,
      status: 'pending',
      paymentMethod: 'pay_on_site',
      orderId: orderId,
      billing: { /* ... */ },
      gateway: {
        provider: 'Pay on Site',
        orderRefNumber: orderId,
        hotelbedsReference: hotelbedsResult.hotelbedsReference,
        responseMessage: 'Payment will be collected on site'
      },
      hotelbedsBookingData: hotelbedsResult.hotelbedsData,
      metadata: {
        source: 'web',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        paymentType: 'pay_on_site',
        hotelbedsReference: hotelbedsResult.hotelbedsReference
      },
      initiatedAt: new Date()
    });

    await payment.save();

    return ApiResponse.success(res, {
      success: true,
      bookingId: hotelbedsResult.hotelbedsReference,
      bookingReference: hotelbedsResult.hotelbedsReference,
      paymentId,
      orderId,
      amount: parseFloat(amount),
      currency,
      paymentMethod: 'pay_on_site',
      status: 'confirmed', // Booking is confirmed, payment pending
      message: 'Booking confirmed with hotel! Payment will be collected on site.',
      hotelbedsData: hotelbedsResult.hotelbedsData.booking
    }, 'Booking confirmed successfully', 201);

  } catch (error) {
    console.error('❌ Pay on Site booking error:', error);
    return ApiResponse.error(res, error.message || 'Failed to create booking', 500);
  }
});
```

### Step 4: Update Booking Model Schema
Add to `booking.model.js`:

```javascript
const bookingSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // ✅ NEW: Hotelbeds integration fields
  hotelbedsReference: {
    type: String,
    index: true,
    sparse: true
  },
  hotelbedsBookingData: {
    type: mongoose.Schema.Types.Mixed
  },
  hotelbedsError: {
    type: String
  },
  
  // ... rest of schema ...
});
```

### Step 5: Update Frontend Booking Flow
In your frontend booking component, ensure you pass the complete Hotelbeds booking request:

```javascript
// When user confirms booking
const bookingPayload = {
  bookingData: {
    hotelName: selectedRoom.hotelName,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    guests: searchParams.guests,
    items: [{ name: selectedRoom.name, quantity: 1, price: selectedRoom.price }],
    
    // ✅ NEW: Include Hotelbeds booking request
    hotelbedsBookingRequest: {
      holder: {
        name: userData.firstName,
        surname: userData.lastName
      },
      rooms: [{
        rateKey: selectedRoom.rateKey // From checkRate response
      }],
      clientReference: `CLIENT_${Date.now()}`,
      remark: "Booking via TeleTrip"
    }
  },
  userData: { /* ... */ },
  amount: selectedRoom.price,
  currency: 'PKR'
};

// For HBLPay
await initiateHBLPayPayment(bookingPayload);

// For Pay on Site
await createPayOnSiteBooking(bookingPayload);
```

## Testing Checklist

- [ ] Test HBLPay flow: Payment success → Hotelbeds booking confirmed
- [ ] Test Pay on Site flow: Immediate Hotelbeds booking confirmation
- [ ] Test error handling: Hotelbeds booking fails after payment
- [ ] Verify Hotelbeds reference is stored in MongoDB
- [ ] Test booking cancellation with Hotelbeds DELETE API
- [ ] Verify dashboard shows Hotelbeds booking reference
- [ ] Test reconfirmation number retrieval

## Important Notes

1. **CheckRate First**: Always call `POST /checkrates` before booking to ensure price/availability
2. **RateKey Required**: The `rateKey` from checkRate response is required for booking
3. **Error Handling**: If Hotelbeds booking fails after payment, store error and allow manual retry
4. **Cancellation**: Use Hotelbeds `DELETE /bookings/{bookingId}` for cancellations
5. **Reconfirmation**: Implement webhook to receive hotel confirmation numbers

## Benefits

✅ **Real Booking**: Actual hotel reservation confirmed  
✅ **Inventory Management**: Hotel availability updated in real-time  
✅ **Cancellation Support**: Can cancel bookings via Hotelbeds API  
✅ **Hotel Confirmation**: Receive hotel confirmation numbers  
✅ **Professional**: Industry-standard booking flow  

## Next Steps

1. Implement the helper function
2. Update both payment handlers
3. Update booking model
4. Test with Hotelbeds sandbox
5. Add error recovery mechanism
6. Implement cancellation flow
7. Add reconfirmation webhook
