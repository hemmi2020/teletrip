# Tasks: Mobile UX Overhaul

## Task List

- [x] 1. Create BottomNavBar component
  - [x] 1.1 Create `src/components/BottomNavBar.jsx` with five tabs: Home, Search, Bookings, Account, Cart
  - [x] 1.2 Apply active-tab highlighting using `useLocation` from react-router-dom
  - [x] 1.3 Wire Cart tab to dispatch the existing `openCart` window event
  - [x] 1.4 Add cart item count badge using `useCart().getTotalItems()`
  - [x] 1.5 Apply `pb-safe` / `env(safe-area-inset-bottom)` padding for iOS home indicator
  - [x] 1.6 Hide component on `md+` with `md:hidden`

- [x] 2. Update Header for mobile
  - [x] 2.1 Remove hamburger menu button on mobile (hide with `md:hidden` on the toggle button)
  - [x] 2.2 Show only logo and cart icon on mobile; keep full desktop nav on `md+`
  - [x] 2.3 Ensure cart badge in header stays in sync with cart state

- [x] 3. Mobile-optimise HotelSearchForm
  - [x] 3.1 Make tab bar horizontally scrollable (`overflow-x-auto flex-nowrap`) on mobile
  - [x] 3.2 Set all input fields to `w-full min-h-[44px] text-base` on mobile
  - [x] 3.3 Render date picker inside `BottomSheet` on mobile (detect via `window.innerWidth < 768` or CSS media query state)
  - [x] 3.4 Render guest/traveller picker inside `BottomSheet` on mobile
  - [x] 3.5 Make location autocomplete dropdown full-width with `max-h-60 overflow-y-auto`
  - [x] 3.6 Make search submit button full-width on mobile

- [x] 4. Build MobileFilterDrawer component
  - [x] 4.1 Create `src/components/MobileFilterDrawer.jsx` extending `BottomSheet.jsx` with sticky header and footer
  - [x] 4.2 Add "Reset" and "Apply Filters" buttons in sticky footer
  - [x] 4.3 Set `max-h-[85vh]` and internal scroll on the content area
  - [x] 4.4 Close drawer on backdrop tap without applying changes

- [x] 5. Integrate MobileFilterDrawer into search results pages
  - [x] 5.1 In `HotelSearchResults.jsx`: hide sidebar on `< lg`, add Filter FAB, wire `MobileFilterDrawer`
  - [x] 5.2 In `ActivitySearchResults.jsx`: hide sidebar on `< lg`, add Filter FAB, wire `MobileFilterDrawer`
  - [x] 5.3 In `TransferSearch.jsx`: hide sidebar on `< lg`, add Filter FAB, wire `MobileFilterDrawer`
  - [x] 5.4 Position Filter FAB sticky at bottom-right (`fixed bottom-20 right-4 z-50 md:hidden`)

- [x] 6. Reflow search result cards for mobile
  - [x] 6.1 Update hotel result cards in `HotelSearchResults.jsx` to stacked layout on mobile
  - [x] 6.2 Update activity result cards in `ActivitySearchResults.jsx` to stacked layout on mobile
  - [x] 6.3 Update transfer result cards in `TransferSearch.jsx` to stacked layout on mobile
  - [x] 6.4 Ensure CTA buttons are `w-full min-h-[44px]` on mobile across all card types

- [x] 7. Build FullScreenModal component
  - [x] 7.1 Create `src/components/FullScreenModal.jsx` with `fixed inset-0` on mobile, centred overlay on `md+`
  - [x] 7.2 Add sticky header (back/close button + title) and sticky footer (primary action slot)
  - [x] 7.3 Implement swipe-down-to-dismiss gesture (touch delta > 80 px when scrollTop === 0)
  - [x] 7.4 Apply scroll lock on `document.body` when open; restore on close/unmount

- [x] 8. Replace booking modals with FullScreenModal on mobile
  - [x] 8.1 Wrap hotel room booking modal in `HotelSearchResults.jsx` / `HotelDetails.jsx` with `FullScreenModal`
  - [x] 8.2 Wrap experience booking modal in `ActivitySearchResults.jsx` / `ActivityDetails.jsx` with `FullScreenModal`
  - [x] 8.3 Wrap transfer booking modal in `TransferSearch.jsx` with `FullScreenModal`

- [x] 9. Update SlideOutCart for mobile
  - [x] 9.1 Change cart panel width to `w-full sm:w-[440px]` (already partially done — verify and fix)
  - [x] 9.2 Update cart item rows to stacked layout on mobile
  - [x] 9.3 Ensure remove button has `p-3` (44 px touch target)
  - [x] 9.4 Make cart footer sticky with full-width "Proceed to Checkout" button on mobile

- [x] 10. Update Checkout page for mobile
  - [x] 10.1 Change billing form grid to `grid-cols-1 md:grid-cols-2`
  - [x] 10.2 Set all inputs to `w-full min-h-[44px] text-base`
  - [x] 10.3 Wrap order summary in a collapsible accordion component on mobile
  - [x] 10.4 Make payment method selector cards full-width on mobile
  - [x] 10.5 Make "Place Order" button `w-full min-h-[52px]` and sticky at bottom on mobile

- [x] 11. Update AccountDashboard for mobile
  - [x] 11.1 Hide sidebar tab navigation on `< lg` (`hidden lg:flex`)
  - [x] 11.2 Add horizontal scrollable tab bar visible on `< lg` (`flex lg:hidden overflow-x-auto`)
  - [x] 11.3 Set each mobile tab to `min-w-[80px] min-h-[44px]`
  - [x] 11.4 Change stats cards grid to `grid-cols-2 lg:grid-cols-4`
  - [x] 11.5 Remove sidebar gutter from content area on mobile

- [x] 12. Global touch target and overflow audit
  - [x] 12.1 Audit all interactive elements across all pages and apply `min-h-[44px]` where missing
  - [x] 12.2 Audit all text inputs and apply `text-base` (16 px) where missing
  - [x] 12.3 Test all pages at 320 px, 375 px, and 414 px viewport widths for horizontal overflow and fix any issues found
  - [x] 12.4 Verify all modal/drawer/cart animations use CSS transforms and complete within 300 ms
