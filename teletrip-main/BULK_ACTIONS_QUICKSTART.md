# Bulk Actions - Quick Start Guide

## 🚀 Quick Overview

Bulk actions allow admins to perform operations on multiple records at once.

---

## ✅ What's Implemented (Frontend)

- ✅ Multi-select checkboxes
- ✅ Select all/none buttons
- ✅ Bulk actions bar
- ✅ Bulk approve/reject
- ✅ Bulk activate/deactivate
- ✅ Bulk email
- ✅ Bulk export
- ✅ Bulk delete

---

## 🎯 How to Use

### 1. Select Items
- Click checkboxes next to items
- OR click header checkbox to select all

### 2. Choose Action
- Bulk actions bar appears
- Click desired action button

### 3. Confirm (if needed)
- Confirm destructive actions
- Fill email form if sending emails

### 4. Done!
- Action executes
- Notification appears
- Selection clears

---

## 🔧 Backend Setup Required

### Step 1: Create Bulk Endpoints

```javascript
// routes/admin.route.js

// Bulk user operations
router.post('/users/bulk/:action', async (req, res) => {
  const { userIds } = req.body;
  const { action } = req.params;
  
  switch(action) {
    case 'activate':
      await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: true }
      );
      break;
    case 'deactivate':
      await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: false }
      );
      break;
    case 'delete':
      await User.deleteMany({ _id: { $in: userIds } });
      break;
  }
  
  res.json({ success: true, count: userIds.length });
});

// Bulk booking operations
router.post('/bookings/bulk/:action', async (req, res) => {
  const { bookingIds } = req.body;
  const { action } = req.params;
  
  switch(action) {
    case 'approve':
      await Booking.updateMany(
        { _id: { $in: bookingIds } },
        { status: 'confirmed' }
      );
      break;
    case 'reject':
      await Booking.updateMany(
        { _id: { $in: bookingIds } },
        { status: 'rejected' }
      );
      break;
  }
  
  res.json({ success: true, count: bookingIds.length });
});

// Bulk hotel operations
router.post('/hotels/bulk/:action', async (req, res) => {
  const { hotelIds } = req.body;
  const { action } = req.params;
  
  switch(action) {
    case 'approve':
      await Hotel.updateMany(
        { _id: { $in: hotelIds } },
        { status: 'active' }
      );
      break;
    case 'reject':
      await Hotel.updateMany(
        { _id: { $in: hotelIds } },
        { status: 'rejected' }
      );
      break;
    case 'delete':
      await Hotel.deleteMany({ _id: { $in: hotelIds } });
      break;
  }
  
  res.json({ success: true, count: hotelIds.length });
});

// Bulk support ticket operations
router.post('/support/tickets/bulk/:action', async (req, res) => {
  const { ticketIds } = req.body;
  const { action } = req.params;
  
  if (action === 'close') {
    await SupportTicket.updateMany(
      { _id: { $in: ticketIds } },
      { status: 'closed' }
    );
  }
  
  res.json({ success: true, count: ticketIds.length });
});
```

### Step 2: Create Bulk Export

```javascript
// routes/admin.route.js
const { Parser } = require('json2csv');

router.post('/export/bulk', async (req, res) => {
  const { type, ids } = req.body;
  
  let data;
  switch(type) {
    case 'users':
      data = await User.find({ _id: { $in: ids } });
      break;
    case 'bookings':
      data = await Booking.find({ _id: { $in: ids } });
      break;
    case 'hotels':
      data = await Hotel.find({ _id: { $in: ids } });
      break;
    case 'payments':
      data = await Payment.find({ _id: { $in: ids } });
      break;
    case 'support':
      data = await SupportTicket.find({ _id: { $in: ids } });
      break;
  }
  
  const parser = new Parser();
  const csv = parser.parse(data);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
  res.send(csv);
});
```

### Step 3: Create Bulk Email

```javascript
// routes/admin.route.js
const nodemailer = require('nodemailer');

router.post('/email/bulk', async (req, res) => {
  const { type, ids, subject, message } = req.body;
  
  let recipients = [];
  
  switch(type) {
    case 'users':
      const users = await User.find({ _id: { $in: ids } });
      recipients = users.map(u => u.email);
      break;
    case 'bookings':
      const bookings = await Booking.find({ _id: { $in: ids } }).populate('user');
      recipients = bookings.map(b => b.user.email);
      break;
    case 'payments':
      const payments = await Payment.find({ _id: { $in: ids } }).populate('userId');
      recipients = payments.map(p => p.userId.email);
      break;
    case 'support':
      const tickets = await SupportTicket.find({ _id: { $in: ids } }).populate('user');
      recipients = tickets.map(t => t.user.email);
      break;
  }
  
  // Send emails
  const transporter = nodemailer.createTransporter({
    // Your email config
  });
  
  await Promise.all(recipients.map(email => 
    transporter.sendMail({
      to: email,
      subject,
      text: message
    })
  ));
  
  res.json({ success: true, sent: recipients.length });
});
```

### Step 4: Install Dependencies

```bash
cd Backend
npm install json2csv
```

---

## 🧪 Testing

### Test Bulk Activate:
1. Go to Users tab
2. Select 2-3 users
3. Click "Activate"
4. Verify users are activated

### Test Bulk Email:
1. Select items
2. Click "Email"
3. Enter subject & message
4. Click "Send"
5. Check email inbox

### Test Bulk Export:
1. Select items
2. Click "Export"
3. Verify CSV downloads
4. Open CSV file

### Test Bulk Delete:
1. Select items
2. Click "Delete"
3. Confirm dialog
4. Verify items deleted

---

## 🎨 UI Components

### Bulk Actions Bar:
```
┌─────────────────────────────────────────────────────┐
│ ☑ 5 items selected  [Select all] [Deselect all]    │
│                                                      │
│ [✓ Activate] [✗ Deactivate] [✉ Email] [⬇ Export]  │
└─────────────────────────────────────────────────────┘
```

### Table with Checkboxes:
```
┌──┬────────┬──────────┬────────┬──────────┬─────────┐
│☑ │ ID     │ Details  │ Status │ Date     │ Actions │
├──┼────────┼──────────┼────────┼──────────┼─────────┤
│☑ │ ABC123 │ John Doe │ Active │ 1/1/2025 │ [👁][✏]│
│☐ │ DEF456 │ Jane Doe │ Active │ 1/2/2025 │ [👁][✏]│
│☑ │ GHI789 │ Bob Smith│ Active │ 1/3/2025 │ [👁][✏]│
└──┴────────┴──────────┴────────┴──────────┴─────────┘
```

---

## 📊 Actions by Tab

### Users Tab:
- ✅ Activate
- ✅ Deactivate
- ✅ Email
- ✅ Export
- ✅ Delete

### Bookings Tab:
- ✅ Approve
- ✅ Reject
- ✅ Email
- ✅ Export

### Hotels Tab:
- ✅ Approve
- ✅ Reject
- ✅ Export
- ✅ Delete

### Payments Tab:
- ✅ Export
- ✅ Email

### Support Tab:
- ✅ Close
- ✅ Email
- ✅ Export

---

## 🐛 Troubleshooting

### Checkboxes not working?
- Check browser console for errors
- Verify state management
- Check event handlers

### Bulk actions not executing?
- Check backend endpoints exist
- Verify API calls in Network tab
- Check backend logs

### Export not downloading?
- Check Content-Type header
- Verify CSV generation
- Check browser download settings

### Email not sending?
- Check email configuration
- Verify SMTP settings
- Check recipient emails

---

## ✅ Checklist

### Frontend:
- [x] Checkboxes added
- [x] Select all/none works
- [x] Bulk actions bar shows
- [x] Actions execute
- [x] Notifications show
- [x] Export downloads
- [x] Email modal works

### Backend:
- [ ] Bulk endpoints created
- [ ] Export endpoint works
- [ ] Email endpoint works
- [ ] Validation added
- [ ] Error handling added
- [ ] Testing complete

---

## 🎉 Success!

If everything works:
- ✅ Select multiple items
- ✅ Bulk actions bar appears
- ✅ Actions execute successfully
- ✅ Notifications show
- ✅ Data refreshes

**You're ready to use bulk actions! 🚀**

---

**Quick Start Version**: 1.0  
**Last Updated**: 2025
