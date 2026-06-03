# Pre-Development Questionnaire — Answers for Telitrip

Copy these answers into the corresponding cells of the Word document.

---

## Loading and mapping Hotelbeds Hotels

**Will you match Hotelbeds hotels with other current or future suppliers in your system?**
> No. Telitrip uses Hotelbeds as the sole hotel supplier. No matching with other suppliers is needed.

**Describe the process of loading and mapping Hotelbeds hotels into your local database.**
> We use the Hotelbeds Content API to fetch hotel data (details, images, facilities, descriptions, categories). Hotels are stored in our MongoDB database keyed by the Hotelbeds hotel code. The Content API data is refreshed weekly via an automated job.

**Will you be matching room types between different suppliers? If so, please describe the process.**
> No. Since we use only Hotelbeds, there is no need to match room types between suppliers. Room codes and names from the Availability response are displayed directly.

**What is the frequency you are going to map and update your hotel's local database?**
> Weekly. Our content database is refreshed every 7 days from the Content API.

---

## Content

**Will you be using all of Hotelbeds' content for your system? If not, please specify which details you will get from other sources.**
> Yes, we use all of Hotelbeds' content — descriptions, images, facilities, categories, room types, board types, points of interest, and rate comments. No content from other sources is mixed with Hotelbeds data.

---

## Searching Flow

**Describe how you will search hotels in requests to our system.**
> We use Geolocation-based search. When a user searches for a destination, we geocode the city name to latitude/longitude coordinates and send a geolocation search with a 30km radius. Up to 2,000 hotels are returned per request.

**How do you plan to search our system?**
> Geolocation (latitude/longitude with radius). We geocode the user's destination city/country input.

**Do you plan to cater to customers from different origin markets?**
> Yes. We set the sourceMarket parameter per request based on the customer's location. Prices obtained for one source market are never shown to customers from a different market.

**Which extra search filters do you intend to implement?**
> Price range (min/max), Hotel category (stars), Board type, Room type, Payment type (AT_HOTEL/AT_WEB), Accommodation type, Cancellation policy (free/partial/non-refundable), Zone, Hotel chain, Promotions, Amenities (WiFi, Pool, etc.), Hotel name text search.

**Will you be using our opaque rates?**
> No. We do not use opaque/packaging rates. We do not combine hotel rates with other products (flights, transfers, car rentals).

**Describe the default sort option of your search results.**
> Default sort is "Recommended" (the order returned by the API). Users can also sort by: Price Low to High, Price High to Low, Rating High to Low, Rating Low to High.

**In case you get the same hotels from more than one supplier - how do you choose which supplier to display?**
> Not applicable. Hotelbeds is our only hotel supplier.

**Exclusive Deal: Will you indicate "Best Value" attribute on your website?**
> Yes. We display the `exclusiveDeal` attribute as a highlighted badge on hotel cards when present.

**Do you plan to display discounts, promotions, and supplements?**
> Yes. Promotions and offers from the `promotions` and `offers` arrays in the rate response are displayed as tags/badges on room rates (e.g., "Non-refundable rate", "Early booking discount").

**Do you plan on displaying inclusive tax amounts separately from the Rate Amount? (USA/Canada)**
> No. We display the total inclusive rate amount.

**Do you plan on displaying excluded tax amounts separately from the Rate Amount?**
> No. We display the total rate as returned by the API.

**The use of GZip compression in your Availability Requests to our System is a requirement, can you comply with this?**
> Yes. All API requests include `Accept-Encoding: gzip` header. GZIP compression is enabled.

**What is the expected Queries Per Second (QPS) your system will make to APItude once you go live?**
> Initially low — estimated 5-10 QPS. Expected to grow to 20-50 QPS as traffic increases.

---

## Cancellation

**Describe how you intend to implement cancellation flow.**
> 1. User clicks "Cancel Booking" in their dashboard.
> 2. We first call the cancellation endpoint with `cancellationFlag=SIMULATION` to preview fees.
> 3. The cancellation fee (or "free cancellation") is displayed to the user.
> 4. User confirms → we call with `cancellationFlag=CANCELLATION`.
> 5. Cancellation reference is stored and displayed. Refund is processed accordingly.

**Do you plan to show Hotelbeds' cancellation policy?**
> Yes. Cancellation policies are displayed to the customer before booking confirmation. Dates and times are shown in the destination timezone as provided by the API. Policies are never altered.

---

## Booking Flow

**Describe the booking flow you intend to implement.**
> 1. User searches (AvailabilityRQ — one request).
> 2. User selects a hotel and views rooms.
> 3. User selects a room+rate. If rateType = "RECHECK", CheckRateRQ is called. Otherwise skipped.
> 4. User enters guest details (holder name, pax per room, children ages).
> 5. User confirms → BookingRQ is sent with the rateKey (60s timeout).
> 6. Booking confirmed → voucher generated and emailed.

**Will your system make multi room bookings?**
> Yes. We support multi-room bookings with per-room occupancy configuration (up to 6 rooms). All rooms are sent in a single Availability request with separate occupancy entries.

**How do you deal with price change during the booking process?**
> If CheckRate returns a different price than Availability, we display the updated price to the user before they confirm. The user can accept the new price or search again.

**In cases where the room was available in the first search results but during the booking, the room is not available anymore?**
> If the BookingRQ returns an "Insufficient allotment" error, we display a user-friendly message: "This room is no longer available. Please search again." and redirect the user back to search results.

**Do you plan to provide a voucher (proof of purchase) for the hotel booking?**
> Yes. A voucher is automatically generated for every confirmed booking. It includes: hotel name, address, phone, category, destination; holder name, pax per room, children ages; booking reference, agency reference, check-in/out dates, room type, board type, rate comments; payment disclaimer ("Payable through [Supplier], acting as agent...").

---

## Caching

**Do you cache hotel detail data? If yes, how often do you update it?**
> Yes. Hotel content (descriptions, images, facilities, categories) is cached in MongoDB and updated weekly from the Content API.

**Do you cache rates and availability? If yes, how often do you update it?**
> No. Rates and availability are never cached. Every search triggers a fresh AvailabilityRQ to the Hotelbeds API in real-time.
