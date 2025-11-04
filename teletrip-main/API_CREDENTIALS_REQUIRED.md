# 🔐 API Credentials & Configuration Required for Production Deployment

**Project:** Teletrip Travel & Tours Platform  
**Date:** January 2025  
**Status:** Ready for Production - Awaiting Official Credentials  
**Developer Note:** Currently using test/sandbox credentials for development

---

## 📋 Executive Summary

The Teletrip platform has been fully developed and tested using developer test credentials. To deploy to production, we require official API keys, credentials, and configuration details from your organization. This document outlines all required credentials organized by service category.

---

## 🏨 1. HOTELBEDS API (Hotel Booking Service)

**Purpose:** Hotel search, booking, and management  
**Current Status:** Using test/sandbox credentials  
**Required for Production:**

### Main Hotels API
- ✅ **API Key:** `[REQUIRED - Production Key]`
- ✅ **Secret Key:** `[REQUIRED - Production Secret]`
- ✅ **Base URL:** `https://api.hotelbeds.com` (Production)
- 📝 **Current Test Values:**
  - API Key: `106700a0f2f1e2aa1d4c2b16daae70b2`
  - Secret: `018e478aa6`
  - Base URL: `https://api.test.hotelbeds.com`

### Activities/Experiences API
- ✅ **API Key:** `[REQUIRED - Production Key]`
- ✅ **Secret Key:** `[REQUIRED - Production Secret]`
- 📝 **Current Test Values:**
  - API Key: `20ddddd1e8dc2179f30636c3de66f2f9`
  - Secret: `5a73868977`

### Transfers API
- ✅ **API Key:** `[REQUIRED - Production Key]`
- ✅ **Secret Key:** `[REQUIRED - Production Secret]`
- 📝 **Current Test Values:**
  - API Key: `844fee1612f0278abc1baa5a8fa88135`
  - Secret: `275186f336`

**Documentation:** https://developer.hotelbeds.com/  
**Account Required:** Yes - Please provide production account credentials

---

## 💳 2. HBL PAY (Payment Gateway)

**Purpose:** Payment processing for bookings  
**Current Status:** Using test/sandbox credentials  
**Required for Production:**

### HBL Pay Credentials
- ✅ **User ID:** `[REQUIRED - Production User ID]`
- ✅ **Password:** `[REQUIRED - Production Password]`
- ✅ **Channel Name:** `[REQUIRED - Production Channel]`
- ✅ **Type ID:** `[REQUIRED - Usually 0]`
- 📝 **Current Test Values:**
  - User ID: `teliadmin`
  - Password: `9S2n37TVT!`
  - Channel: `HBLPay_Teli_Website`

### HBL Pay URLs
- ✅ **Production API URL:** `https://digitalbankingportal.hbl.com/hostedcheckout/api/checkout`
- ✅ **Production Redirect URL:** `https://digitalbankingportal.hbl.com/hostedcheckout/site/index.html#/checkout?data=`

### HBL Pay Public Key (RSA 4096)
- ✅ **HBL Public Key PEM:** `[REQUIRED - Production Public Key]`
- 📝 **Note:** Currently using test public key

### Merchant Keys (Your Organization)
- ✅ **Merchant Private Key (RSA 4096):** `[REQUIRED - Generate new for production]`
- ✅ **Merchant Public Key (RSA 4096):** `[REQUIRED - Generate new for production]`
- 📝 **Note:** Current keys are test keys and MUST be replaced

### Webhook Configuration
- ✅ **Webhook Secret:** `[REQUIRED - For payment verification]`

**Documentation:** Contact HBL for production credentials  
**Security Note:** RSA keys must be regenerated for production

---

## 📧 3. EMAIL SERVICE (SMTP Configuration)

**Purpose:** Transactional emails (booking confirmations, password resets, notifications)  
**Current Status:** Using developer's personal Gmail  
**Required for Production:**

### SMTP Server Details
- ✅ **SMTP Host:** `[REQUIRED - e.g., smtp.gmail.com or company mail server]`
- ✅ **SMTP Port:** `[REQUIRED - Usually 587 for TLS or 465 for SSL]`
- ✅ **SMTP Secure:** `[REQUIRED - true/false]`
- ✅ **SMTP Username:** `[REQUIRED - Email account username]`
- ✅ **SMTP Password/App Password:** `[REQUIRED - Email account password]`
- 📝 **Current Test Values:**
  - Host: `smtp.gmail.com`
  - Port: `587`
  - User: `hamzashahzad020@gmail.com` (Developer's personal email)
  - Password: `tfxq fjft rczr qghs` (App-specific password)

### Email Branding
- ✅ **From Name:** `[REQUIRED - e.g., "Teletrip Travel & Tours"]`
- ✅ **From Email:** `[REQUIRED - e.g., noreply@teletrip.com]`
- ✅ **Support Email:** `[REQUIRED - e.g., support@teletrip.com]`

**Recommendation:** Use professional email service (SendGrid, AWS SES, or company SMTP)

---

## 🗄️ 4. DATABASE (MongoDB)

**Purpose:** Application data storage  
**Current Status:** Using local MongoDB  
**Required for Production:**

### MongoDB Atlas (Recommended) or Self-Hosted
- ✅ **Connection String:** `[REQUIRED - Production MongoDB URI]`
- ✅ **Database Name:** `[REQUIRED - e.g., teletrip-production]`
- ✅ **Username:** `[REQUIRED - Database user]`
- ✅ **Password:** `[REQUIRED - Database password]`
- 📝 **Current Test Value:**
  - Connection: `mongodb://localhost:27017/auth-api`

### Database Configuration
- ✅ **Max Pool Size:** `[RECOMMENDED - Default: 10]`
- ✅ **Connection Timeout:** `[RECOMMENDED - Default: 10000ms]`
- ✅ **Socket Timeout:** `[RECOMMENDED - Default: 30000ms]`

**Recommendation:** MongoDB Atlas (Cloud) for scalability and automatic backups

---

## 🔐 5. SECURITY & AUTHENTICATION

**Purpose:** Application security and user authentication  
**Current Status:** Using test secrets  
**Required for Production:**

### JWT Configuration
- ✅ **JWT Secret Key:** `[REQUIRED - Strong random string, min 32 characters]`
- ✅ **JWT Expires In:** `[RECOMMENDED - Default: 7d]`
- ✅ **JWT Refresh Expires In:** `[RECOMMENDED - Default: 30d]`
- 📝 **Current Test Value:** `your_jwt_secret_key_here`

### Session & Encryption
- ✅ **Session Secret:** `[REQUIRED - Strong random string]`
- ✅ **Encryption Key:** `[REQUIRED - Exactly 32 characters]`
- 📝 **Current Test Values:** Generic placeholders

**Security Note:** Generate cryptographically secure random strings for production

---

## 🌍 6. GEOCODING API

**Purpose:** Location search and address geocoding  
**Current Status:** Using test API key  
**Required for Production:**

### OpenCage Geocoding API
- ✅ **API Key:** `[REQUIRED - Production API Key]`
- ✅ **Provider:** `opencage`
- ✅ **Rate Limit:** `[REQUIRED - Based on your plan]`
- 📝 **Current Test Value:**
  - API Key: `683f444ee63b3235321176lrhc07075`

**Alternative Providers:** Google Maps Geocoding API, Mapbox, HERE Maps  
**Documentation:** https://opencagedata.com/

---

## 🗺️ 7. GOOGLE MAPS API

**Purpose:** Map display and location services  
**Current Status:** Using test API key  
**Required for Production:**

### Google Cloud Platform
- ✅ **Google Maps API Key:** `[REQUIRED - Production API Key]`
- ✅ **Enabled APIs:**
  - Maps JavaScript API
  - Places API
  - Geocoding API
- 📝 **Current Test Value:**
  - API Key: `683f444ee63b3235321176lrhc07075`

**Setup Required:** Google Cloud Console account with billing enabled  
**Documentation:** https://console.cloud.google.com/

---

## 🔗 8. TRIPADVISOR API

**Purpose:** Hotel reviews and ratings integration  
**Current Status:** Using test API key  
**Required for Production:**

- ✅ **TripAdvisor API Key:** `[REQUIRED - Production API Key]`
- 📝 **Current Test Value:**
  - API Key: `A5085DE13F0C40348EF6A8248E6436E1`

**Documentation:** https://developer-tripadvisor.com/

---

## 🌐 9. DOMAIN & HOSTING CONFIGURATION

**Purpose:** Production deployment URLs  
**Current Status:** Using localhost  
**Required for Production:**

### Domain Information
- ✅ **Frontend URL:** `[REQUIRED - e.g., https://www.teletrip.com]`
- ✅ **Backend URL:** `[REQUIRED - e.g., https://api.teletrip.com]`
- ✅ **API Base URL:** `[REQUIRED - e.g., https://api.teletrip.com/api/v1]`
- 📝 **Current Test Values:**
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:3000`

### Payment Callback URLs
- ✅ **Payment Success URL:** `[REQUIRED - e.g., https://api.teletrip.com/api/payments/success]`
- ✅ **Payment Cancel URL:** `[REQUIRED - e.g., https://api.teletrip.com/api/payments/cancel]`
- ✅ **Payment Webhook URL:** `[REQUIRED - e.g., https://api.teletrip.com/api/v1/payments/webhook]`

### CORS Configuration
- ✅ **Allowed Origins:** `[REQUIRED - List of allowed domains]`
- 📝 **Current Test Value:** `http://localhost:3000,http://localhost:3001,https://telitrip.com`

---

## 👤 10. ADMIN ACCOUNT CONFIGURATION

**Purpose:** Initial admin access  
**Required for Production:**

- ✅ **Admin Email:** `[REQUIRED - e.g., admin@teletrip.com]`
- ✅ **Admin Password:** `[REQUIRED - Strong password]`
- ✅ **Super Admin Email:** `[REQUIRED - e.g., superadmin@teletrip.com]`
- 📝 **Current Test Values:**
  - Admin Email: `admin@telitrip.com`
  - Password: `StrongAdminPassword123!`

---

## 📱 11. OPTIONAL INTEGRATIONS (Future Enhancement)

### SMS Notifications (Optional)
- **Twilio Account SID:** `[OPTIONAL]`
- **Twilio Auth Token:** `[OPTIONAL]`
- **Twilio Phone Number:** `[OPTIONAL]`

### Push Notifications (Optional)
- **FCM Server Key:** `[OPTIONAL]`
- **FCM Sender ID:** `[OPTIONAL]`

### Social Media Login (Optional)
- **Google Client ID:** `[OPTIONAL]`
- **Facebook App ID:** `[OPTIONAL]`
- **Facebook App Secret:** `[OPTIONAL]`

### Cloud Storage (Optional)
- **Cloudinary Cloud Name:** `[OPTIONAL]`
- **Cloudinary API Key:** `[OPTIONAL]`
- **Cloudinary API Secret:** `[OPTIONAL]`

### Monitoring & Analytics (Optional)
- **Google Analytics ID:** `[OPTIONAL]`
- **Sentry DSN:** `[OPTIONAL]`
- **New Relic License Key:** `[OPTIONAL]`

### Backup Configuration (Optional)
- **AWS S3 Bucket:** `[OPTIONAL]`
- **AWS Access Key ID:** `[OPTIONAL]`
- **AWS Secret Access Key:** `[OPTIONAL]`
- **AWS Region:** `[OPTIONAL]`

---

## 📊 12. BUSINESS CONFIGURATION

**Purpose:** Company information and business rules  
**Required for Production:**

### Company Details
- ✅ **Company Name:** `[REQUIRED - e.g., Teletrip Travel & Tours]`
- ✅ **Company Email:** `[REQUIRED - e.g., info@teletrip.com]`
- ✅ **Company Phone:** `[REQUIRED - e.g., +92-300-1234567]`
- ✅ **Company Address:** `[REQUIRED - Full address]`
- 📝 **Current Test Values:**
  - Name: `Telitrip Travel & Tours`
  - Email: `info@telitrip.com`
  - Phone: `+92-300-1234567`
  - Address: `Karachi, Pakistan`

### Business Rules
- ✅ **Default Currency:** `[REQUIRED - e.g., PKR, USD, EUR]`
- ✅ **Supported Currencies:** `[REQUIRED - Comma-separated list]`
- ✅ **Default Language:** `[REQUIRED - e.g., en, ur]`
- ✅ **Supported Languages:** `[REQUIRED - Comma-separated list]`

### Payment Rules
- ✅ **Minimum Payment Amount:** `[REQUIRED - e.g., 100]`
- ✅ **Maximum Payment Amount:** `[REQUIRED - e.g., 1000000]`
- ✅ **Payment Timeout (minutes):** `[REQUIRED - e.g., 30]`
- ✅ **Refund Policy (days):** `[REQUIRED - e.g., 7]`

---

## 📝 CREDENTIAL SUBMISSION CHECKLIST

Please provide the following information in a secure manner:

### ✅ Critical (Required for Launch)
- [ ] Hotelbeds Production API Keys (Hotels, Activities, Transfers)
- [ ] HBL Pay Production Credentials & Keys
- [ ] Production Email SMTP Configuration
- [ ] MongoDB Production Connection String
- [ ] JWT & Security Secrets
- [ ] Production Domain URLs
- [ ] Admin Account Details

### ⚠️ Important (Recommended)
- [ ] Google Maps Production API Key
- [ ] Geocoding API Production Key
- [ ] TripAdvisor Production API Key
- [ ] Company Information & Business Rules

### 💡 Optional (Can be added later)
- [ ] SMS Service Credentials
- [ ] Push Notification Keys
- [ ] Social Media Login Credentials
- [ ] Cloud Storage Credentials
- [ ] Monitoring & Analytics Keys
- [ ] Backup Configuration

---

## 🔒 SECURITY RECOMMENDATIONS

1. **Never share credentials via email or unsecured channels**
2. **Use password managers or secure credential sharing tools** (e.g., 1Password, LastPass Teams)
3. **Generate strong, unique passwords** for each service (min 16 characters)
4. **Enable 2FA/MFA** wherever possible
5. **Rotate credentials regularly** (every 90 days recommended)
6. **Use environment-specific credentials** (separate for staging/production)
7. **Implement IP whitelisting** where supported
8. **Monitor API usage** and set up alerts for unusual activity

---

## 📞 NEXT STEPS

1. **Review this document** and identify which credentials you already have
2. **Create accounts** for services you don't have yet
3. **Generate production API keys** from respective service providers
4. **Securely share credentials** with the development team
5. **Schedule deployment** once all credentials are provided
6. **Conduct final testing** in staging environment before production launch

---

## 📧 CONTACT INFORMATION

**Developer Contact:**  
For questions about this document or credential requirements, please contact the development team.

**Secure Credential Sharing:**  
Please use encrypted channels or secure credential sharing tools to provide sensitive information.

---

## 📄 APPENDIX: ENVIRONMENT FILE STRUCTURE

### Backend .env File Structure
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_CONNECT=[YOUR_MONGODB_URI]

# JWT
JWT_SECRET=[YOUR_JWT_SECRET]

# Email
SMTP_HOST=[YOUR_SMTP_HOST]
SMTP_USER=[YOUR_SMTP_USER]
SMTP_PASS=[YOUR_SMTP_PASSWORD]

# Hotelbeds
HOTELBEDS_API_KEY=[YOUR_API_KEY]
HOTELBEDS_SECRET=[YOUR_SECRET]
HOTELBEDS_BASE_URL=https://api.hotelbeds.com

# HBL Pay
HBLPAY_USER_ID=[YOUR_USER_ID]
HBLPAY_PASSWORD=[YOUR_PASSWORD]
HBL_PUBLIC_KEY_PEM=[YOUR_PUBLIC_KEY]
MERCHANT_PRIVATE_KEY_PEM=[YOUR_PRIVATE_KEY]

# URLs
FRONTEND_URL=[YOUR_FRONTEND_URL]
BACKEND_URL=[YOUR_BACKEND_URL]
```

### Frontend .env File Structure
```env
# API
VITE_BASE_URL=[YOUR_BACKEND_URL]

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=[YOUR_API_KEY]

# Support
VITE_SUPPORT_PHONE=[YOUR_PHONE]
VITE_SUPPORT_EMAIL=[YOUR_EMAIL]

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=[YOUR_CLIENT_ID]
```

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Awaiting Client Response

---

## ⚠️ IMPORTANT NOTICE

**This platform is fully functional with test credentials. All features have been developed, tested, and are ready for production deployment. The only requirement is replacing test credentials with official production credentials from your organization.**

**Estimated Time to Production:** 1-2 days after receiving all required credentials.
