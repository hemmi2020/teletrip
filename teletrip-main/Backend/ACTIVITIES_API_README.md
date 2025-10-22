# Hotelbeds Activities API Integration

## Overview
Complete integration of Hotelbeds Activities API v3.0 with HMAC SHA-256 authentication.

## Configuration

### Environment Variables (.env)
```env
ACTIVITIES_API_KEY=46bc00518e62794783cfb35bbdd08526
ACTIVITIES_SECRET=b9c1ec8545
```

## API Endpoints

### 1. Search Activities
**POST** `/api/activities/search`

**Request Body:**
```json
{
  "destination": "Dubai",
  "from": "2024-12-20",
  "to": "2024-12-25",
  "paxes": [{ "age": 30 }]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [...]
  }
}
```

### 2. Get Activity Details
**GET** `/api/activities/details/:activityCode?from=2024-12-20&to=2024-12-25`

### 3. Check Availability
**POST** `/api/activities/availability`

**Request Body:**
```json
{
  "activityCode": "E-E10-BURJKHALIFA",
  "from": "2024-12-20",
  "to": "2024-12-25",
  "paxes": [{ "age": 30 }]
}
```

### 4. Create Booking
**POST** `/api/activities/booking`

**Request Body:**
```json
{
  "activityCode": "E-E10-BURJKHALIFA",
  "modalityCode": "STANDARD",
  "from": "2024-12-20",
  "to": "2024-12-25",
  "paxes": [{ "age": 30 }],
  "holder": {
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "clientReference": "ACT_123456"
}
```

### 5. Get Booking Details
**GET** `/api/activities/booking/:bookingReference`

## Frontend Integration

The Experiences tab in `HotelSearchForm.jsx` now includes:
- Destination search
- Date range selection
- Activity search with results display
- Activity cards with images and pricing

## Testing

Run the test script:
```bash
node test-activities.js
```

## Authentication

The API uses HMAC SHA-256 signature:
```javascript
const timestamp = Math.floor(Date.now() / 1000);
const signature = crypto.createHash('sha256')
  .update(apiKey + secret + timestamp)
  .digest('hex');
```

Headers:
- `Api-key`: Your API key
- `X-Signature`: Generated HMAC signature
- `Accept`: application/json
- `Content-Type`: application/json

## Error Handling

All endpoints return standardized responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details"
}
```

## Notes

- Base URL: `https://api.test.hotelbeds.com/activity-api/3.0`
- Production URL: `https://api.hotelbeds.com/activity-api/3.0`
- Signature expires after request completion
- New signature required for each request
