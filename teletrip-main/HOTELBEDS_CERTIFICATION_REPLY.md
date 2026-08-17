Subject: Re: Telitrip Integration — Certification Fixes Completed & Ready for Re-Testing

Dear Hotelbeds Certification Team,

Thank you for the detailed feedback and certification test results. We have reviewed all mandatory and recommended points carefully and have implemented the necessary fixes across our integration.

Below is a point-by-point summary of what has been corrected:

---

MANDATORY FIXES

1. Display all facilities (room + hotel) that require additional charges
   → IMPLEMENTED
   • We now fetch both hotel-level and room-level facilities with indFee=true from the Content API.
   • Paid facilities are stored in the booking record (hotelBooking.paidFacilities and hotelBooking.roomPaidFacilities).
   • The booking voucher displays these in a dedicated "Facilities with Additional Charges (payable on-site)" section.

2. Display the Hotel phone number on the Voucher
   → IMPLEMENTED
   • Hotel phone numbers are fetched from the Content API /hotels/{code}/details endpoint.
   • Stored in booking.hotelBooking.hotelPhone.
   • Displayed on the voucher. If unavailable, a fallback message "Contact hotel directly" is shown.

3. Implementation of the Source marker
   → IMPLEMENTED
   • Source marker is now included in every availability search and booking request:
     {
       channel: "B2C",
       device: "WEB",
       deviceInfo: "TeleTrip Web Application",
       sourceMarket: "PK"
     }
   • Covers: /hotels/search, /hotels/search-auth, /hotels/search-by-hotels, /hotels/checkrate, and /bookings.

4. Display children's ages on the voucher
   → IMPLEMENTED
   • Child ages are passed to the Booking API in the paxes array (type: "CH", age: X).
   • The response child ages are stored per room (room.childAges).
   • Displayed on the voucher under each room: "Children Ages: 5, 8" (example).

5. Mapping coverage — 90% of distributable product
   → SYNC COMPLETED
   • Our Content API sync has completed successfully.
   • Total hotels indexed in our database: 287,208 hotels.
   • Please let us know if this meets the 90% coverage threshold, or if we need to expand the sync scope.

6. MTLS security protocol on the entire booking flow
   → IMPLEMENTED
   • Mutual TLS (mTLS) agent is now applied to ALL booking-flow API calls:
     – Booking confirmation (POST /bookings)
     – CheckRate (POST /checkrates)
     – Booking cancellation (DELETE /bookings/{reference})
     – Booking detail (GET /bookings/{reference})
   • Our mTLS config supports both file-based certificates (local dev) and inline PEM environment variables (Render cloud deployment).
   • Reference: Backend/config/mtls.js reads HOTELBEDS_MTLS_CERT, HOTELBEDS_MTLS_KEY, and HOTELBEDS_MTLS_CA.

7. Reading the currency tag
   → IMPLEMENTED
   • The booking.currency field from the Hotelbeds response is captured and stored.
   • Displayed on the voucher as "Booking Currency: EUR" (or whichever currency the booking is confirmed in).
   • The original EUR/USD amount is shown alongside our PKR conversion for customer transparency.

---

RECOMMENDED ITEMS (ALSO IMPLEMENTED)

8. Booking list and booking detail requests
   → IMPLEMENTED
   • GET /api/hotels/bookings — supports filterType, status, date range, clientReference, etc.
   • GET /api/hotels/bookings/{bookingId} — returns full booking details.

9. PULL system for Hotel Confirmation Numbers (HCN)
   → IMPLEMENTED
   • GET /api/hotels/bookings/reconfirmations — integrated with your Reconfirmation API.
   • We can retrieve HCNs via this endpoint for reconciliation.

10. Automatic download of static data via Content API
    → IMPLEMENTED
    • Full automated sync of Hotel Content API data to our MongoDB index.
    • Completed count: 287,208 hotels.
    • Sync script includes retry logic, rate-limit handling, and incremental updates.

---

We believe our integration is now fully compliant with all mandatory certification requirements and includes the recommended features as well. We would appreciate it if you could re-run the certification tests at your earliest convenience.

Please do not hesitate to reach out if you need any additional information, logs, or a live booking example including a child occupancy to verify the children's ages display.

Best regards,

[Your Name]
[Your Title]
Telitrip
Email: [your email]
Website: https://telitrip.com
