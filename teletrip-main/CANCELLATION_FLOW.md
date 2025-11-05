# Hotelbeds Booking Cancellation Flow

## Overview
Complete integration of Hotelbeds DELETE /bookings API for proper booking cancellation with refund processing.

## Cancellation API Details

### Endpoint
```
DELETE https://api.test.hotelbeds.com/hotel-api/1.0/bookings/{bookingReference}
```

### Query Parameters
- `cancellationFlag`: "CANCELLATION" (actual cancel) or "SIMULATION" (check refund amount)

### Headers
- `Api-key`: Your Hotelbeds API key
- `X-Signature`: SHA256 signature (apiKey + secret + timestamp)
- `Accept`: application/json
- `Accept-Encoding`: gzip

### Response
```json
{
  "booking": {
    "reference": "1-3816248",
    "cancellationReference": "PPFPPJXXVZ",
    "status": "CANCELLED",
    "totalNet": 0,
    "pendingAmount": 0,
    "currency": "EUR"
  }
}
```

## Implementation

### 1. Service Layer (hotelbeds.booking.service.js)

**Function**: `cancelBookingWithHotelbeds(bookingReference, cancellationFlag)`

**Features**:
- Generates proper API signature
- Calls Hotelbeds DELETE API
- Returns cancellation reference and refund amount
- Handles errors gracefully

**Usage**:
```javascript
const { cancelBookingWithHotelbeds } = require('../services/hotelbeds.booking.service');

const result = await cancelBookingWithHotelbeds('1-3816248', 'CANCELLATION');
// Returns: { success, cancellationReference, refundAmount, cancellationData }
```

### 2. User Controller (user.controller.js)

**Route**: `PUT /users/bookings/:bookingId/cancel`

**Flow**:
1. Find booking by ID and verify ownership
2. Check if booking can be cancelled (not already cancelled/completed)
3. **Call Hotelbeds cancellation API** if booking has Hotelbeds reference
4. Store cancellation reference and data in booking.backup
5. Update booking status to 'cancelled'
6. Create refund payment record
7. Return cancellation confirmation

**Key Fields Stored**:
- `booking.backup.hotelbedsCancellationData` - Full Hotelbeds response
- `booking.backup.cancellationReference` - Cancellation confirmation number
- `booking.backup.hotelbedsCancellationError` - Error if cancellation failed
- `booking.cancellationReason` - User's cancellation reason
- `booking.cancelledAt` - Cancellation timestamp

### 3. Dashboard Controller (userdashboard.controller.js)

**Route**: `PUT /api/user/bookings/:bookingId/cancel`

**Same flow as user controller** - integrated with Hotelbeds API

### 4. Booking Model (booking.model.js)

**New Fields Added**:
```javascript
backup: {
  hotelbedsBookingData: Mixed,           // Original booking data
  hotelbedsCancellationData: Mixed,      // Cancellation response
  cancellationReference: String,          // Cancellation confirmation
  hotelbedsCancellationError: String     // Error if failed
}

cancellationReason: String,              // User's reason
cancelledAt: Date                        // Cancellation timestamp
```

## Complete Cancellation Flow

### User Initiates Cancellation
```
Frontend (AccountDashboard.jsx)
  ↓
  Click "Cancel Booking" button
  ↓
  Confirm cancellation dialog
  ↓
  POST /users/bookings/:id/cancel
```

### Backend Processing
```
1. Verify booking exists and belongs to user
2. Check booking status (must be pending/confirmed)
3. Extract Hotelbeds reference from booking.backup.hotelbedsBookingData
4. Call cancelBookingWithHotelbeds(reference, 'CANCELLATION')
   ↓
   Hotelbeds API: DELETE /bookings/{reference}
   ↓
   Returns: { cancellationReference, refundAmount }
5. Store cancellation data in booking.backup
6. Update booking.status = 'cancelled'
7. Create refund payment record
8. Return success response with cancellation reference
```

### Response to Frontend
```json
{
  "success": true,
  "data": {
    "booking": { ... },
    "cancellationReference": "PPFPPJXXVZ",
    "refundAmount": 15000
  },
  "message": "Booking cancelled successfully"
}
```

## Refund Processing

### Refund Amount Calculation
- **Free Cancellation**: Full refund (totalAmount)
- **With Cancellation Fee**: totalAmount - cancellationFee
- **Hotelbeds Response**: Uses `totalNet` from cancellation response

### Payment Record
```javascript
{
  userId: user._id,
  bookingId: booking._id,
  paymentId: `REF-${Date.now()}`,
  amount: refundAmount,
  method: 'Refund',
  status: 'pending',
  metadata: {
    cancellationReference,
    originalAmount: booking.totalAmount
  }
}
```

## Error Handling

### Hotelbeds API Fails
- Booking still cancelled locally
- Error stored in `booking.backup.hotelbedsCancellationError`
- User notified of partial cancellation
- Manual intervention required

### Network Timeout
- 30-second timeout on API calls
- Graceful fallback to local cancellation
- Error logged for admin review

## Testing

### Test Cancellation
```bash
# Cancel a booking
curl -X PUT http://localhost:3000/users/bookings/:bookingId/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Change of plans"}'
```

### Check Cancellation Reference
```javascript
// In booking document
booking.backup.cancellationReference // "PPFPPJXXVZ"
booking.backup.hotelbedsCancellationData // Full response
```

## Frontend Integration

### Cancel Button (AccountDashboard.jsx)
```javascript
const handleCancelBooking = async (bookingId) => {
  if (!window.confirm("Are you sure?")) return;
  
  const reason = prompt("Cancellation reason:");
  
  const response = await fetch(`/users/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert(`Cancelled! Reference: ${result.data.cancellationReference}`);
    // Refresh bookings
  }
};
```

## Key Benefits

✅ **Proper Cancellation**: Actually cancels with Hotelbeds, not just local DB
✅ **Cancellation Reference**: Stores proof of cancellation
✅ **Accurate Refunds**: Uses Hotelbeds-calculated refund amounts
✅ **Error Recovery**: Graceful handling if Hotelbeds API fails
✅ **Audit Trail**: Complete cancellation data stored for records
✅ **User Transparency**: Shows cancellation reference to users

## Important Notes

1. **Cancellation Policies**: Refund amount depends on cancellation policies from booking
2. **Free Cancellation**: Check `cancellationPolicies[].from` date vs current date
3. **Cancellation Reference**: Required for disputes and customer support
4. **Simulation Mode**: Use `cancellationFlag=SIMULATION` to check refund without cancelling
5. **Refund Processing**: Actual refund to payment gateway handled separately

## Next Steps

- [ ] Implement refund processing to payment gateway (HBLPay)
- [ ] Add cancellation email notifications
- [ ] Create admin panel for manual cancellation review
- [ ] Add cancellation analytics and reporting
- [ ] Implement partial cancellation (for multi-room bookings)
