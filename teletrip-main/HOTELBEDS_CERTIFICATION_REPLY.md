Subject: Re: Telitrip Integration — Certification Test Flow Completed

Hi Team,

Thanks for your feedback and guidance throughout the process. 

We have completed all the required updates across our integration and run a full end-to-end test flow covering Search, CheckRate, Booking Confirmation, and Cancellation.

### Test Details & References
- **Booking Reference:** `148-6174394`
- **Cancellation Reference:** `3ab930d9ac5dd8642c49`
- **Occupancy Tested:** 2 Rooms including a child (Age: 3)
- **Status:** Both booking confirmation and cancellation were completed with HTTP 200 via mTLS.

### Key Points Implemented
1. **Full Flow Wire Logs:** All transactional requests use `api-mtls.test.hotelbeds.com` with mandatory headers (`Api-key`, SHA-256 `X-Signature`, and `Accept-Encoding: gzip`).
2. **Source Market & Occupancy:** Root-level `sourceMarket: "PK"` is set on availability searches, and child ages are passed accurately.
3. **Facilities with Extra Fees:** Paid facilities (`indFee = true`) are clearly disclosed to customers at both room and hotel levels.
4. **Customer Voucher:** Displays the mandatory HBX legal wording, emergency contacts, child age, and strictly masks wholesale net rates.

### Attachments
- `hotelbeds_certification_logs.json` (Full 10-step wire logs for the test session above)
- `template_confirmation_HBDS.xlsx` (Completed mapping template)
- Sample booking voucher (PDF / Screenshot)

Please review the attached logs and let us know if everything looks good or if you need any additional tests from our side.

Best regards,  
**Zeeshan Javed & The Telitrip Team**  
https://www.telitrip.com
