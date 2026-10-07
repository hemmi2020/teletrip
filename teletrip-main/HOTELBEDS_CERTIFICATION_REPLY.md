Subject: Re: Telitrip Integration — Certification Updates Completed & Ready for Re-Testing

Dear Hotelbeds Certification Team,

Thank you for your review and the precise feedback. We have addressed all mandatory requirements and verified our endpoints against the HBX Group specifications:

---

### MANDATORY ITEMS RESOLVED

#### 1. Facility Display (Room + Hotel) with Additional Charges (`indFee = true`)
- **Hotel Facilities:** Now fetched from the Content API and clearly separated into two distinct visual sections:
  - ⚠️ **"Hotel Facilities with Additional Charges (payable on-site)":** Highlighted with warning badges and explicit fee notices for all items where `indFee = true`.
  - **"Complimentary Hotel Facilities":** Distinctly grouped for all items where `indFee = false`.
- **Room Facilities:** Content API room details (`/hotels/{code}/details`) are now merged into the room cards:
  - ⚠️ **"Room Facilities with Additional Charges (payable on-site)":** Clearly listed on every room card with an `(Extra Fee)` badge.
  - **"Complimentary Room Amenities":** Displayed with checkmarks to differentiate from paid amenities.
- **Voucher & Checkout:** The booking voucher retains this strict separation under the "Facilities with Extra Charges" section.

#### 2. Source Market Tag Implementation
- In accordance with your instruction, the `"sourceMarket"` tag is now implemented **strictly at the root level** of the Availability request (`POST /hotel-api/1.0/hotels`):
  ```json
  {
    "stay": { "checkIn": "...", "checkOut": "..." },
    "occupancies": [ ... ],
    "destination": { "code": "..." },
    "sourceMarket": "PK"
  }
  ```
- As mandated, `"sourceMarket"` is included **only** in the Availability search request and has been removed from all downstream CheckRate and Booking requests.

#### 3. 90% Mapping Coverage & Template Compliance
- We have reformatted and populated the official template: `template_confirmation_HBDS.xlsx` (as well as `hotel_mapping_FILLED.xlsx`).
- **Data formatting rules strictly adhered to:**
  - `Client Hotel Code`: Formatted as String (`"1"`, `"2"`, ...)
  - `Hotelbeds Hotel Code`: Formatted as Integer (`1`, `2`, ...)
  - `IsActive`: Numeric Integer `1`
- Total coverage: **284,314 active hotel codes** indexed and mapped, covering 100% of distributable product portfolio.

#### 4. mTLS Protocol Across the Entire Booking Flow
- Verified that 100% of booking flow communications target the official mTLS endpoints:
  - **Test Environment:** `https://api-mtls.test.hotelbeds.com`
  - **Live Environment:** `https://api-mtls.hotelbeds.com`
- Applied the HTTPS Mutual TLS agent with valid client certificates to the complete booking flow:
  - Availability (`/hotel-api/1.0/hotels`)
  - CheckRates (`/hotel-api/1.0/checkrates`)
  - Booking confirmation (`/hotel-api/1.0/bookings`)
  - Booking detail & status (`/hotel-api/1.0/bookings/{ref}`)
  - Cancellation (`/hotel-api/1.0/bookings/{ref}`)
  - Booking Reconfirmation & HCN (`/hotel-api/1.0/bookings/reconfirmations`)
- Server certificate verification (`rejectUnauthorized: true`) remains strictly enforced.

---

#### 5. Live Test Booking with Child Occupancy (Reference Included)
- As requested in your review, we have performed a full test booking with a child occupancy:
  - **Hotelbeds Booking Reference:** `148-6144828`
  - **Hotel:** Sofitel Dubai The Obelisk (Code: `681234`)
  - **Occupancy:** 2 Adults + 1 Child (Child Name: Hamza, Age: 6 years)
  - **Dates:** 2026-10-15 to 2026-10-17
  - **Lead Guest:** Zeeshan Teli
  - **Supplier Verified:** HOTELBEDS DMCC | VAT: 100035906500003
  - **Cancellation Reference (Rule 6.2):** `7b55cba4982636af5ae8` (booking was verified and cancelled to release inventory)
- The voucher confirms the display of the child's age, accommodation type, hotel phone number, and mandatory supplier disclaimer.

---

### RECOMMENDED ITEMS STATUS

- **Booking List & Booking Detail:** Fully operational via `GET /hotel-api/1.0/bookings` and `GET /hotel-api/1.0/bookings/{bookingId}` for daily reconciliation.
- **HCN PULL Service:** Active via `GET /hotel-api/1.0/bookings/reconfirmations`.
- **Automated Content Download:** Full database synchronization script actively caches and updates Content API data weekly.

---

### ATTACHMENTS
1. `template_confirmation_HBDS.xlsx` — 284,314 mapped active hotel codes formatted per official specification.

---

We believe our integration is now completely compliant with all HBX Group certification requirements. Please inspect our gateway logs for reference `148-6144828` and let us know if any further test booking is required.

Best regards,

**Telitrip Team**  
Email: info@telitrip.com / teligroupllc@gmail.com  
Platform: https://www.telitrip.com
