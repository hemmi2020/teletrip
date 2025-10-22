# Activities API Setup Guide

## Current Status
⚠️ **API Access Issue**: The Activities API is returning a 403 error (Access Denied).

## Issue Details
```
Error: API Error: 403 - {"error": "Access to this API has been disallowed"}
```

This error indicates that the API credentials are either:
1. Incorrect or expired
2. The account doesn't have access to the Activities API
3. The API key is for a different environment (test vs production)

## Current Configuration
- **API Key**: `46bc00518e62794783cfb35bbdd08526`
- **Secret**: `b9c1ec8545`
- **Base URL**: `https://api.test.hotelbeds.com/activity-api/3.0`

## Temporary Solution
The system now uses **mock data** as a fallback when the API is unavailable. This allows:
- ✅ Frontend development to continue
- ✅ Testing the complete user flow
- ✅ UI/UX refinement
- ✅ Integration testing

## Steps to Fix

### 1. Verify Credentials with Hotelbeds
Contact Hotelbeds support to:
- Verify your Activities API access is enabled
- Confirm the correct API key and secret
- Check if you need separate credentials for Activities API vs Hotels API

### 2. Check API Environment
Ensure you're using the correct environment:
- **Test**: `https://api.test.hotelbeds.com/activity-api/3.0`
- **Production**: `https://api.hotelbeds.com/activity-api/3.0`

### 3. Update Credentials
Once you have the correct credentials, update `.env`:
```env
ACTIVITIES_API_KEY=your_correct_api_key
ACTIVITIES_SECRET=your_correct_secret
```

### 4. Test the Connection
Restart the backend server and test:
```bash
cd Backend
npm start
```

Then search for activities in the frontend.

## Mock Data Features
While using mock data, the system provides:
- 5 sample activities per destination
- Realistic pricing (EUR 35-85)
- Multiple activity types (tours, food, adventure, museums, cruises)
- Complete activity details with images
- Modalities and pricing options

## API Documentation
- [Hotelbeds Activities API Docs](https://developer.hotelbeds.com/documentation/activities/)
- [Authentication Guide](https://developer.hotelbeds.com/documentation/getting-started/authentication/)

## Support
For API access issues, contact:
- **Hotelbeds Support**: support@hotelbeds.com
- **Developer Portal**: https://developer.hotelbeds.com

## When API is Working
Once credentials are fixed:
1. The system will automatically switch from mock to real data
2. No code changes needed
3. Real-time availability and pricing will be displayed
4. Full booking functionality will be enabled
