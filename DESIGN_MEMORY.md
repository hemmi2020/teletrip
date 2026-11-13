# Design Memory: Telitrip

## Brand Tone & Aesthetic
- **Adjectives:** Balanced, Premium, Trustworthy, Modern, Transparent, Luxury-Focused.
- **Visual Design Rules:**
  - Zero negative/dead whitespace on hero search modules; compact single-row layouts preferred.
  - Generous card borders (`border-gray-200` to `border-gray-100`) with subtle ambient shadows (`shadow-xs` to `shadow-xl`).
  - High-contrast typography: Dark headings (`text-gray-900 font-extrabold`) with clean metadata captions (`text-gray-500 font-semibold`).
  - Clear separation of complimentary perks vs mandatory on-site payable taxes (Hotelbeds certification compliance).

---

## Winning Design Lab Architectures (Style 1 / Option A Across Suite)

### 1. Landing Page Hero Search (`HotelSearchForm.jsx`)
- **Architecture:** **Bedsonline Unified Single Field (Option 1)**
- **Grid Layout:** Single-row `md:grid-cols-12` across Stays, Transfers, and Experiences tabs.
- **Key Elements:**
  - Destination & Hotel Name combined search input with categorized autosuggest.
  - Dual date range picker with flexible night calculations.
  - Passenger & room popover with child age selectors.
  - Lower reassurance bar with wholesale rate guarantee and verified voucher badges.

### 2. Hotel Search Results (`HotelSearchResults.jsx`)
- **Architecture:** **Option A (Information Hierarchy & Luxury Clarity)**
- **Page Layout:** Native 12-column responsive layout (`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start`).
  - **No fixed sidebar** or floating pill overlays that obscure content.
  - **Top Minimal Search Bar Summary:** Destination, dates, nights, guests, rooms, mobile filter trigger, and expandable modify-search form.
  - **Left Sticky Filter Sidebar (`lg:col-span-4 xl:col-span-3 sticky top-24`):** Luxury Collection toggle, Free Cancellation toggle, Star ratings, Price range, Board types, Zones, and Amenities.
  - **Right Column:** Quick-filter chips bar + Results header with sort dropdown and View Changer buttons (`List` vs `2-Col Grid`).
  - **2-Column Grid:** Maintains two columns even on mobile screens (`grid-cols-2`) for maximum screen density and rapid scanning.
  - **Mobile Drawer:** Floating mobile filter FAB (`lg:hidden`) triggering `MobileFilters` sheet.

### 3. Cart & Checkout Flow (`Checkout.jsx` & `/cart`)
- **Architecture:** **Style 1 (Split-Screen & Inventory Hold Timer)**
- **Layout:**
  - **Top Banner:** 15-minute live inventory hold countdown timer holding wholesale room rates.
  - **Left Column (`lg:col-span-7`):** Selected Property Card (high-res photo, dates, nights, room tier, cancellation badge) + Primary Guest Information card + TeleTrip Guarantee notice.
  - **Right Column (`lg:col-span-5`):** Payment Options card placed strictly **ON TOP** of Fare Breakdown & Taxes in desktop mode.
  - **Route:** `/cart` automatically redirects to `/checkout`.

### 4. Hotel Detail Modal & Guest Reviews (`HotelDetailModal.jsx`)
- **Architecture:** **Segmented Tabbed Luxury Hub with Style 1 Sentiment Dashboard**
- **Tabs:** Rooms & Rates, Hotel Highlights, Facilities & Amenities, Policies & Taxes, and **Guest Reviews & Ratings**.
- **Reviews Features (Style 1):**
  - Verified guest score badge and TripAdvisor rating banner.
  - Category sub-rating progress bars (Location, Cleanliness, Comfort, Service, Value).
  - Rating distribution curve (5-star down to 1-star).
  - Sentiment topic chips (Views, Breakfast, Pool & Spa, Family, Service).
  - Filtered traveler review list with verified stay badges and helpful vote counters.
- **Room Booking:** Category shortcuts (*Studios*, *Deluxe*, *Suites*) to eliminate long scroll, expand/collapse all rate accordions, and persistent bottom action dock.

---

## Design Tokens & Styling Conventions
- **Framework:** React 19 + Vite + Tailwind CSS v4 + React Router v7.
- **Icons:** `lucide-react`.
- **Primary Brand Color:** `blue-600` (`#2563eb`) with `blue-50` subtle tint backdrops.
- **Luxury Badges:** Black/80 background with amber border and text (`text-amber-300 border-amber-400/50`).
- **Free Cancellation:** `emerald-600` / `emerald-50` with `ShieldCheck` icon.
- **Local Excluded Taxes Alert:** `amber-50` border `border-amber-200` with `AlertCircle`.
- **Corner Radii:** `rounded-2xl` for primary cards and modals, `rounded-xl` for interactive inputs and tabs, `rounded-full` for chips and FAB buttons.
