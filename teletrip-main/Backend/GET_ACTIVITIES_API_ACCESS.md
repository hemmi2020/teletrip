# How to Get Activities API Access from Hotelbeds

## Current Issue
Your Activities API credentials are returning a 403 error, which means:
- The credentials are incorrect, OR
- Your account doesn't have Activities API access enabled

## Solution: Contact Hotelbeds

### Email Template
Send this email to Hotelbeds support:

---

**To:** support@hotelbeds.com  
**Subject:** Activities API Access Request - Account [Your Account ID]

**Body:**

Hello Hotelbeds Support Team,

I am currently using your Hotels API successfully with the following credentials:
- API Key: 106700a0f2f1e2aa1d4c2b16daae70b2
- Environment: Test

I would like to enable the Activities API for my account. I am currently receiving a 403 "Access to this API has been disallowed" error when trying to use the Activities API with these credentials:
- API Key: 46bc00518e62794783cfb35bbdd08526
- Secret: b9c1ec8545
- Endpoint: https://api.test.hotelbeds.com/activity-api/3.0

Could you please:
1. Confirm if my account has Activities API access enabled
2. Provide the correct API credentials for the Activities API (test environment)
3. Confirm if I need separate credentials for Activities vs Hotels API
4. Provide any documentation specific to Activities API authentication

My account details:
- Company: [Your Company Name]
- Account ID: [Your Account ID]
- Contact: [Your Name]
- Email: [Your Email]

Thank you for your assistance.

Best regards,
[Your Name]

---

## Alternative: Developer Portal

### 1. Login to Developer Portal
Visit: https://developer.hotelbeds.com

### 2. Check Your Products
- Go to "My Account" or "Products"
- Check if "Activities API" is listed
- If not, request access

### 3. Generate New Credentials
- Navigate to API Credentials section
- Generate new credentials specifically for Activities API
- Note: Hotels and Activities may require separate credentials

## Quick Test Script

Once you get new credentials, test them with this curl command:

```bash
# Replace with your actual credentials
API_KEY="your_new_api_key"
SECRET="your_new_secret"
TIMESTAMP=$(date +%s)
SIGNATURE=$(echo -n "${API_KEY}${SECRET}${TIMESTAMP}" | sha256sum | cut -d' ' -f1)

curl -X POST "https://api.test.hotelbeds.com/activity-api/3.0/activities" \
  -H "Api-key: ${API_KEY}" \
  -H "X-Signature: ${SIGNATURE}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "filters": [{
      "searchFilterItems": [{
        "type": "destination",
        "value": "Dubai"
      }]
    }],
    "from": "2024-12-01",
    "to": "2024-12-05",
    "paxes": [{"age": 30}],
    "language": "en"
  }'
```

If successful, you should see JSON with activities data.

## Important Notes

### 1. Separate Credentials
Hotelbeds often requires **separate credentials** for different APIs:
- Hotels API: One set of credentials
- Activities API: Different set of credentials
- Transfer API: Another set of credentials

### 2. Environment
Make sure you're using the correct environment:
- **Test**: `api.test.hotelbeds.com` (for development)
- **Production**: `api.hotelbeds.com` (for live)

### 3. Account Type
Some Hotelbeds accounts only have access to specific APIs. You may need to:
- Upgrade your account
- Request additional API access
- Sign a separate agreement for Activities API

## Temporary Solution

While waiting for correct credentials, the system uses **mock data**:
- ✅ Allows frontend development
- ✅ Complete user flow testing
- ✅ No impact on user experience
- ✅ Automatically switches to real data when API works

## Update Process

Once you receive correct credentials:

### 1. Update .env
```env
ACTIVITIES_API_KEY=your_new_correct_api_key
ACTIVITIES_SECRET=your_new_correct_secret
```

### 2. Restart Backend
```bash
cd Backend
npm start
```

### 3. Test
Search for activities in the frontend. If credentials are correct:
- Mock data will automatically disable
- Real activities will be displayed
- Full booking functionality will work

## Support Contacts

### Hotelbeds Support
- **Email**: support@hotelbeds.com
- **Phone**: Check your account portal
- **Portal**: https://developer.hotelbeds.com
- **Documentation**: https://developer.hotelbeds.com/documentation/activities/

### Response Time
- Usually 1-2 business days
- Urgent requests: Mark email as "Urgent"

## Checklist

Before contacting support, have ready:
- [ ] Your Hotelbeds account ID
- [ ] Company name
- [ ] Current Hotels API credentials (that work)
- [ ] Desired environment (test/production)
- [ ] Use case description
- [ ] Expected API usage volume

## Expected Response

Hotelbeds will typically provide:
1. Confirmation of API access
2. New API credentials (if needed)
3. Documentation links
4. Any additional setup requirements
5. Rate limits and usage guidelines

## After Getting Credentials

1. Test with curl command above
2. Update `.env` file
3. Restart backend
4. Test in application
5. Monitor logs for any errors
6. Document working credentials securely

## Security Note

⚠️ **Never commit API credentials to Git**
- Keep credentials in `.env` only
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate credentials periodically
