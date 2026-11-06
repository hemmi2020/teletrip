// Realistic hotel search fixtures for Design Lab exploration
export const mockSearchParams = {
  destination: "Dubai, United Arab Emirates (DXB)",
  checkIn: "2026-11-15",
  checkOut: "2026-11-18",
  nights: 3,
  rooms: 1,
  adults: 2,
  children: 0
};

export const mockHotels = [
  {
    id: "107748",
    code: "107748",
    name: "Tulip Hotel Apartment",
    category: "3 STARS",
    stars: 3,
    isLuxuryCollection: false,
    address: "Al Mankhool, Bur Dubai",
    zone: "Bur Dubai",
    distanceKm: 1.2,
    rating: 4.3,
    reviewsCount: 382,
    reviewHighlight: "Super clean studios with great kitchenettes near Metro",
    thumbnail: "https://photos.hotelbeds.com/giata/bigger/10/107748/107748a_hb_ro_040.jpg",
    images: [
      "https://photos.hotelbeds.com/giata/original/10/107748/107748a_hb_ro_040.jpg",
      "https://photos.hotelbeds.com/giata/original/10/107748/107748a_hb_ro_041.jpg",
      "https://photos.hotelbeds.com/giata/original/10/107748/107748a_hb_f_002.jpg",
      "https://photos.hotelbeds.com/giata/original/10/107748/107748a_hb_a_001.jpg"
    ],
    priceAED: 606,
    pricePKR: 46150,
    pricePerNightAED: 202,
    pricePerNightPKR: 15383,
    hasFreeCancellation: true,
    freeCancellationDate: "Free cancellation until Nov 12",
    breakfastIncluded: false,
    boardName: "Room Only",
    amenities: ["WIFI", "POOL", "GYM", "KITCHEN", "PARKING"],
    roomsAvailable: [
      { name: "Studio Premium", code: "STU.ST", priceAED: 606, ratesCount: 4 },
      { name: "One Bedroom Apartment", code: "APT.B1", priceAED: 820, ratesCount: 6 }
    ],
    coordinates: { lat: 25.2532, lng: 55.2974 }
  },
  {
    id: "6807",
    code: "6807",
    name: "Towers Rotana Dubai",
    category: "4 STARS",
    stars: 4,
    isLuxuryCollection: false,
    address: "Sheikh Zayed Road, Financial Centre",
    zone: "Sheikh Zayed Road",
    distanceKm: 0.4,
    rating: 4.6,
    reviewsCount: 1240,
    reviewHighlight: "Exceptional skyline views and 5-star breakfast buffet",
    thumbnail: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg",
    images: [
      "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
    ],
    priceAED: 1245,
    pricePKR: 94820,
    pricePerNightAED: 415,
    pricePerNightPKR: 31607,
    hasFreeCancellation: true,
    freeCancellationDate: "Free cancellation until Nov 14",
    breakfastIncluded: true,
    boardName: "Bed & Breakfast",
    amenities: ["WIFI", "POOL", "SPA", "GYM", "RESTAURANT", "METRO"],
    promos: ["Autumn Flash Sale - 15% OFF"],
    roomsAvailable: [
      { name: "Double Guest Room", code: "DBL.ST", priceAED: 1245, ratesCount: 8 },
      { name: "Twin Deluxe City View", code: "TWN.DX", priceAED: 1410, ratesCount: 6 }
    ],
    coordinates: { lat: 25.2166, lng: 55.2753 }
  },
  {
    id: "99214",
    code: "99214",
    name: "SLS Dubai Hotel & Residences",
    category: "5 STARS",
    stars: 5,
    isLuxuryCollection: true,
    address: "Business Bay, Marasi Drive",
    zone: "Business Bay / Downtown",
    distanceKm: 1.8,
    rating: 4.8,
    reviewsCount: 890,
    reviewHighlight: "World's highest infinity pool overlooking Burj Khalifa",
    thumbnail: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
    ],
    priceAED: 2480,
    pricePKR: 188870,
    pricePerNightAED: 827,
    pricePerNightPKR: 62957,
    hasFreeCancellation: true,
    freeCancellationDate: "Free cancellation until Nov 13",
    breakfastIncluded: true,
    boardName: "Bed & Breakfast (A La Carte)",
    amenities: ["WIFI", "INFINITY POOL", "LUXURY SPA", "ROOFTOP BAR", "VALET", "GYM"],
    promos: ["Luxury Escapes Exclusive Credit"],
    roomsAvailable: [
      { name: "Signature King Suite Burj View", code: "SUI.BV", priceAED: 2480, ratesCount: 5 },
      { name: "Duplex Suite with Terrace", code: "DUP.LX", priceAED: 3650, ratesCount: 3 }
    ],
    coordinates: { lat: 25.1852, lng: 55.2891 }
  },
  {
    id: "54201",
    code: "54201",
    name: "Kempinski Central Avenue Dubai",
    category: "5 STARS",
    stars: 5,
    isLuxuryCollection: true,
    address: "Downtown Dubai, Direct Dubai Mall Access",
    zone: "Downtown Dubai",
    distanceKm: 0.1,
    rating: 4.9,
    reviewsCount: 2150,
    reviewHighlight: "Unbeatable location inside Dubai Mall with direct fashion avenue access",
    thumbnail: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"
    ],
    priceAED: 3150,
    pricePKR: 239900,
    pricePerNightAED: 1050,
    pricePerNightPKR: 79967,
    hasFreeCancellation: true,
    freeCancellationDate: "Free cancellation until Nov 10",
    breakfastIncluded: true,
    boardName: "Gourmet Breakfast Included",
    amenities: ["WIFI", "DIRECT MALL ACCESS", "POOL", "SPA", "CONCIERGE", "BUTLER SERVICE"],
    roomsAvailable: [
      { name: "Grand Deluxe Room Downtown", code: "GDL.DT", priceAED: 3150, ratesCount: 6 },
      { name: "Executive Suite Fountain View", code: "EXE.FT", priceAED: 4890, ratesCount: 4 }
    ],
    coordinates: { lat: 25.1972, lng: 55.2796 }
  }
];

export const mockQuickFilters = [
  { id: "all", label: "All Properties", icon: "🏢" },
  { id: "luxury", label: "✨ Luxury Collection", count: 18, activeColor: "amber" },
  { id: "free_cancel", label: "🛡️ Free Cancellation", count: 42, activeColor: "emerald" },
  { id: "breakfast", label: "🍳 Breakfast Included", count: 35, activeColor: "blue" },
  { id: "5stars", label: "⭐ 5 Stars Only", count: 14, activeColor: "amber" },
  { id: "pool", label: "🏊 Swimming Pool", count: 56, activeColor: "blue" },
  { id: "downtown", label: "📍 Downtown / Burj", count: 23, activeColor: "purple" }
];

export const DUBAI_HOTEL_FIXTURES = mockHotels;


