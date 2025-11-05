# Admin Currency Settings Integration Guide

## Quick Start - Add Currency Settings to Admin Dashboard

### Step 1: Import the Component

Open your `AdminDashboard.jsx` file and add the import:

```javascript
import CurrencySettings from './components/CurrencySettings';
import { DollarSign } from 'lucide-react'; // For the icon
```

### Step 2: Add to Navigation Menu

Add a new menu item in your admin navigation:

```javascript
const adminMenuItems = [
  // ... existing items
  {
    id: 'currency',
    label: 'Currency Settings',
    icon: <DollarSign className="w-5 h-5" />,
    path: '/admin/currency',
    component: <CurrencySettings />
  }
];
```

### Step 3: Add Route (if using React Router)

```javascript
import { Routes, Route } from 'react-router-dom';

<Routes>
  {/* ... existing routes */}
  <Route path="/admin/currency" element={<CurrencySettings />} />
</Routes>
```

### Step 4: Add to Tab/Section (if using tabs)

```javascript
const [activeTab, setActiveTab] = useState('dashboard');

// In your render
{activeTab === 'currency' && <CurrencySettings />}
```

---

## Complete Example - AdminDashboard.jsx

```javascript
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  DollarSign,  // ← Add this
  Settings 
} from 'lucide-react';
import CurrencySettings from './components/CurrencySettings';  // ← Add this

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'currency', label: 'Currency', icon: DollarSign },  // ← Add this
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <nav className="p-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'users' && <UsersContent />}
        {activeTab === 'bookings' && <BookingsContent />}
        {activeTab === 'currency' && <CurrencySettings />}  {/* ← Add this */}
        {activeTab === 'settings' && <SettingsContent />}
      </main>
    </div>
  );
};

export default AdminDashboard;
```

---

## Alternative: Using React Router

```javascript
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CurrencySettings from './components/CurrencySettings';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <nav className="p-4">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
          <Link 
            to="/admin/currency" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2"
          >
            <DollarSign className="w-5 h-5" />
            Currency Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/admin/dashboard" element={<DashboardContent />} />
          <Route path="/admin/currency" element={<CurrencySettings />} />
        </Routes>
      </main>
    </div>
  );
};
```

---

## Styling Tips

### Match Your Theme

The CurrencySettings component uses Tailwind CSS. Customize colors to match your admin theme:

```javascript
// In CurrencySettings.jsx, replace:
className="bg-blue-600 hover:bg-blue-700"

// With your theme color:
className="bg-purple-600 hover:bg-purple-700"  // or any color
```

### Responsive Design

The component is already responsive, but you can adjust:

```javascript
<div className="max-w-4xl mx-auto p-6">  // ← Adjust max-width
```

---

## Testing the Integration

### 1. Access the Page
```
http://localhost:5173/admin/currency
```

### 2. Verify Functionality
- [ ] Page loads without errors
- [ ] Current exchange rate displays
- [ ] Markup input accepts numbers
- [ ] Update button works
- [ ] Success message appears
- [ ] Example calculation updates

### 3. Test Admin Permissions
```javascript
// Make sure only admins can access
// Add to your ProtectedAdminRoute component
```

---

## Common Issues & Solutions

### Issue 1: Component Not Found
```
Error: Cannot find module './components/CurrencySettings'
```

**Solution:** Check file path
```javascript
// If CurrencySettings.jsx is in src/components/
import CurrencySettings from './components/CurrencySettings';

// If it's in src/components/admin/
import CurrencySettings from './components/admin/CurrencySettings';
```

### Issue 2: API Endpoint Not Found
```
Error: 404 /api/currency/settings
```

**Solution:** Verify backend routes are set up
```javascript
// In Backend/routes/currency.route.js
router.get('/settings', authMiddleware, adminMiddleware, getSettings);
router.put('/settings/markup', authMiddleware, adminMiddleware, updateMarkup);
```

### Issue 3: Unauthorized Access
```
Error: 403 Forbidden
```

**Solution:** Check admin authentication
```javascript
// Make sure user has admin role
const token = localStorage.getItem('token');
// Token should contain: { role: 'admin' }
```

---

## Security Checklist

- [ ] Only admins can access `/admin/currency`
- [ ] API endpoints require admin authentication
- [ ] Markup validation (0-100 PKR)
- [ ] Audit log for all changes
- [ ] HTTPS in production

---

## Next Steps

1. ✅ Add CurrencySettings to admin dashboard
2. ✅ Test with admin account
3. ✅ Verify markup updates work
4. ✅ Test end-to-end booking flow
5. ✅ Deploy to production

---

## Need Help?

Check these files:
- `CurrencySettings.jsx` - The component
- `CURRENCY_IMPLEMENTATION_COMPLETE.md` - Full documentation
- `CURRENCY_CONVERSION_GUIDE.md` - Original guide

---

## Quick Copy-Paste

### Minimal Integration (Tab-based)

```javascript
// 1. Import
import CurrencySettings from './components/CurrencySettings';
import { DollarSign } from 'lucide-react';

// 2. Add to tabs array
{ id: 'currency', label: 'Currency', icon: DollarSign }

// 3. Add to render
{activeTab === 'currency' && <CurrencySettings />}
```

### Minimal Integration (Router-based)

```javascript
// 1. Import
import CurrencySettings from './components/CurrencySettings';

// 2. Add route
<Route path="/admin/currency" element={<CurrencySettings />} />

// 3. Add navigation link
<Link to="/admin/currency">Currency Settings</Link>
```

That's it! 🎉
