# Real-Time Features Documentation

## Overview
The admin dashboard now includes comprehensive real-time features for live monitoring and instant updates.

## Features Implemented

### 1. WebSocket Connection
- **File**: `src/services/websocket.service.jsx`
- **Purpose**: Manages real-time bidirectional communication with the server
- **Features**:
  - Auto-reconnection on disconnect
  - Token-based authentication
  - Event listener management
  - Connection status monitoring

### 2. Notification Bell
- **File**: `src/components/NotificationBell.jsx`
- **Features**:
  - Live notification dropdown
  - Unread count badge with animation
  - Mark as read functionality
  - Clear all notifications
  - Auto-close after 3 seconds
  - Categorized by type (booking, payment, user)
  - Relative timestamps (e.g., "2m ago")

### 3. Activity Feed
- **File**: `src/components/ActivityFeed.jsx`
- **Features**:
  - Real-time audit log
  - Color-coded activity types
  - User action tracking
  - Scrollable feed (last 100 activities)
  - Live updates indicator
  - Detailed activity information

### 4. System Status Indicators
- **File**: `src/components/SystemStatus.jsx`
- **Features**:
  - WebSocket connection status
  - Database health
  - API server status
  - Performance metrics
  - Overall system health
  - Last update timestamp

### 5. Auto-Refresh
- **Implementation**: AdminDashboard.jsx
- **Interval**: 30 seconds
- **Scope**: All data tables (users, bookings, hotels, payments, support)
- **Behavior**: Automatic background refresh without user interaction

## WebSocket Events

### Client Listens For:
```javascript
'new_booking'         // New booking created
'new_payment'         // Payment received
'new_user'            // User registered
'booking_cancelled'   // Booking cancelled
'system_status'       // System health update
```

### Event Data Structure:
```javascript
// new_booking
{
  bookingReference: string,
  user: { email: string },
  amount: number,
  ...bookingData
}

// new_payment
{
  amount: number,
  user: { email: string },
  transactionId: string,
  ...paymentData
}

// new_user
{
  email: string,
  fullname: { firstname: string, lastname: string },
  ...userData
}

// system_status
{
  overall: 'online' | 'warning' | 'offline',
  websocket: 'online' | 'offline',
  database: 'online' | 'offline',
  api: 'online' | 'offline',
  performance: 'online' | 'warning' | 'offline'
}
```

## Usage

### In AdminDashboard:
```javascript
// WebSocket automatically connects on mount
useEffect(() => {
  const token = localStorage.getItem('adminToken');
  WebSocketService.connect(token);
  
  // Listen for events
  WebSocketService.on('new_booking', handleNewBooking);
  
  return () => {
    WebSocketService.disconnect();
  };
}, []);
```

### Notifications:
```javascript
// Add notification
addNotification('booking', 'New Booking', 'Booking #12345 created');

// Mark as read
handleMarkAsRead(notificationId);

// Clear all
handleClearAllNotifications();
```

### Activity Feed:
```javascript
// Add activity
addActivity('payment', 'Payment received', 'PKR 5000 payment processed', data);
```

## Backend Requirements

### Socket.IO Server Setup:
```javascript
// Backend: server.js or app.js
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify token
  next();
});

// Emit events
io.emit('new_booking', bookingData);
io.emit('new_payment', paymentData);
io.emit('new_user', userData);
io.emit('system_status', statusData);
```

### Required Backend Events:
1. **new_booking** - Emit when booking is created
2. **new_payment** - Emit when payment is processed
3. **new_user** - Emit when user registers
4. **booking_cancelled** - Emit when booking is cancelled
5. **system_status** - Emit every 30 seconds with system health

## Configuration

### Environment Variables:
```env
VITE_BASE_URL=http://localhost:3000  # Backend URL for WebSocket
```

### WebSocket Options:
```javascript
{
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
}
```

## Testing

### Test WebSocket Connection:
1. Open Admin Dashboard
2. Check browser console for "✅ WebSocket connected"
3. Create a booking/payment from user side
4. Verify notification appears in admin dashboard
5. Check activity feed for new entry

### Test Auto-Refresh:
1. Open Admin Dashboard on any tab (users, bookings, etc.)
2. Wait 30 seconds
3. Verify data refreshes automatically
4. Check network tab for API calls

### Test System Status:
1. Check system status widget on overview page
2. Verify all services show "online"
3. Stop backend server
4. Verify status changes to "offline"

## Performance Considerations

1. **Notification Limit**: Max 50 notifications stored
2. **Activity Limit**: Max 100 activities stored
3. **Auto-Refresh**: Only active tab refreshes
4. **WebSocket**: Automatic reconnection on disconnect
5. **Memory**: Old notifications/activities are automatically pruned

## Troubleshooting

### WebSocket Not Connecting:
- Check VITE_BASE_URL is correct
- Verify backend Socket.IO is running
- Check browser console for errors
- Verify admin token is valid

### Notifications Not Appearing:
- Check WebSocket connection status
- Verify backend is emitting events
- Check browser console for errors
- Verify event names match

### Auto-Refresh Not Working:
- Check if tab is active
- Verify 30-second interval
- Check network tab for API calls
- Verify no JavaScript errors

## Future Enhancements

1. **Sound Notifications**: Add audio alerts for critical events
2. **Desktop Notifications**: Browser push notifications
3. **Custom Filters**: Filter notifications by type
4. **Export Activity Log**: Download activity feed as CSV
5. **Real-Time Charts**: Live updating analytics charts
6. **User Presence**: Show online admin users
7. **Chat System**: Real-time admin chat
8. **Alert Rules**: Custom alert conditions

## Dependencies

```json
{
  "socket.io-client": "^4.8.1",
  "lucide-react": "^0.511.0",
  "react": "^19.1.0"
}
```

## File Structure

```
Frontend/
├── src/
│   ├── services/
│   │   └── websocket.service.jsx      # WebSocket service
│   ├── components/
│   │   ├── NotificationBell.jsx       # Notification dropdown
│   │   ├── ActivityFeed.jsx           # Activity log
│   │   └── SystemStatus.jsx           # System health
│   └── AdminDashboard.jsx             # Main dashboard with real-time
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend Socket.IO configuration
3. Test WebSocket connection manually
4. Review this documentation

---

**Last Updated**: 2025
**Version**: 1.0.0
