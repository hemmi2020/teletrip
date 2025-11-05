# Currency Conversion Testing Checklist

## 🧪 Complete Testing Guide

### Prerequisites
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] MongoDB connected
- [ ] Admin account created
- [ ] Test user account created

---

## 1️⃣ Backend API Testing

### Test 1: Convert EUR to PKR
```bash
curl -X POST http://localhost:3000/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 30, "currency": "EUR"}'
```

**Expected Response:**
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

**Checklist:**
- [ ] Returns 200 status code
- [ ] `success` is true
- [ ] `exchangeRate` is a number > 0
- [ ] `markupPerEuro` is 20 (default)
- [ ] `totalPKR` = (amount × exchangeRate) + (amount × markupPerEuro)

---

### Test 2: Get Currency Settings (Admin)
```bash
curl -X GET http://localhost:3000/api/currency/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
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

**Checklist:**
- [ ] Returns 200 status code
- [ ] Requires admin authentication
- [ ] Returns current markup value
- [ ] Returns current exchange rate

---

### Test 3: Update Markup (Admin)
```bash
curl -X PUT http://localhost:3000/api/currency/settings/markup \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"markupPerEuro": 25}'
```

**Expected Response:**
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

**Checklist:**
- [ ] Returns 200 status code
- [ ] Markup value updated in database
- [ ] Next conversion uses new markup
- [ ] Non-admin users get 403 error

---

## 2️⃣ Frontend Testing

### Test 4: Checkout Page Conversion

**Steps:**
1. Add a hotel (€30 EUR) to cart
2. Go to checkout page
3. Observe the conversion

**Expected Behavior:**
- [ ] Loading spinner shows briefly
- [ ] Price breakdown appears:
  - [ ] Original Price: €30 EUR
  - [ ] Exchange Rate: ~300 PKR/EUR
  - [ ] Base Amount: ~9000 PKR
  - [ ] Service Fee: 600 PKR
  - [ ] Total: ~9600 PKR
- [ ] Payment button shows: "Pay with HBLPay - PKR 9600"
- [ ] No console errors

**Browser Console Check:**
```javascript
// Should see:
💱 Currency converted: {
  amountInEUR: 30,
  exchangeRate: 300,
  markupPerEuro: 20,
  basePKR: 9000,
  markupAmount: 600,
  totalPKR: 9600
}
```

---

### Test 5: Admin Currency Settings Page

**Steps:**
1. Login as admin
2. Navigate to Currency Settings
3. Observe the page

**Expected Behavior:**
- [ ] Page loads without errors
- [ ] Current exchange rate displays (e.g., "300 PKR/EUR")
- [ ] Markup input shows current value (e.g., 20)
- [ ] Example calculation shows:
  - [ ] Base: 30 × 300 = 9000 PKR
  - [ ] Markup: 30 × 20 = 600 PKR
  - [ ] Total: 9600 PKR
- [ ] Last updated timestamp shows

---

### Test 6: Update Markup from Admin UI

**Steps:**
1. Change markup from 20 to 25
2. Click "Update Markup"
3. Wait for response

**Expected Behavior:**
- [ ] Button shows "Saving..." with spinner
- [ ] Success message appears: "Markup updated successfully!"
- [ ] Example calculation updates:
  - [ ] Markup: 30 × 25 = 750 PKR
  - [ ] Total: 9750 PKR
- [ ] Message disappears after 3 seconds

---

## 3️⃣ Integration Testing

### Test 7: Complete Booking Flow

**Steps:**
1. Browse hotels (prices in EUR)
2. Add €30 hotel to cart
3. Go to checkout
4. Complete payment

**Expected Behavior:**
- [ ] Cart shows: €30 EUR
- [ ] Checkout converts to: 9600 PKR
- [ ] Payment processes with PKR amount
- [ ] Payment record stores:
  ```javascript
  {
    amount: 9600,
    currency: 'PKR',
    currencyConversion: {
      originalAmount: 30,
      originalCurrency: 'EUR',
      exchangeRate: 300,
      markupPerEuro: 20,
      basePKR: 9000,
      markupAmount: 600,
      totalPKR: 9600
    }
  }
  ```
- [ ] Booking record stores same conversion data

---

### Test 8: Markup Change Effect

**Steps:**
1. Admin changes markup from 20 to 25
2. User books same €30 hotel
3. Check payment amount

**Expected Behavior:**
- [ ] First booking: 9600 PKR (20 markup)
- [ ] Second booking: 9750 PKR (25 markup)
- [ ] First booking amount unchanged
- [ ] Both bookings store their respective conversion details

---

## 4️⃣ Database Verification

### Test 9: Payment Record

**MongoDB Query:**
```javascript
db.payments.findOne({ paymentId: "PAY_XXX" })
```

**Expected Fields:**
```javascript
{
  paymentId: "PAY_XXX",
  amount: 9600,
  currency: "PKR",
  currencyConversion: {
    originalAmount: 30,
    originalCurrency: "EUR",
    exchangeRate: 300,
    markupPerEuro: 20,
    basePKR: 9000,
    markupAmount: 600,
    totalPKR: 9600,
    conversionDate: ISODate("2024-01-15T10:30:00Z")
  }
}
```

**Checklist:**
- [ ] `currencyConversion` object exists
- [ ] All fields populated correctly
- [ ] `conversionDate` is set

---

### Test 10: Booking Record

**MongoDB Query:**
```javascript
db.bookings.findOne({ bookingReference: "H123456" })
```

**Expected Fields:**
```javascript
{
  bookingReference: "H123456",
  currencyConversion: {
    originalAmount: 30,
    originalCurrency: "EUR",
    exchangeRate: 300,
    markupPerEuro: 20,
    basePKR: 9000,
    markupAmount: 600,
    totalPKR: 9600,
    conversionDate: ISODate("2024-01-15T10:30:00Z")
  }
}
```

**Checklist:**
- [ ] `currencyConversion` copied from payment
- [ ] All fields match payment record

---

## 5️⃣ Error Handling Testing

### Test 11: Invalid Markup Value

**Steps:**
1. Try to set markup to -5
2. Try to set markup to 150

**Expected Behavior:**
- [ ] Error message: "Markup must be between 0 and 100 PKR"
- [ ] Value not saved
- [ ] Input field shows validation error

---

### Test 12: API Failure Handling

**Steps:**
1. Disconnect internet
2. Try to convert currency

**Expected Behavior:**
- [ ] Uses cached exchange rate (if available)
- [ ] Falls back to 300 PKR/EUR if no cache
- [ ] Shows warning message to user
- [ ] Conversion still completes

---

### Test 13: Unauthorized Access

**Steps:**
1. Logout or use non-admin token
2. Try to access `/api/currency/settings`

**Expected Behavior:**
- [ ] Returns 401 or 403 error
- [ ] Error message: "Unauthorized" or "Admin access required"
- [ ] Settings not returned

---

## 6️⃣ Performance Testing

### Test 14: Exchange Rate Caching

**Steps:**
1. Call `/api/currency/convert` 10 times in 1 minute
2. Check backend logs

**Expected Behavior:**
- [ ] First call fetches from Frankfurter API
- [ ] Next 9 calls use cached rate
- [ ] Cache expires after 1 hour
- [ ] No excessive API calls

---

### Test 15: Concurrent Requests

**Steps:**
1. Open 5 browser tabs
2. Add items to cart in all tabs
3. Go to checkout in all tabs simultaneously

**Expected Behavior:**
- [ ] All conversions complete successfully
- [ ] No race conditions
- [ ] Consistent exchange rates across tabs
- [ ] No database errors

---

## 7️⃣ Edge Cases

### Test 16: Zero Amount
```bash
curl -X POST http://localhost:3000/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 0, "currency": "EUR"}'
```

**Expected Behavior:**
- [ ] Returns error: "Amount must be greater than 0"
- [ ] Status code: 400

---

### Test 17: Negative Amount
```bash
curl -X POST http://localhost:3000/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": -30, "currency": "EUR"}'
```

**Expected Behavior:**
- [ ] Returns error: "Amount must be positive"
- [ ] Status code: 400

---

### Test 18: Very Large Amount
```bash
curl -X POST http://localhost:3000/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 999999, "currency": "EUR"}'
```

**Expected Behavior:**
- [ ] Converts successfully
- [ ] No overflow errors
- [ ] Correct calculation

---

## 8️⃣ Security Testing

### Test 19: SQL Injection Attempt
```bash
curl -X POST http://localhost:3000/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": "30; DROP TABLE payments;", "currency": "EUR"}'
```

**Expected Behavior:**
- [ ] Returns validation error
- [ ] No database changes
- [ ] Request logged for security review

---

### Test 20: XSS Attempt
```bash
curl -X PUT http://localhost:3000/api/currency/settings/markup \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"markupPerEuro": "<script>alert(\"XSS\")</script>"}'
```

**Expected Behavior:**
- [ ] Returns validation error
- [ ] Script not stored in database
- [ ] No XSS vulnerability

---

## 📊 Test Results Summary

### Pass/Fail Tracking

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Convert EUR to PKR | ⬜ | |
| 2 | Get Currency Settings | ⬜ | |
| 3 | Update Markup | ⬜ | |
| 4 | Checkout Conversion | ⬜ | |
| 5 | Admin UI Load | ⬜ | |
| 6 | Update from UI | ⬜ | |
| 7 | Complete Booking | ⬜ | |
| 8 | Markup Change Effect | ⬜ | |
| 9 | Payment Record | ⬜ | |
| 10 | Booking Record | ⬜ | |
| 11 | Invalid Markup | ⬜ | |
| 12 | API Failure | ⬜ | |
| 13 | Unauthorized Access | ⬜ | |
| 14 | Rate Caching | ⬜ | |
| 15 | Concurrent Requests | ⬜ | |
| 16 | Zero Amount | ⬜ | |
| 17 | Negative Amount | ⬜ | |
| 18 | Large Amount | ⬜ | |
| 19 | SQL Injection | ⬜ | |
| 20 | XSS Attempt | ⬜ | |

**Legend:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🐛 Bug Report Template

If you find issues, use this template:

```markdown
### Bug Report

**Test Number:** Test 7
**Test Name:** Complete Booking Flow
**Status:** ❌ Failed

**Expected Behavior:**
Payment record should store currencyConversion object

**Actual Behavior:**
currencyConversion field is null in payment record

**Steps to Reproduce:**
1. Add €30 hotel to cart
2. Go to checkout
3. Complete payment
4. Check payment record in database

**Error Messages:**
None

**Screenshots:**
[Attach if applicable]

**Environment:**
- OS: Windows 11
- Browser: Chrome 120
- Node: v18.17.0
- MongoDB: 6.0

**Additional Notes:**
Conversion works on frontend but not saved to database
```

---

## ✅ Sign-Off

Once all tests pass:

- [ ] All 20 tests completed
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Security validated
- [ ] Documentation reviewed
- [ ] Ready for production

**Tested By:** _______________
**Date:** _______________
**Signature:** _______________

---

## 🚀 Production Deployment Checklist

Before deploying:

- [ ] All tests passed
- [ ] Environment variables set
- [ ] Database indexes created
- [ ] Admin account configured
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Monitoring enabled
- [ ] Team notified

---

## 📞 Support

If tests fail:
1. Check `CURRENCY_IMPLEMENTATION_COMPLETE.md`
2. Review `CURRENCY_CONVERSION_GUIDE.md`
3. Check backend logs
4. Verify database connection
5. Contact development team

Good luck with testing! 🎉
