# Requirements: Mobile UX Overhaul

## Introduction

TeleTrip is a desktop-first travel booking platform. This feature delivers a comprehensive mobile-first responsive redesign of all user-facing pages and components. The goal is to make every interaction touch-friendly, visually clear, and fully functional on screens from 320 px wide, without breaking any existing desktop behaviour.

All changes are confined to the React/Vite frontend. No backend API contracts, routing, or data models change.

---

## Requirements

### Requirement 1: Bottom Navigation Bar

**User Story**: As a mobile user, I want a persistent bottom navigation bar so that I can quickly switch between the main sections of the app without hunting for a hamburger menu.

#### Acceptance Criteria

1.1 WHEN the viewport width is less than 768 px (below `md` breakpoint) THEN a `BottomNavBar` component SHALL be visible, fixed to the bottom of the screen, above all other content.

1.2 WHEN the viewport width is 768 px or greater THEN the `BottomNavBar` SHALL be hidden and the existing desktop header navigation SHALL be visible.

1.3 The `BottomNavBar` SHALL contain five tabs: Home, Search, Bookings, Account, and Cart.

1.4 WHEN the user is on a page matching a tab's route THEN that tab SHALL be visually highlighted with the brand blue colour.

1.5 WHEN the Cart tab is tapped THEN the `SlideOutCart` panel SHALL open.

1.6 WHEN the cart contains one or more items THEN the Cart tab SHALL display a numeric badge showing the item count.

1.7 The `BottomNavBar` SHALL respect the device safe-area inset at the bottom (using `env(safe-area-inset-bottom)`) so it does not overlap the iOS home indicator.

---

### Requirement 2: Simplified Mobile Header

**User Story**: As a mobile user, I want a clean, uncluttered top header so that the page content is not obscured by navigation chrome.

#### Acceptance Criteria

2.1 WHEN the viewport is below `md` THEN the top header SHALL display only the TeleTrip logo (left) and the cart icon with badge (right).

2.2 WHEN the viewport is below `md` THEN the hamburger menu button SHALL NOT be rendered.

2.3 The cart icon in the header SHALL show the same item count badge as the `BottomNavBar` Cart tab.

---

### Requirement 3: Mobile-Optimised Search Form

**User Story**: As a mobile user, I want the search form tabs and fields to be easy to tap and read so that I can search for stays, experiences, and transfers without pinching or zooming.

#### Acceptance Criteria

3.1 The tab bar (Stays / Experiences / Transfers) SHALL be horizontally scrollable on mobile and SHALL NOT wrap to a second line.

3.2 All input fields within the search form SHALL have a minimum height of 44 px and a font size of at least 16 px on mobile.

3.3 All input fields SHALL be full-width (`w-full`) on mobile.

3.4 WHEN a date field is tapped on a mobile viewport THEN the date picker SHALL open as a `BottomSheet` component rather than an inline popover.

3.5 WHEN the guest/traveller picker is tapped on a mobile viewport THEN it SHALL open as a `BottomSheet` component.

3.6 Location autocomplete dropdowns SHALL be full-width and scrollable (`max-h-60 overflow-y-auto`) on mobile.

3.7 The search submit button SHALL be full-width on mobile.

---

### Requirement 4: Mobile Filter Drawer

**User Story**: As a mobile user browsing search results, I want to access and apply filters through a bottom sheet so that I don't have to scroll past a hidden sidebar.

#### Acceptance Criteria

4.1 On search results pages (Hotels, Activities, Transfers), WHEN the viewport is below `lg` THEN the sidebar filter panel SHALL be hidden.

4.2 A "Filters" floating action button SHALL be visible on mobile search results pages, positioned sticky at the bottom-right of the viewport.

4.3 WHEN the "Filters" FAB is tapped THEN a `MobileFilterDrawer` bottom sheet SHALL slide up, containing all filter options.

4.4 The `MobileFilterDrawer` SHALL have a maximum height of 85 vh and SHALL be internally scrollable.

4.5 The `MobileFilterDrawer` SHALL have a sticky header (title + close button) and a sticky footer with "Reset" and "Apply Filters" buttons.

4.6 WHEN "Apply Filters" is tapped THEN the drawer SHALL close and the search results SHALL update to reflect the selected filters.

4.7 WHEN "Reset" is tapped THEN all filter selections SHALL be cleared.

4.8 WHEN the backdrop overlay is tapped THEN the drawer SHALL close without applying changes.

---

### Requirement 5: Mobile Search Result Cards

**User Story**: As a mobile user, I want search result cards to display clearly on my screen so that I can compare options without horizontal scrolling.

#### Acceptance Criteria

5.1 On mobile, each search result card SHALL use a stacked vertical layout: image on top (full-width, `aspect-[16/9]`), content below.

5.2 On desktop (`md+`), the existing horizontal card layout (image left, content right) SHALL be preserved.

5.3 The price and primary CTA button SHALL always be visible at the bottom of each card on mobile.

5.4 The primary CTA button ("Book" / "Add to Cart") SHALL have a minimum height of 44 px and be full-width on mobile.

5.5 No card SHALL cause horizontal overflow of the viewport at any supported screen width (≥ 320 px).

---

### Requirement 6: Full-Screen Booking Modals

**User Story**: As a mobile user, I want booking modals (hotel room, experience, transfer) to use the full screen so that I can read all details and complete the booking comfortably.

#### Acceptance Criteria

6.1 WHEN a booking modal is opened on a mobile viewport (below `md`) THEN it SHALL render as a full-screen bottom sheet (`fixed inset-0`, slides up from bottom).

6.2 WHEN a booking modal is opened on a desktop viewport (`md+`) THEN it SHALL render as the existing centred overlay modal.

6.3 The full-screen modal SHALL have a sticky header containing a back/close button and the modal title.

6.4 The full-screen modal SHALL have a sticky footer containing the primary action button, which SHALL be full-width on mobile.

6.5 WHEN the user swipes down with a touch delta greater than 80 px AND the modal content is scrolled to the top THEN the modal SHALL dismiss.

6.6 WHEN a modal is open THEN `document.body` scroll SHALL be locked; WHEN the modal closes THEN scroll SHALL be restored.

---

### Requirement 7: Mobile-Friendly Cart Panel

**User Story**: As a mobile user, I want the cart slide-out panel to use the full screen so that I can review and manage my items without a cramped side panel.

#### Acceptance Criteria

7.1 WHEN the cart panel is open on a mobile viewport THEN it SHALL occupy the full viewport width and height.

7.2 On desktop (`sm+`) the cart panel SHALL retain its existing `440 px` fixed width.

7.3 Cart item rows SHALL use a stacked layout on mobile (image top, details and remove button below).

7.4 The remove item button SHALL have a minimum touch target of 44 × 44 px.

7.5 The cart footer (total price + "Proceed to Checkout" button) SHALL be sticky at the bottom of the cart panel.

7.6 The "Proceed to Checkout" button SHALL be full-width on mobile.

---

### Requirement 8: Mobile Checkout Form

**User Story**: As a mobile user, I want the checkout form to be easy to fill in on a small screen so that I can complete my booking without frustration.

#### Acceptance Criteria

8.1 The checkout billing form SHALL use a single-column layout on mobile and a two-column grid on `md+`.

8.2 All form inputs SHALL have a minimum height of 44 px and font size of at least 16 px on mobile.

8.3 The order summary section SHALL collapse to an accordion on mobile, with a tap-to-expand interaction.

8.4 Payment method selector cards SHALL be full-width on mobile.

8.5 The "Place Order" CTA button SHALL be full-width and have a minimum height of 52 px on mobile.

8.6 The "Place Order" CTA button SHALL be sticky at the bottom of the viewport on mobile.

---

### Requirement 9: Mobile Account Dashboard

**User Story**: As a mobile user, I want to navigate my account dashboard easily so that I can view bookings, profile, and settings without a sidebar taking up screen space.

#### Acceptance Criteria

9.1 WHEN the viewport is below `lg` THEN the sidebar tab navigation in `AccountDashboard` SHALL be hidden.

9.2 WHEN the viewport is below `lg` THEN a horizontal scrollable tab bar SHALL be displayed at the top of the dashboard content area.

9.3 Each tab in the mobile tab bar SHALL have a minimum width of 80 px and a minimum height of 44 px.

9.4 The dashboard stats cards SHALL use a two-column grid on mobile and a four-column grid on `lg+`.

9.5 The content area SHALL be full-width on mobile with no sidebar gutter.

---

### Requirement 10: Universal Touch & Accessibility Standards

**User Story**: As a mobile user, I want every interactive element to be easy to tap and readable so that I never accidentally tap the wrong thing or need to zoom in.

#### Acceptance Criteria

10.1 Every interactive element (buttons, links, inputs, checkboxes, radio buttons) SHALL have a minimum touch target size of 44 × 44 px on mobile.

10.2 All text inputs and textareas SHALL have a font size of at least 16 px on mobile to prevent automatic zoom on iOS.

10.3 No page or component SHALL produce horizontal scroll (scrollWidth > clientWidth) at viewport widths of 320 px, 375 px, or 414 px.

10.4 All existing desktop layouts and functionality SHALL remain unchanged after the mobile overhaul is applied.

10.5 All animations (modal slide-up, drawer slide-up, cart slide-in) SHALL use CSS transforms for GPU-accelerated rendering and SHALL complete within 300 ms.
