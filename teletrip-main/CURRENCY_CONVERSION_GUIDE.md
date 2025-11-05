# Currency Conversion System - EUR to PKR with Admin Markup

## Overview
Complete currency conversion system that converts Hotelbeds EUR prices to PKR with admin-configurable markup.

## Features
✅ Real-time EUR → PKR conversion using Frankfurter API  
✅ Admin-configurable markup per EUR (e.g., +20 PKR per EUR)  
✅ Exchange rate caching (1 hour TTL)  
✅ Fallback rates for API failures  
✅ Admin dashboard to manage markup  

## How It Works

### Formula
```
Total PKR = (EUR × Exchange Rate) + (EUR × Markup Per EUR)
```

### Example
- **Product Price**: 30 EUR
- **Exchange Rate**: 300 PKR/EUR (from Frankfurter API)
- **Admin Markup**: 20 PKR/EUR
- **Calculation**:
  - Base PKR: 30 × 300 = 9,000 PKR
  - Markup: 30 × 20 = 600 PKR
  - **Total**: 9,600 PKR

## API Endpoints

### 1. Convert EUR to PKR
```http
POST /api/currency/convert
Content-Type: application/json

{
  "amount": 30,
  "currency": "EUR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "amountInEUR": 30,
    "exchangeRate": 300,
    "markupPerEuro": 20,
    "basePKR": 9000,
    "markupAmount": 600,
    "totalPKR": 9600,
    "currency": "PKR"
  }
}
```

### 2. Get Current Exchange Rate
```http
GET /api/currency/rate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exchangeRate": 300,
    "markupPerEuro": 20,
    "effectiveRate": 320
  }
}
```

### 3. Get Currency Settings (Admin)
```http
GET /api/currency/settings
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "markupPerEuro": 20,
    "currentExchangeRate": 300,
    "lastUpdated": "2024-01-15T10:30:00Z",
    "lastUpdatedBy": "admin_user_id"
  }
}
```

### 4. Update Markup (Admin Only)
```http
PUT /api/currency/settings/markup
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "markupPerEuro": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "markupPerEuro": 25,
    "isActive": true,
    "lastUpdatedBy": "admin_user_id",
    "updatedAt": "2024-01-15T10:35:00Z"
  },
  "message": "Markup updated successfully"
}
```

## Frontend Integration

### In Cart (Show EUR)
```javascript
// Cart shows original EUR prices from Hotelbeds
<div className="price">
  €{room.price} EUR
</div>
```

### In Checkout (Convert to PKR)
```javascript
import { useState, useEffect } from 'react';

function Checkout({ cartItems }) {
  const [pricingDetails, setPricingDetails] = useState(null);
  
  useEffect(() => {
    const totalEUR = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    // Convert EUR to PKR
    fetch(`${import.meta.env.VITE_BASE_URL}/api/currency/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalEUR, currency: 'EUR' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setPricingDetails(data.data);
      }
    });
  }, [cartItems]);
  
  return (
    <div className="checkout">
      <h2>Checkout</h2>
      
      {/* Price Breakdown */}
      <div className="price-breakdown">
        <div>Original Price: €{pricingDetails?.amountInEUR} EUR</div>
        <div>Exchange Rate: {pricingDetails?.exchangeRate} PKR/EUR</div>
        <div>Base Amount: {pricingDetails?.basePKR} PKR</div>
        <div>Service Fee: {pricingDetails?.markupAmount} PKR</div>
        <div className="total">
          <strong>Total: {pricingDetails?.totalPKR} PKR</strong>
        </div>
      </div>
      
      {/* Payment buttons with PKR amount */}
      <button onClick={() => handlePayment(pricingDetails.totalPKR)}>
        Pay {pricingDetails?.totalPKR} PKR
      </button>
    </div>
  );
}
```

### Admin Dashboard - Manage Markup
```javascript
function CurrencySettings() {
  const [markup, setMarkup] = useState(20);
  const [currentRate, setCurrentRate] = useState(null);
  
  useEffect(() => {
    // Fetch current settings
    fetch(`${import.meta.env.VITE_BASE_URL}/api/currency/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setMarkup(data.data.markupPerEuro);
      setCurrentRate(data.data.currentExchangeRate);
    });
  }, []);
  
  const handleUpdateMarkup = async () => {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/currency/settings/markup`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ markupPerEuro: markup })
    });
    
    const result = await response.json();
    if (result.success) {
      alert('Markup updated successfully!');
    }
  };
  
  return (
    <div className="currency-settings">
      <h2>Currency Settings</h2>
      
      <div className="setting-item">
        <label>Current Exchange Rate:</label>
        <span>{currentRate} PKR/EUR</span>
      </div>
      
      <div className="setting-item">
        <label>Markup Per EUR (PKR):</label>
        <input 
          type="number" 
          value={markup} 
          onChange={(e) => setMarkup(Number(e.target.value))}
          min="0"
          max="100"
        />
      </div>
      
      <button onClick={handleUpdateMarkup}>
        Update Markup
      </button>
      
      <div className="example">
        <h3>Example Calculation:</h3>
        <p>If product is 30 EUR:</p>
        <p>Base: 30 × {currentRate} = {30 * currentRate} PKR</p>
        <p>Markup: 30 × {markup} = {30 * markup} PKR</p>
        <p><strong>Total: {30 * currentRate + 30 * markup} PKR</strong></p>
      </div>
    </div>
  );
}
```

## Database Schema

### CurrencySettings Collection
```javascript
{
  _id: ObjectId,
  markupPerEuro: 20,        // Admin-configurable
  isActive: true,
  lastUpdatedBy: ObjectId,  // Admin user ID
  createdAt: Date,
  updatedAt: Date
}
```

## Caching Strategy

### Exchange Rate Cache
- **TTL**: 1 hour (3600000 ms)
- **Source**: Frankfurter API
- **Fallback**: Last cached rate or 300 PKR

### Cache Flow
```
1. Request comes in
2. Check if cache exists and is fresh (< 1 hour old)
3. If yes → Use cached rate
4. If no → Fetch from Frankfurter API
5. Update cache with new rate and timestamp
6. If API fails → Use stale cache or fallback rate
```

## Error Handling

### API Failures
- **Frankfurter API Down**: Uses cached rate or fallback (300 PKR)
- **Database Error**: Returns default markup (20 PKR)
- **Network Timeout**: Graceful fallback with warning

### Admin Validation
- Markup must be between 0 and 100 PKR
- Only users with `role: 'admin'` can update markup
- All changes are logged with admin ID and timestamp

## Testing

### Test Conversion
```bash
curl -X POST http://localhost:3000/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 30, "currency": "EUR"}'
```

### Test Admin Update
```bash
curl -X PUT http://localhost:3000/api/currency/settings/markup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"markupPerEuro": 25}'
```

## Flow Diagram

```
User Flow:
1. Browse hotels (prices in EUR from Hotelbeds)
2. Add to cart (cart shows EUR)
3. Go to checkout
4. Frontend calls /api/currency/convert
5. Backend:
   - Fetches EUR→PKR rate from Frankfurter
   - Gets admin markup from database
   - Calculates: (EUR × rate) + (EUR × markup)
6. Shows total in PKR
7. User pays in PKR via HBLPay/Pay on Site

Admin Flow:
1. Login to admin dashboard
2. Navigate to Currency Settings
3. View current exchange rate and markup
4. Update markup (e.g., change from 20 to 25 PKR)
5. Save changes
6. All future conversions use new markup
```

## Important Notes

1. **Exchange Rate Updates**: Automatically refreshed every hour
2. **Markup Changes**: Take effect immediately for all new conversions
3. **Historical Bookings**: Store both EUR and PKR amounts for records
4. **Refunds**: Calculate based on original PKR amount paid
5. **Admin Access**: Only users with `role: 'admin'` can modify markup

## Next Steps

- [ ] Add currency conversion to booking records
- [ ] Update payment controller to use PKR amounts
- [ ] Create admin UI for currency settings
- [ ] Add conversion history/audit log
- [ ] Implement multi-currency support (USD, GBP, etc.)
