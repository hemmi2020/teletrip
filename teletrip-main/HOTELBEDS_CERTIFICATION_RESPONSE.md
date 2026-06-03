# Hotelbeds Certification Response — Telitrip

## 1. Workflow of Requests/Responses

### Distribution Channel
Telitrip operates a single B2C distribution channel — a responsive web application (www.telitrip.com) serving both desktop and mobile users. The API workflow is identical across all viewports.

### When and how many AvailabilityRQ requests will be sent?
- **One Availability request per user search**. When the user submits the search form (destination, check-in/out dates, rooms/occupancy), a single `POST /hotel-api/1.0/hotels` request is made.
- The request includes up to 2,000 hotels (geolocation-based search with 30km radius).
- All rooms for a booking are included in one request using separate occupancy entries (one per room, as per HBX requirement 2.4).
- The Availability request is **never repeated** before CheckRate or Booking.

### When will you use CheckRateRQ?
- CheckRate (`POST /hotel-api/1.0/checkrates`) is called **only when `rateType = "RECHECK"`** in the Availability response.
- If the rate has `rateType = "BOOKABLE"`, CheckRate is skipped entirely and the rateKey is passed directly to Booking.
- Multiple rates can be grouped in a single CheckRate call (up to 10 rates).

### When will you use BookingRQ?
- Booking (`POST /hotel-api/1.0/bookings`) is called **once** when the user confirms checkout.
- The rateKey from Availability (or CheckRate if applicable) is passed unmodified.
- Booking timeout is set to **60 seconds minimum**.
- The holder name and pax information are included per room.

### Workflow Diagram
```
User Search → AvailabilityRQ (1 request, all rooms)
    ↓
User Selects Rate → CheckRateRQ (only if rateType = "RECHECK")
    ↓
User Confirms Booking → BookingRQ (1 request with rateKey)
```

---

## 2. Commercial Decisions

| Decision | Details |
|----------|---------|
| Opaque / Packaging Rates | **Not used**. We do not combine hotel rates with other products. |
| Source Market | **Active**. Set per request. Prices are never shown to a different market. |
| Rate Types | All rate types displayed (BOOKABLE and RECHECK). |
| Room Types | All room types displayed without exclusions. |
| Board Types | All board types displayed without exclusions. |
| Hotels | Full portfolio displayed — no hotel exclusions. |
| Destinations | No destination exclusions. |
| Cancellation Policies | HBX Group policies displayed as-is to the customer, unmodified. |
| Selling Rates | `hotelMandatory` attribute respected when present. |
| Opaque Rates Check | `packaging: true` rates are not used. |

---

## 3. Certification URL

**URL:** https://www.telitrip.com

---

## 4. User and Password

No login credentials are required. The certification team can sign up directly at www.telitrip.com using any email address. Registration is instant.

---

## 5. Payment Information

Payment is handled via HBL Pay (Pakistan payment gateway) for card payments, and "Pay on Site" (AT_HOTEL) for pay-at-hotel rates. No payment is needed to complete the certification test booking — use a refundable rate with dates 6 months in advance and cancel after verification.

---

## 6. Language

The platform is in **English**. No guide needed.

---

## 7. Identifying Hotelbeds Products

Telitrip uses **only Hotelbeds (HBX Group)** as the hotel supplier. All hotel results on the platform are sourced exclusively from the Hotelbeds Hotel API Suite. There are no other hotel suppliers integrated. The same applies to Transfers (Hotelbeds Transfers API) and Activities (Hotelbeds Activities API).

---

## 8. Other Relevant Aspects

- **GZIP compression** is enabled on all API requests.
- **Non-breaking changes** are fully supported (no XSD validation, flexible JSON parsing).
- **Content API** is integrated — hotel content (images, descriptions, facilities, categories, room types, board types) is cached and refreshed weekly.
- **Voucher generation** includes all mandatory fields (hotel name, address, phone, holder name, pax per room, children ages, booking reference, dates, room type, board type, rate comments, payment disclaimer).
- **Cancellation policies** are displayed to the customer before booking confirmation with dates in destination timezone.
- **Rate comments** are retrieved via `rateCommentsId` from the Content API and displayed before confirmation.
- **Multi-room bookings** are fully supported with per-room occupancy configuration (Bedsonline-style UI).

---

## 9. Test Booking (to be performed)

Once we perform the test booking as requested (multi-room, different occupancies, at least one child), we will provide:

1. Full request/response logs for:
   - AvailabilityRQ / AvailabilityRS
   - CheckRateRQ / CheckRateRS (if applicable)
   - BookingRQ / BookingRS
   - CancellationRQ / CancellationRS

2. Screenshots and/or video of the booking process

3. The booking voucher

4. The completed attached file

---

## Contact Information

| Role | Contact |
|------|---------|
| Managing Director | Rahil Teli |
| Email | teligroupllc@gmail.com |
| Development Team | Zeeshan Javed — zeeshan@tmrhino.com — +92 321 2950 780 |
| Platform URL | www.telitrip.com |
