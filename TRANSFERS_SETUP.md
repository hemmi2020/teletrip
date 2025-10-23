# Hotelbeds Transfers API Integration

## Overview
Complete transfers booking feature using Hotelbeds Transfers API v1.0 with X-Signature authentication (SHA-256).

## Backend Setup

### 1. Install Dependencies
```bash
cd Backend
npm install axios express-validator
```

### 2. Files Created
- `services/transfers.service.js` - API service with X-Signature authentication
- `controllers/transfers.controller.js` - Request handlers
- `routes/transfers.route.js` - Express routes with validation
- Updated `app.js` - Added transfers routes

### 3. API Endpoints
- `POST /api/transfers/search` - Search transfers
- `POST /api/transfers/availability` - Check availability
- `POST /api/transfers/bookings` - Create booking
- `GET /api/transfers/bookings/:bookingReference` - Get booking details
- `DELETE /api/transfers/bookings/:bookingReference` - Cancel booking

## Frontend Setup

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Files Created
- `services/transfersApi.jsx` - API client
- `components/TransferBookingForm.jsx` - Multi-step booking form
- `TransferSearch.jsx` - Results and booking page
- Updated `components/HotelSearchForm.jsx` - Added Transfers tab
- Updated `App.jsx` - Added `/transfers` route

### 3. Access the Feature
1. Navigate to home page: `http://localhost:5173/home`
2. Click on "Transfers" tab in the search form
3. Fill in transfer details and search
4. View results at `/transfers` and complete booking

## API Configuration

### Authentication
- API Key: `844fee1612f0278abc1baa5a8fa88135`
- Secret: `275186f336`
- Signature: SHA-256(ApiKey + Secret + timestamp)

### Base URL
- Test: `https://api.test.hotelbeds.com/transfer-api/1.0`

## Usage Example

### Search Parameters
```json
{
  "language": "en",
  "fromType": "IATA",
  "fromCode": "PMI",
  "toType": "ATLAS",
  "toCode": "12345",
  "outbound": "2024-06-15T10:00:00",
  "adults": 2,
  "children": 0,
  "infants": 0
}
```

### Booking Flow
1. Search transfers from Transfers tab
2. Select transfer from results
3. Step 1: Review transfer details
4. Step 2: Enter passenger information
5. Step 3: Add pickup details
6. Confirm booking
7. Display confirmation

## Location Codes
- **IATA**: Airport codes (e.g., PMI, BCN, MAD)
- **ATLAS**: Hotel codes (numeric, e.g., 12345)

## Features
✓ X-Signature authentication (SHA-256)
✓ Integrated into HotelSearchForm component
✓ Search & availability check
✓ Multi-step booking form
✓ Form validation
✓ Responsive design (Tailwind CSS)
✓ Error handling
✓ Loading states
✓ Booking confirmation

## Testing
1. Start backend: `cd Backend && npm start`
2. Start frontend: `cd Frontend && npm run dev`
3. Navigate to `/home`
4. Click Transfers tab
5. Test search with valid IATA/ATLAS codes
6. Complete booking flow
