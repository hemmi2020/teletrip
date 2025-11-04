# Real-Time Features - Quick Start Guide

## 🚀 Quick Setup

### Frontend (Already Complete ✅)
The frontend real-time features are fully implemented and ready to use.

### Backend Setup (Required)

#### 1. Install Socket.IO
```bash
cd Backend
npm install socket.io
```

#### 2. Update server.js

Add this code to your `Backend/server.js`:

```javascript
const http = require('http');
const app = require('./app');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Socket.IO Setup
const io = socketIO(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'https://telitrip.onrender.com'
    ],
    credentials: true
  }
});

// Socket.IO Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  // Add your JWT verification here
  next();
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('✅ Admin connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Admin disconnected:', socket.id);
  });
});

// Make io available globally
global.io = io;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

#### 3. Emit Events in Controllers

**Booking Controller** (`Backend/controllers/booking.controller.js`):
```javascript
// After creating booking
if (global.io) {
  global.io.emit('new_booking', {
    bookingReference: booking.bookingReference,
    user: { email: user.email },
    amount: booking.totalAmount,
    hotelName: booking.hotelBooking?.hotelName
  });
}
```

**Payment Controller** (`Backend/controllers/payment.controller.js`):
```javascript
// After payment success
if (global.io) {
  global.io.emit('new_payment', {
    amount: payment.amount,
    user: { email: user.email },
    transactionId: payment.transactionId,
    method: payment.paymentMethod
  });
}
```

**User Controller** (`Backend/controllers/user.controller.js`):
```javascript
// After user registration
if (global.io) {
  global.io.emit('new_user', {
    email: user.email,
    fullname: user.fullname
  });
}
```

**Booking Cancellation**:
```javascript
// After cancelling booking
if (global.io) {
  global.io.emit('booking_cancelled', {
    bookingReference: booking.bookingReference,
    refundAmount: refund.amount,
    user: { email: user.email }
  });
}
```

#### 4. Add System Health Monitor

Create `Backend/utils/systemHealth.js`:
```javascript
const mongoose = require('mongoose');

const getSystemHealth = () => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'online' : 'offline';
  
  return {
    overall: dbStatus === 'online' ? 'online' : 'offline',
    websocket: 'online',
    database: dbStatus,
    api: 'online',
    performance: 'online'
  };
};

module.exports = { getSystemHealth };
```

Add to `server.js`:
```javascript
const { getSystemHealth } = require('./utils/systemHealth');

// Emit system status every 30 seconds
setInterval(() => {
  if (global.io) {
    global.io.emit('system_status', getSystemHealth());
  }
}, 30000);
```

---

## 🧪 Testing

### 1. Start Backend
```bash
cd Backend
npm start
```

### 2. Start Frontend
```bash
cd Frontend
npm run dev
```

### 3. Test WebSocket Connection
1. Open browser console
2. Login to admin dashboard
3. Look for: `✅ WebSocket connected`

### 4. Test Notifications
1. Open admin dashboard
2. In another tab, create a booking as a user
3. Check admin dashboard for notification bell badge
4. Click bell to see notification

### 5. Test Activity Feed
1. Go to Overview tab
2. Scroll down to Activity Feed
3. Perform actions (create booking, payment, etc.)
4. Watch activities appear in real-time

### 6. Test System Status
1. Go to Overview tab
2. Check System Status widget (top right)
3. All should show "online"
4. Stop backend to see status change

### 7. Test Auto-Refresh
1. Go to any tab (Users, Bookings, etc.)
2. Wait 30 seconds
3. Watch data refresh automatically

---

## 🐛 Troubleshooting

### WebSocket Not Connecting

**Check 1**: Backend Socket.IO running?
```bash
# Should see in backend console:
Server is running on port 3000
```

**Check 2**: CORS configured?
```javascript
// In server.js
cors: {
  origin: ['http://localhost:5173'],
  credentials: true
}
```

**Check 3**: Token valid?
```javascript
// Check localStorage
localStorage.getItem('adminToken')
```

### Notifications Not Appearing

**Check 1**: Events being emitted?
```javascript
// Add console.log in backend
console.log('Emitting new_booking event');
global.io.emit('new_booking', data);
```

**Check 2**: Frontend listening?
```javascript
// Check browser console
WebSocketService.on('new_booking', (data) => {
  console.log('Received new_booking:', data);
});
```

### Auto-Refresh Not Working

**Check 1**: Tab active?
- Auto-refresh only works on active tab

**Check 2**: Interval running?
```javascript
// Check browser console
console.log('Auto-refresh triggered');
```

---

## 📱 Quick Test Script

Run this in browser console to simulate events:

```javascript
// Simulate new booking notification
const mockBooking = {
  bookingReference: 'TEST123',
  user: { email: 'test@example.com' },
  amount: 5000
};

// This would normally come from backend
// For testing, you can manually trigger:
// (Only works if you modify the code to expose these functions)
```

---

## 🎯 Expected Behavior

### When User Creates Booking:
1. ✅ Notification appears in bell (with sound if implemented)
2. ✅ Badge count increases
3. ✅ Activity added to feed
4. ✅ Bookings tab auto-refreshes (if active)

### When Payment Processed:
1. ✅ Payment notification appears
2. ✅ Activity logged
3. ✅ Payments tab auto-refreshes (if active)

### When User Registers:
1. ✅ User notification appears
2. ✅ Activity logged
3. ✅ Users tab auto-refreshes (if active)

### Every 30 Seconds:
1. ✅ Active tab data refreshes
2. ✅ System status updates
3. ✅ No UI disruption

---

## 📊 Monitoring

### Check WebSocket Status:
```javascript
// In browser console
WebSocketService.isConnected()
// Should return: true
```

### Check Notifications:
```javascript
// In React DevTools
// Find AdminDashboard component
// Check state: notifications
```

### Check Activities:
```javascript
// In React DevTools
// Find AdminDashboard component
// Check state: activities
```

---

## 🔧 Configuration

### Change Auto-Refresh Interval:
```javascript
// In AdminDashboard.jsx
// Change 30000 (30 seconds) to desired milliseconds
setInterval(() => {
  loadData();
}, 30000); // Change this value
```

### Change Notification Limit:
```javascript
// In AdminDashboard.jsx
setNotifications(prev => [notification, ...prev].slice(0, 50)); // Change 50
```

### Change Activity Limit:
```javascript
// In AdminDashboard.jsx
setActivities(prev => [activity, ...prev].slice(0, 100)); // Change 100
```

---

## ✅ Checklist

Before going live:

- [ ] Socket.IO installed on backend
- [ ] server.js updated with Socket.IO
- [ ] Events emitted in all controllers
- [ ] System health monitor added
- [ ] CORS configured correctly
- [ ] JWT authentication working
- [ ] Tested all notification types
- [ ] Tested auto-refresh
- [ ] Tested system status
- [ ] Tested on production URL

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend console for Socket.IO logs
3. Verify WebSocket connection in Network tab
4. Test with simple console.log statements
5. Review REALTIME_FEATURES.md for detailed docs

---

## 🎉 Success!

If everything works:
- ✅ WebSocket connected
- ✅ Notifications appearing
- ✅ Activity feed updating
- ✅ System status showing online
- ✅ Auto-refresh working

**You're all set! 🚀**

---

**Quick Start Version**: 1.0  
**Last Updated**: 2025
