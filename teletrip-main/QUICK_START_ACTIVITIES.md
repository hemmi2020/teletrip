# 🚀 Quick Start - Activities API

## 1️⃣ Backend Setup (Already Done ✅)

```bash
# Credentials are in .env
ACTIVITIES_API_KEY=46bc00518e62794783cfb35bbdd08526
ACTIVITIES_SECRET=b9c1ec8545
```

## 2️⃣ Test the API

```bash
cd Backend
node test-activities.js
```

Expected output: `✅ Success! Found X activities`

## 3️⃣ Start Your App

```bash
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

## 4️⃣ Use the Feature

1. Open `http://localhost:5173`
2. Click **"Experiences"** tab (🎭 icon)
3. Search for a destination (e.g., "Dubai")
4. Select dates
5. Click **"Search Experiences"**

## 📡 API Endpoints Quick Reference

```javascript
// Search
POST /api/activities/search
Body: { destination, from, to, paxes }

// Details
GET /api/activities/details/:code?from=DATE&to=DATE

// Availability
POST /api/activities/availability
Body: { activityCode, from, to, paxes }

// Book
POST /api/activities/booking
Body: { activityCode, modalityCode, from, to, holder, paxes }

// Get Booking
GET /api/activities/booking/:reference
```

## 🔧 Troubleshooting

**API not working?**
```bash
# Check if route is registered
curl http://localhost:3000/api/activities/search
```

**No results?**
- Try different destinations: Dubai, London, Paris, New York
- Check date format: YYYY-MM-DD
- Verify dates are in the future

**Frontend not showing tab?**
- Clear browser cache
- Check console for errors
- Verify VITE_BASE_URL in Frontend/.env

## 📝 Example Request

```bash
curl -X POST http://localhost:3000/api/activities/search \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Dubai",
    "from": "2024-12-20",
    "to": "2024-12-25",
    "paxes": [{"age": 30}]
  }'
```

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Test script returns activities
- [ ] Frontend shows Experiences tab
- [ ] Can search for activities
- [ ] Activity cards display correctly
- [ ] Images load properly

## 🆘 Need Help?

1. Check `ACTIVITIES_API_README.md` for detailed docs
2. Review `ACTIVITIES_INTEGRATION_SUMMARY.md` for overview
3. Run test script to verify API connectivity
4. Check browser console for frontend errors
5. Check terminal for backend errors

## 🎉 You're All Set!

The Activities API is fully integrated and ready to use!
