import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Star,
  MapPin,
  Wifi,
  Coffee,
  Car,
  Waves as Pool,
  Dumbbell as Gym,
  Utensils as Restaurant,
  Sparkles as Spa,
  User,
  ImageIcon,
  Heart,
  ChevronDown,
  Filter,
  X,
  MessageSquare, 
  ThumbsUp,
  ShoppingCart,
  Bed,
  Tag,
  Info,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ReviewsModal from "./components/ReviewsModal";
import { useCart } from "./components/CartSystem";


const RatingCircles = ({ rating, size = 'w-5 h-5' }) => {
  const numRating = Number(rating) || 0;
  const filledCircles = Math.round(numRating);
  
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`${size} rounded-full ${
            i < filledCircles ? 'bg-green-600' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

const HotelSearchResults = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedAccommodationTypes, setSelectedAccommodationTypes] = useState([]);
  const [hotelNameSearch, setHotelNameSearch] = useState("");
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedReviewRatings, setSelectedReviewRatings] = useState([]);
  const [selectedCancellation, setSelectedCancellation] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedChains, setSelectedChains] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState([]);
  const [selectedPackaging, setSelectedPackaging] = useState("");
  const [selectedSight, setSelectedSight] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    hotelName: true,
    board: true,
    category: true,
    reviews: true,
    cancellation: true,
    price: true,
    zone: true,
    accommodationType: true,
    amenities: true,
    promos: true,
    discounts: true,
    chain: true,
    establishment: true,
    packaging: true,
    sortBy: true,
  });
  const [hotelReviews, setHotelReviews] = useState({});
const [expandedReviews, setExpandedReviews] = useState({});
const [loadingReviews, setLoadingReviews] = useState({});
const [reviewsModal, setReviewsModal] = useState({
  isOpen: false,
  hotelId: null,
  hotelName: null
});
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);

  // Available amenities and accommodation types
  const availableAmenities = [
    { id: "WIFI", name: "WiFi", icon: Wifi },
    { id: "BREAKFAST", name: "Breakfast", icon: Coffee },
    { id: "PARKING", name: "Parking", icon: Car },
    { id: "POOL", name: "Pool", icon: Pool },
    { id: "GYM", name: "Gym", icon: Gym },
    { id: "SPA", name: "Spa", icon: Spa },
    { id: "RESTAURANT", name: "Restaurant", icon: Restaurant },
  ];

  const accommodationTypes = [
    { id: "H", name: "Hotel" },
    { id: "P", name: "Aparthotel" },
    { id: "A", name: "Apartment" },
    { id: "W", name: "Resort" },
    { id: "Q", name: "Boutique" },
  ];

  const convertCountryCode = (code) => {
  const countryMap = {
    // A‑codes
    AFG: "Afghanistan",
    ALB: "Albania",
    DZA: "Algeria",
    ASM: "American Samoa",
    AND: "Andorra",
    AGO: "Angola",
    AIA: "Anguilla",
    ATA: "Antarctica",
    ATG: "Antigua and Barbuda",
    ARG: "Argentina",
    ARM: "Armenia",
    ABW: "Aruba",
    AUS: "Australia",
    AUT: "Austria",
    AZE: "Azerbaijan", 

    // B‑codes
    BHS: "Bahamas",
    BHR: "Bahrain",
    BGD: "Bangladesh",
    BRB: "Barbados",
    BLR: "Belarus",
    BEL: "Belgium",
    BLZ: "Belize",
    BEN: "Benin",
    BMU: "Bermuda",
    BTN: "Bhutan",
    BOL: "Bolivia (Plurinational State of)",
    BIH: "Bosnia and Herzegovina",
    BWA: "Botswana",
    BVT: "Bouvet Island",
    BRA: "Brazil",
    IOT: "British Indian Ocean Territory",
    BRN: "Brunei Darussalam",
    BGR: "Bulgaria",
    BFA: "Burkina Faso",
    BDI: "Burundi",

    // C‑codes
    CPV: "Cabo Verde",
    KHM: "Cambodia",
    CMR: "Cameroon",
    CAN: "Canada",
    CYM: "Cayman Islands",
    CAF: "Central African Republic",
    TCD: "Chad",
    CHL: "Chile",
    CHN: "China",
    CXR: "Christmas Island",
    CCK: "Cocos (Keeling) Islands",
    COL: "Colombia",
    COM: "Comoros",
    COG: "Congo",
    COD: "Congo, Democratic Republic of the",
    COK: "Cook Islands",
    CRI: "Costa Rica",
    CIV: "Côte d'Ivoire",
    HRV: "Croatia",
    CUB: "Cuba",
    CUW: "Curaçao",
    CYP: "Cyprus",
    CZE: "Czechia",

    // D‑codes
    DNK: "Denmark",
    DJI: "Djibouti",
    DMA: "Dominica",
    DOM: "Dominican Republic",
    ECU: "Ecuador",
    EGY: "Egypt",
    SLV: "El Salvador",
    GNQ: "Equatorial Guinea",
    ERI: "Eritrea",
    EST: "Estonia",
    SWZ: "Eswatini",
    ETH: "Ethiopia",

    // F‑codes
    FLK: "Falkland Islands (Malvinas)",
    FRO: "Faroe Islands",
    FJI: "Fiji",
    FIN: "Finland",
    FRA: "France",
    GUF: "French Guiana",
    PYF: "French Polynesia",
    ATF: "French Southern Territories",

    // G‑codes
    GAB: "Gabon",
    GMB: "Gambia",
    GEO: "Georgia",
    DEU: "Germany",
    GHA: "Ghana",
    GIB: "Gibraltar",
    GRC: "Greece",
    GRL: "Greenland",
    GRD: "Grenada",
    GLP: "Guadeloupe",
    GUM: "Guam",
    GTM: "Guatemala",
    GGY: "Guernsey",
    GIN: "Guinea",
    GNB: "Guinea-Bissau",
    GUY: "Guyana",

    // H‑codes
    HTI: "Haiti",
    HMD: "Heard Island and McDonald Islands",
    VAT: "Holy See",
    HND: "Honduras",
    HKG: "Hong Kong",
    HUN: "Hungary",

    // I‑codes
    ISL: "Iceland",
    IND: "India",
    IDN: "Indonesia",
    IRN: "Iran (Islamic Republic of)",
    IRQ: "Iraq",
    IRL: "Ireland",
    IMN: "Isle of Man",
    ISR: "Israel",
    ITA: "Italy",
    JAM: "Jamaica",
    JPN: "Japan",
    JEY: "Jersey",
    JOR: "Jordan",

    // K‑codes
    KAZ: "Kazakhstan",
    KEN: "Kenya",
    KIR: "Kiribati",
    PRK: "Korea (Democratic People's Republic of)",
    KOR: "Korea, Republic of",
    KWT: "Kuwait",
    KGZ: "Kyrgyzstan",

    // L‑codes
    LAO: "Lao People's Democratic Republic",
    LVA: "Latvia",
    LBN: "Lebanon",
    LSO: "Lesotho",
    LBR: "Liberia",
    LBY: "Libya",
    LIE: "Liechtenstein",
    LTU: "Lithuania",
    LUX: "Luxembourg",

    // M‑codes
    MAC: "Macao",
    MKD: "North Macedonia",
    MDG: "Madagascar",
    MWI: "Malawi",
    MYS: "Malaysia",
    MDV: "Maldives",
    MLI: "Mali",
    MLT: "Malta",
    MHL: "Marshall Islands",
    MTQ: "Martinique",
    MRT: "Mauritania",
    MUS: "Mauritius",
    MYT: "Mayotte",
    MEX: "Mexico",
    FSM: "Micronesia (Federated States of)",
    MDA: "Moldova, Republic of",
    MCO: "Monaco",
    MNG: "Mongolia",
    MNE: "Montenegro",
    MSR: "Montserrat",
    MAR: "Morocco",
    MOZ: "Mozambique",
    MMR: "Myanmar",

    // N‑codes
    NAM: "Namibia",
    NRU: "Nauru",
    NPL: "Nepal",
    NLD: "Netherlands",
    NCL: "New Caledonia",
    NZL: "New Zealand",
    NIC: "Nicaragua",
    NER: "Niger",
    NGA: "Nigeria",
    NIU: "Niue",
    NFK: "Norfolk Island",
    MNP: "Northern Mariana Islands",
    NOR: "Norway",

    // O‑codes
    OMN: "Oman",

    // P‑codes
    PAK: "Pakistan",
    PLW: "Palau",
    PSE: "State of Palestine",
    PAN: "Panama",
    PNG: "Papua New Guinea",
    PRY: "Paraguay",
    PER: "Peru",
    PHL: "Philippines",
    PCN: "Pitcairn",
    POL: "Poland",
    PRT: "Portugal",
    PRI: "Puerto Rico",

    // Q‑codes
    QAT: "Qatar",

    // R‑codes
    REU: "Réunion",
    ROU: "Romania",
    RUS: "Russian Federation",
    RWA: "Rwanda",

    // S‑codes
    BLM: "Saint Barthélemy",
    SHN: "Saint Helena, Ascension and Tristan da Cunha",
    KNA: "Saint Kitts and Nevis",
    LCA: "Saint Lucia",
    SPM: "Saint Pierre and Miquelon",
    VCT: "Saint Vincent and the Grenadines",
    WSM: "Samoa",
    SMR: "San Marino",
    STP: "Sao Tome and Principe",
    SAU: "Saudi Arabia",
    SEN: "Senegal",
    SRB: "Serbia",
    SYC: "Seychelles",
    SLE: "Sierra Leone",
    SGP: "Singapore",
    SXM: "Sint Maarten (Dutch part)",
    SVK: "Slovakia",
    SVN: "Slovenia",
    SLB: "Solomon Islands",
    SOM: "Somalia",
    ZAF: "South Africa",
    SGS: "South Georgia and the South Sandwich Islands",
    SSD: "South Sudan",
    ESP: "Spain",
    LKA: "Sri Lanka",
    SDN: "Sudan",
    SUR: "Suriname",
    SJM: "Svalbard and Jan Mayen",
    SWE: "Sweden",
    CHE: "Switzerland",
    SYR: "Syrian Arab Republic",

    // T‑codes
    TWN: "Taiwan, Province of China",
    TJK: "Tajikistan",
    TZA: "Tanzania, United Republic of",
    THA: "Thailand",
    TLS: "Timor-Leste",
    TGO: "Togo",
    TKL: "Tokelau",
    TON: "Tonga",
    TTO: "Trinidad and Tobago",
    TUN: "Tunisia",
    TUR: "Türkiye",
    TKM: "Turkmenistan",
    TCA: "Turks and Caicos Islands",
    TUV: "Tuvalu",
    UGA: "Uganda",
    UKR: "Ukraine",
    ARE: "United Arab Emirates",
    GBR: "United Kingdom of Great Britain and Northern Ireland",
    USA: "United States of America",
    UMI: "United States Minor Outlying Islands",
    URY: "Uruguay",
    UZB: "Uzbekistan",

    // V‑codes
    VUT: "Vanuatu",
    VEN: "Venezuela (Bolivarian Republic of)",
    VNM: "Viet Nam",
    VGB: "Virgin Islands (British)",
    VIR: "Virgin Islands (U.S.)",

    // W‑codes
    WLF: "Wallis and Futuna",
    ESH: "Western Sahara",

    // Y‑codes
    YEM: "Yemen",

    // Z‑codes
    ZMB: "Zambia",
    ZWE: "Zimbabwe"
  };

  return countryMap[code.toUpperCase()] || code;
};


  const parseStars = (str) => {
    const match = str?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Move formatCancellationPolicy outside of useEffect
  const formatCancellationPolicy = (cancellationPolicies) => {
    if (!cancellationPolicies || cancellationPolicies.length === 0) {
      return "No cancellation policy available";
    }

    // Sort policies by date to find the most relevant one
    const sortedPolicies = cancellationPolicies.sort((a, b) => 
      new Date(a.from) - new Date(b.from)
    );

    // Get the most recent/relevant policy
    const policy = sortedPolicies[0];
    
    // Format the date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    };

    const amount = parseFloat(policy.amount);
    const fromDate = formatDate(policy.from);

    if (amount === 0) {
      return `✓ Free cancellation until ${fromDate}`;
    } else {
      return `Cancellation fee: €${amount.toFixed(2)} from ${fromDate}`;
    }
  };

  const API_BASE_URL =
    (import.meta.env.VITE_BASE_URL || "http://localhost:3000") + "/api";

  const getAuthToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      null
    );
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = getAuthToken();
    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };
    return fetch(url, { ...defaultOptions, ...options });
  };

  const getAmenityIcon = (amenity) => {
    const amenityData = availableAmenities.find(a => a.id === amenity);
    if (amenityData) {
      const IconComponent = amenityData.icon;
      return <IconComponent className="w-5 h-5 text-blue-600" title={amenityData.name} />;
    }
    return null;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAmenityChange = (amenityId) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleAccommodationTypeChange = (typeId) => {
    setSelectedAccommodationTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const clearFilters = () => {
    setSelectedAmenities([]);
    setSelectedAccommodationTypes([]);
    setSortOption("default");
    setHotelNameSearch("");
    setSelectedBoards([]);
    setSelectedCategories([]);
    setSelectedZones([]);
    setSelectedReviewRatings([]);
    setSelectedCancellation("");
    setPriceMin("");
    setPriceMax("");
    setSelectedPromos([]);
    setSelectedDiscounts([]);
    setSelectedChains([]);
    setSelectedEstablishment([]);
    setSelectedPackaging("");
  };

  const handleAddToCart = (hotel, room, rate) => {
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = parseInt(searchParams.get("adults") || "2");
    const children = parseInt(searchParams.get("children") || "0");
    const rooms = parseInt(searchParams.get("rooms") || "1");
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalFromAPI = parseFloat(rate.net);
    const pricePerNight = nights > 0 ? (totalFromAPI / nights) : totalFromAPI;

    addToCart({
      id: `${hotel.id}-${room.code}-${rate.rateKey || rate.net}`,
      hotelId: hotel.id, hotelName: hotel.name, hotelCode: hotel.code,
      roomCode: room.code, roomName: room.name, rateKey: rate.rateKey,
      price: pricePerNight, pricePerNight, currency: hotel.currency || 'EUR',
      checkIn, checkOut, nights, guests: adults + children, adults, children, rooms,
      location: `${hotel.zoneName}, ${hotel.destinationName}`,
      boardName: rate.boardName, rateClass: rate.rateClass, paymentType: rate.paymentType,
      cancellationPolicies: rate.cancellationPolicies || [],
      cancellationPolicy: rate.cancellationPolicies ? formatCancellationPolicy(rate.cancellationPolicies) : "No cancellation policy",
      promotions: rate.promotions || [], offers: rate.offers || [],
      thumbnail: hotel.thumbnail, allotment: rate.allotment,
      packaging: rate.packaging, taxes: rate.taxes,
      city: hotel.destinationName, zone: hotel.zoneName,
      category: hotel.categoryName, totalPrice: totalFromAPI, net: totalFromAPI,
      addedAt: new Date().toISOString(),
    });
    setNotification({ show: true, message: `${room.name} added to cart!`, type: 'success' });
    setSelectedHotel(null);
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    window.dispatchEvent(new CustomEvent('openCart'));
  };


  // ADD THIS FUNCTION
  const fetchTripAdvisorReviews = async (hotel) => {
  // Check if already fetched or currently loading
  if (hotelReviews[hotel.id] || loadingReviews[hotel.id]) return;
  
  setLoadingReviews(prev => ({ ...prev, [hotel.id]: true }));
  
  try {
    // Use hotel code (not id) and send proper hotel data
    const hotelCode = hotel.code || hotel.id;
    const cityName = hotel.city || hotel.address?.split(',')[0] || 'Baku';
    
    console.log(`Fetching reviews for: ${hotel.name} in ${cityName}`);
    
    const response = await fetch(
      `${API_BASE_URL}/hotels/${encodeURIComponent(hotelCode)}/reviews?name=${encodeURIComponent(hotel.name)}&city=${encodeURIComponent(cityName)}`
    );
    
    const data = await response.json();
    
    console.log('Reviews response:', data);
    
    if (data.success && data.data) {
      setHotelReviews(prev => ({
        ...prev,
        [hotel.id]: data.data
      }));
    } else {
      console.log('No reviews found or API returned error:', data.message);
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
  } finally {
    setLoadingReviews(prev => ({ ...prev, [hotel.id]: false }));
  }
};
const openReviewsModal = (hotel) => {
  setReviewsModal({
    isOpen: true,
    hotelId: hotel.id,
    hotelName: hotel.name
  });
  
  // Fetch reviews if not already fetched
  if (!hotelReviews[hotel.id]) {
    fetchTripAdvisorReviews(hotel);
  }
};

// 5. Add function to close modal
const closeReviewsModal = () => {
  setReviewsModal({
    isOpen: false,
    hotelId: null,
    hotelName: null
  });
};

  // ADD THIS useEffect AFTER your existing hotel fetching useEffect
  useEffect(() => {
  if (hotels.length > 0) {
    // Fetch reviews for ALL hotels
    hotels.forEach(hotel => {
      fetchTripAdvisorReviews(hotel);
    });
  }
}, [hotels]);

  // HELPER FUNCTION
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "bg-green-600";
    if (rating >= 3.5) return "bg-green-500";
    if (rating >= 2.5) return "bg-yellow-500";
    if (rating >= 1.5) return "bg-orange-500";
    return "bg-red-600";
  };

 
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        const checkIn = searchParams.get("checkIn");
        const checkOut = searchParams.get("checkOut");
        const rooms = parseInt(searchParams.get("rooms") || "1");
        const adults = parseInt(searchParams.get("adults") || "2");
        const children = parseInt(searchParams.get("children") || "0");
        const childAgesParam = searchParams.get("childAges");
        const childAges = childAgesParam ? childAgesParam.split(',').map(age => parseInt(age)) : [];
        const country = searchParams.get("country");
        const city = searchParams.get("city");
        const hotelName = searchParams.get("hotelName");

        if (!checkIn || !checkOut) {
          throw new Error("Missing required search parameters");
        }

        if (!city && !country && !hotelName) {
          throw new Error("Please provide a destination or hotel name");
        }

        let lat, lon;
        
        // Geocode using city/country if available, otherwise use hotel name
        const geocodeQuery = city ? `${city}, ${convertCountryCode(country || '')}` : hotelName;
        const geoResponse = await fetch(
          `${API_BASE_URL}/geocode?q=${encodeURIComponent(geocodeQuery)}`
        );

        if (geoResponse.ok) {
          const geoResult = await geoResponse.json();  
          lat = geoResult?.data?.[0]?.lat;
          lon = geoResult?.data?.[0]?.lon;
        }
        
        if (!lat || !lon) {
          throw new Error(`Unable to find coordinates for ${city || hotelName}`);
        }


        const occupancy = { 
  rooms, 
  adults, 
  children: children > 0 ? children : 0
};

if (children > 0 && childAges.length > 0) {
  occupancy.paxes = childAges.map(age => ({ type: 'CH', age }));
}

        const requestBody = {
          stay: { checkIn, checkOut },
          occupancies: [
            occupancy,
          ],
          geolocation: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            radius: 30,
            unit: "km",
          },
        };
        
        console.log('🔍 Hotel Search Request:', JSON.stringify(requestBody, null, 2));

        let hotelResponse;
        let isAuthenticated = false;

        try {
          hotelResponse = await makeAuthenticatedRequest(
            `${API_BASE_URL}/hotels/search-auth`,
            {
              method: "POST",
              body: JSON.stringify(requestBody),
            }
          );

          if (hotelResponse.ok) {
            isAuthenticated = true;
          } else {
            hotelResponse = await fetch(`${API_BASE_URL}/hotels/search`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestBody),
            });
          }
        } catch {
          hotelResponse = await fetch(`${API_BASE_URL}/hotels/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
        }

        if (!hotelResponse.ok) {
          const errorText = await hotelResponse.text();
          console.error('❌ Hotel API Error:', errorText);
          throw new Error(`Hotel search failed: ${hotelResponse.status}`);
        }

        const hotelResult = await hotelResponse.json();
        console.log('✅ Hotel API Response:', hotelResult);

        if (!hotelResult.success) {
          console.error('❌ No hotels found in response');
          throw new Error("No hotels found");
        }

        if (isAuthenticated && hotelResult.user) {
          setUser(hotelResult.user);
        }

        const hotelsRaw = hotelResult.data.hotels?.hotels || hotelResult.data.hotels || [];
        const hotelsArray = Array.isArray(hotelsRaw) ? hotelsRaw : [];
        const transformedHotels = hotelsArray.map((hotel) => {
          const allRates = hotel.rooms?.flatMap((room) => room.rates) || [];
          const cheapestRate =
            allRates.length > 0
              ? allRates.reduce((min, rate) =>
                  parseFloat(rate.net) < parseFloat(min.net) ? rate : min
                )
              : null;

          const cancellationPolicy = cheapestRate?.cancellationPolicies || [];

          return {
            id: hotel.code,
            name: hotel.name,
            category: hotel.categoryName || hotel.categoryCode || "N/A",
            stars: parseStars(hotel.categoryName || hotel.categoryCode),
            address: `${hotel.destinationName}, ${hotel.zoneName}`,
            zone: hotel.zoneName || "Unknown",
            thumbnail: hotel.thumbnail,
            price: hotel.minRate || cheapestRate?.net || "N/A",
            currency: hotel.currency || "EUR",
            images: hotel.images || [],
            amenities: hotel.amenities || [],
            facilities: hotel.facilities || [],
            type: hotel.accommodationTypeCode || hotel.type || "H",
            cancellationPolicy: cancellationPolicy,
            boards: [...new Set(allRates.map(r => r.boardName).filter(Boolean))],
            boardCodes: [...new Set(allRates.map(r => r.boardCode).filter(Boolean))],
            hasFreeCancellation: cancellationPolicy.length > 0 && parseFloat(cancellationPolicy[0]?.amount || 0) === 0,
            hasPartialCancellation: cancellationPolicy.length > 0 && parseFloat(cancellationPolicy[0]?.amount || 0) > 0,
            hasNoCancellationInfo: !cancellationPolicy || cancellationPolicy.length === 0,
            promos: [...new Set(allRates.flatMap(r => (r.promotions || r.offers || []).map(p => p.name || p.code)).filter(Boolean))],
            discounts: [...new Set(allRates.flatMap(r => (r.rateCommentsId ? ['Discounted'] : []).concat(
              (r.promotions || r.offers || []).filter(p => (p.name || '').toLowerCase().includes('discount')).map(p => p.name)
            )).filter(Boolean))],
            chain: hotel.chainCode || hotel.chain || null,
            packaging: allRates.some(r => r.packaging === true),
            exclusiveDeal: hotel.exclusiveDeal || allRates.some(r => r.exclusiveDeal === true),
            luxury: hotel.luxury || false,
            preferred: hotel.preferred || false,
            establishmentProfiles: hotel.segmentCodes || [],
            rooms: hotel.rooms || [],
            code: hotel.code,
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            destinationName: hotel.destinationName,
            zoneName: hotel.zoneName || "Unknown",
            destinationCode: hotel.destinationCode,
            zoneCode: hotel.zoneCode,
            categoryName: hotel.categoryName,
          };
        });

        // Filter by hotel name if provided
        const finalHotels = hotelName 
          ? transformedHotels.filter(h => h.name.toLowerCase().includes(hotelName.toLowerCase()))
          : transformedHotels;

        setHotels(finalHotels);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

 

  // Dynamic filter options derived from hotel data
  const dynamicBoards = [...new Set(hotels.flatMap(h => h.boards))].filter(Boolean).sort();
  const dynamicCategories = [...new Set(hotels.map(h => h.category))].filter(Boolean).sort();
  const dynamicZones = [...new Set(hotels.map(h => h.zone))].filter(Boolean).sort();
  const dynamicPromos = [...new Set(hotels.flatMap(h => h.promos))].filter(Boolean).sort();
  const dynamicDiscounts = [...new Set(hotels.flatMap(h => h.discounts))].filter(Boolean).sort();
  const dynamicChains = [...new Set(hotels.map(h => h.chain).filter(Boolean))].sort();
  const dynamicEstablishment = [...new Set(hotels.flatMap(h => h.establishmentProfiles))].filter(Boolean).sort();
  const dynamicAccommodationTypes = [...new Set(hotels.map(h => h.type).filter(Boolean))];

  // Count helpers for filter badges
  const countBoard = (b) => hotels.filter(h => h.boards.includes(b)).length;
  const countCategory = (c) => hotels.filter(h => h.category === c).length;
  const countZone = (z) => hotels.filter(h => h.zone === z).length;
  const countPromo = (p) => hotels.filter(h => h.promos.includes(p)).length;
  const countDiscount = (d) => hotels.filter(h => h.discounts.includes(d)).length;
  const countChain = (c) => hotels.filter(h => h.chain === c).length;
  const countEstablishment = (e) => hotels.filter(h => h.establishmentProfiles.includes(e)).length;
  const countAccommodationType = (t) => hotels.filter(h => h.type === t).length;
  const countAmenity = (a) => hotels.filter(h => h.amenities.includes(a)).length;
  const countFreeCancellation = hotels.filter(h => h.hasFreeCancellation).length;
  const countPartialCancellation = hotels.filter(h => h.hasPartialCancellation).length;
  const countNonRefundable = hotels.filter(h => !h.hasFreeCancellation && !h.hasNoCancellationInfo).length;
  const countNoCancellationInfo = hotels.filter(h => h.hasNoCancellationInfo).length;
  const countPackagingWith = hotels.filter(h => h.packaging).length;
  const countPackagingWithout = hotels.filter(h => !h.packaging).length;
  const countReview = (minRating) => hotels.filter(h => { const r = hotelReviews[h.id]; return r && r.rating >= minRating; }).length;

  // Establishment profile labels
  const establishmentLabels = {
    '119': 'Luxury Collection', '103': 'Adults Only', '37': 'Beach Hotels',
    '34': 'Business Hotels', '31': 'Design', '36': 'Family Hotels',
    '33': 'City Hotels', '35': 'Ski Hotels', '38': 'Spa Hotels',
  };

  // Filter hotels based on selected filters
  const filteredHotels = hotels.filter(hotel => {
    if (hotelNameSearch && !hotel.name.toLowerCase().includes(hotelNameSearch.toLowerCase())) return false;
    if (selectedBoards.length > 0 && !hotel.boards.some(b => selectedBoards.includes(b))) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(hotel.category)) return false;
    if (selectedZones.length > 0 && !selectedZones.includes(hotel.zone)) return false;
    if (selectedReviewRatings.length > 0) {
      const review = hotelReviews[hotel.id];
      if (!review || !review.rating) return false;
      const rating = Math.floor(review.rating);
      if (!selectedReviewRatings.some(r => rating >= r)) return false;
    }
    if (selectedCancellation === "free" && !hotel.hasFreeCancellation) return false;
    if (selectedCancellation === "partial" && !hotel.hasPartialCancellation) return false;
    if (selectedCancellation === "nonrefundable" && hotel.hasFreeCancellation) return false;
    if (selectedCancellation === "notavailable" && !hotel.hasNoCancellationInfo) return false;
    const price = parseFloat(hotel.price);
    if (priceMin && price < parseFloat(priceMin)) return false;
    if (priceMax && price > parseFloat(priceMax)) return false;
    if (selectedPromos.length > 0 && !hotel.promos.some(p => selectedPromos.includes(p))) return false;
    if (selectedDiscounts.length > 0 && !hotel.discounts.some(d => selectedDiscounts.includes(d))) return false;
    if (selectedChains.length > 0 && !selectedChains.includes(hotel.chain)) return false;
    if (selectedEstablishment.length > 0 && !hotel.establishmentProfiles.some(e => selectedEstablishment.includes(e))) return false;
    if (selectedPackaging === "with" && !hotel.packaging) return false;
    if (selectedPackaging === "without" && hotel.packaging) return false;
    if (selectedAmenities.length > 0) {
      if (!selectedAmenities.every(amenity => hotel.amenities.includes(amenity))) return false;
    }
    if (selectedAccommodationTypes.length > 0 && !selectedAccommodationTypes.includes(hotel.type)) return false;
    return true;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortOption === "priceLowHigh") {
      return parseFloat(a.price || 0) - parseFloat(b.price || 0);
    } else if (sortOption === "priceHighLow") {
      return parseFloat(b.price || 0) - parseFloat(a.price || 0);
    } else if (sortOption === "ratingHighLow") {
      return b.stars - a.stars;
    } else if (sortOption === "ratingLowHigh") {
      return a.stars - b.stars;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Finding the best hotels for you...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mr-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
        <button
          onClick={() => (window.location.href = "/home")}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Search
        </button>
      </div>
    );
  }

  





  return (
    <>
      <Header />
      <div className="pt-16 flex">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden fixed top-32 left-4 z-50">
          <button onClick={() => setShowFilters(!showFilters)} className="bg-white/70 backdrop-blur-sm text-gray-700 p-2.5 rounded-lg shadow-sm border border-gray-200/60 hover:bg-white/90 cursor-pointer flex items-center gap-2">
            <Filter className="w-4 h-4" /><span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Sidebar Filters */}
        <div className={`fixed lg:sticky lg:top-16 inset-y-0 left-0 z-40 bg-white border-r border-gray-100 transform transition-all duration-300 ease-in-out lg:h-[calc(100vh-4rem)] pt-16 lg:pt-0 ${showFilters ? 'translate-x-0 w-[300px]' : '-translate-x-full w-[300px]'} ${sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-0' : 'lg:w-[300px] lg:translate-x-0'}`}>
          <div className="h-full overflow-y-auto overscroll-contain px-4 py-4 text-left" style={{scrollbarWidth:'thin',scrollbarColor:'#e5e7eb transparent'}}>
            {/* Mobile Close */}
            <div className="lg:hidden flex justify-between items-center pb-3 mb-3 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Filters</span>
              <button onClick={() => setShowFilters(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="hidden lg:flex justify-between items-center pb-3 mb-1 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Filters</span>
              <div className="flex items-center gap-2">
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">Reset all</button>
                <button onClick={() => setSidebarCollapsed(true)} className="p-1 rounded hover:bg-gray-100"><ChevronLeft className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>
            </div>

            {/* 1. Hotel Name Search */}
            <div className="py-3 border-b border-gray-50">
              <button
                onClick={() => toggleSection('hotelName')}
                className="flex items-center justify-between w-full cursor-pointer"
              >
                <span className="text-[13px] font-semibold text-gray-800">Hotel Name</span>
                {expandedSections.hotelName ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
              </button>
              {expandedSections.hotelName && (
                <input
                  type="text"
                  value={hotelNameSearch}
                  onChange={(e) => setHotelNameSearch(e.target.value)}
                  placeholder="Search hotel name..."
                  className="w-full px-3 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              )}
            </div>

            {/* Distance From */}
            <div className="py-3 border-b border-gray-50">
              <span className="text-[13px] font-semibold text-gray-800">Distance from</span>
              <div className="mt-2.5 space-y-2.5">
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">Popular sight</label>
                  <select value={selectedSight} onChange={(e) => setSelectedSight(e.target.value)} className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="">Select</option>
                    {dynamicZones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">Specific address</label>
                  <input type="text" value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} placeholder="Street, point of interest..." className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Board */}
            {dynamicBoards.length > 0 && (
              <div className="py-3 border-b border-gray-50">
                <button
                  onClick={() => toggleSection('board')}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-[13px] font-semibold text-gray-800">Board</span>
                  {expandedSections.board ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.board && (
                  <div className="space-y-1.5">
                    {dynamicBoards.map(board => (
                      <label key={board} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                        <input type="checkbox" checked={selectedBoards.includes(board)} onChange={() => setSelectedBoards(prev => prev.includes(board) ? prev.filter(b => b !== board) : [...prev, board])} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{board}</span>
                        <span className="text-[11px] text-gray-400">{countBoard(board)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Category (Star Rating) */}
            {dynamicCategories.length > 0 && (
              <div className="py-3 border-b border-gray-50">
                <button
                  onClick={() => toggleSection('category')}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-[13px] font-semibold text-gray-800">Category</span>
                  {expandedSections.category ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.category && (
                  <div className="space-y-1.5">
                    {dynamicCategories.map(cat => (
                      <label key={cat} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                        <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{cat}</span>
                        <span className="text-[11px] text-gray-400">{countCategory(cat)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Customer Reviews */}
            <div className="py-3 border-b border-gray-50">
              <button
                onClick={() => toggleSection('reviews')}
                className="flex items-center justify-between w-full cursor-pointer"
              >
                <span className="text-[13px] font-semibold text-gray-800">Customer Reviews</span>
                {expandedSections.reviews ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
              </button>
              {expandedSections.reviews && (
                <div className="space-y-1.5">
                  {[
                    { value: 4.5, label: "Wonderful 4.5+" },
                    { value: 4, label: "Very good 4+" },
                    { value: 3.5, label: "Good 3.5+" },
                    { value: 3, label: "Nice 3+" },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                      <input type="radio" name="reviewRating" value={opt.value} checked={selectedReviewRatings.includes(opt.value)} onChange={() => setSelectedReviewRatings([opt.value])} className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                      <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{opt.label}</span>
                      <span className="text-[11px] text-gray-400">{countReview(opt.value)}</span>
                    </label>
                  ))}
                  {selectedReviewRatings.length > 0 && (
                    <button
                      onClick={() => setSelectedReviewRatings([])}
                      className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                    >Clear</button>
                  )}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="py-3 border-b border-gray-50">
              <button
                onClick={() => toggleSection('price')}
                className="flex items-center justify-between w-full cursor-pointer"
              >
                <span className="text-[13px] font-semibold text-gray-800">Price Range</span>
                {expandedSections.price ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
              </button>
              {expandedSections.price && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="Min"
                    className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <span className="text-gray-300 text-xs">�</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Max"
                    className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* 7. Zone */}
            {dynamicZones.length > 0 && (
              <div className="py-3 border-b border-gray-50">
                <button
                  onClick={() => toggleSection('zone')}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-[13px] font-semibold text-gray-800">Zone</span>
                  {expandedSections.zone ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.zone && (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {dynamicZones.map(zone => (
                      <label key={zone} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedZones.includes(zone)}
                          onChange={() => setSelectedZones(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone])}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{zone}</span>
                        <span className="text-[11px] text-gray-400">{countZone(zone)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Accommodation Type */}
            <div className="py-3 border-b border-gray-50">
              <button
                onClick={() => toggleSection('accommodationType')}
                className="flex items-center justify-between w-full cursor-pointer"
              >
                <span className="text-[13px] font-semibold text-gray-800">Accommodation Type</span>
                {expandedSections.accommodationType ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
              </button>
              {expandedSections.accommodationType && (
                <div className="space-y-1.5">
                  {accommodationTypes.map(type => (
                    <label key={type.id} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                        <input type="checkbox" checked={selectedAccommodationTypes.includes(type.id)} onChange={() => handleAccommodationTypeChange(type.id)} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{type.name}</span>
                        <span className="text-[11px] text-gray-400">{countAccommodationType(type.id)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="py-3 border-b border-gray-50">
              <button
                onClick={() => toggleSection('amenities')}
                className="flex items-center justify-between w-full cursor-pointer"
              >
                <span className="text-[13px] font-semibold text-gray-800">Amenities</span>
                {expandedSections.amenities ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
              </button>
              {expandedSections.amenities && (
                <div className="space-y-1.5">
                  {availableAmenities.map(amenity => (
                    <label key={amenity.id} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity.id)}
                        onChange={() => handleAmenityChange(amenity.id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <amenity.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{amenity.name}</span>
                      <span className="text-[11px] text-gray-400">{countAmenity(amenity.id)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Promos */}
            {dynamicPromos.length > 0 && (
              <div className="py-3 border-b border-gray-50">
                <button
                  onClick={() => toggleSection('promos')}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-[13px] font-semibold text-gray-800">Promos</span>
                  {expandedSections.promos ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.promos && (
                  <div className="space-y-1.5">
                    {dynamicPromos.map(promo => (
                      <label key={promo} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedPromos.includes(promo)}
                          onChange={() => setSelectedPromos(prev => prev.includes(promo) ? prev.filter(p => p !== promo) : [...prev, promo])}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{promo}</span>
                        <span className="text-[11px] text-gray-400">{countPromo(promo)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cancellation Fees (expanded) */}
            <div className="py-3 border-b border-gray-50">
              <button
                onClick={() => toggleSection('cancellation')}
                className="flex items-center justify-between w-full cursor-pointer"
              >
                <span className="text-[13px] font-semibold text-gray-800">Cancellation Fees</span>
                {expandedSections.cancellation ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
              </button>
              {expandedSections.cancellation && (
                <div className="space-y-1.5">
                  {[
                    { value: "", label: "All", count: hotels.length },
                    { value: "free", label: "Free cancellation", count: countFreeCancellation },
                    { value: "partial", label: "Partial cancellation fees", count: countPartialCancellation },
                    { value: "nonrefundable", label: "Non refundable", count: countNonRefundable },
                    { value: "notavailable", label: "Fees not available", count: countNoCancellationInfo },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                      <input type="radio" name="cancellation" value={opt.value} checked={selectedCancellation === opt.value} onChange={(e) => setSelectedCancellation(e.target.value)} className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                      <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{opt.label}</span>
                      <span className="text-[11px] text-gray-400">{opt.count}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Establishment Profile */}
            {dynamicEstablishment.length > 0 && (
              <div className="py-3 border-b border-gray-50">
                <button
                  onClick={() => toggleSection('establishment')}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-[13px] font-semibold text-gray-800">Establishment Profile</span>
                  {expandedSections.establishment ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.establishment && (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {dynamicEstablishment.map(est => (
                      <label key={est} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedEstablishment.includes(est)}
                          onChange={() => setSelectedEstablishment(prev => prev.includes(est) ? prev.filter(e => e !== est) : [...prev, est])}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{establishmentLabels[est] || est}</span>
                        <span className="text-[11px] text-gray-400">{countEstablishment(est)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Discounts */}
            {dynamicDiscounts.length > 0 && (
              <div className="py-3 border-b border-gray-50">
                <button
                  onClick={() => toggleSection('discounts')}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-[13px] font-semibold text-gray-800">Discounts</span>
                  {expandedSections.discounts ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.discounts && (
                  <div className="space-y-1.5">
                    {dynamicDiscounts.map(disc => (
                      <label key={disc} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedDiscounts.includes(disc)}
                          onChange={() => setSelectedDiscounts(prev => prev.includes(disc) ? prev.filter(d => d !== disc) : [...prev, disc])}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{disc}</span>
                        <span className="text-[11px] text-gray-400">{countDiscount(disc)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chain */}
            {dynamicChains.length > 0 && (
              <div className="py-3 border-b border-gray-50">
                <button
                  onClick={() => toggleSection('chain')}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-[13px] font-semibold text-gray-800">Chain</span>
                  {expandedSections.chain ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.chain && (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {dynamicChains.map(chain => (
                      <label key={chain} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedChains.includes(chain)}
                          onChange={() => setSelectedChains(prev => prev.includes(chain) ? prev.filter(c => c !== chain) : [...prev, chain])}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{chain}</span>
                        <span className="text-[11px] text-gray-400">{countChain(chain)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product for Packaging */}
            <div className="py-3 border-b border-gray-50">
              <button
                onClick={() => toggleSection('packaging')}
                className="flex items-center justify-between w-full cursor-pointer"
              >
                <span className="text-[13px] font-semibold text-gray-800">Product for Packaging</span>
                {expandedSections.packaging ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
              </button>
              {expandedSections.packaging && (
                <div className="space-y-1.5">
                  {[
                    { value: "", label: "All", count: hotels.length },
                    { value: "without", label: "Without package", count: countPackagingWithout },
                    { value: "with", label: "With package", count: countPackagingWith },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                      <input type="radio" name="packaging" value={opt.value} checked={selectedPackaging === opt.value} onChange={(e) => setSelectedPackaging(e.target.value)} className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                      <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{opt.label}</span>
                      <span className="text-[11px] text-gray-400">{opt.count}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Open Button (when collapsed) */}
        {sidebarCollapsed && (
          <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex fixed top-20 left-2 z-50 items-center gap-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-[12px] text-gray-600">
            <Filter className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="px-4 sm:px-6 py-6">
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 ">
                    Welcome back, {user.name}! Your personalized search results:
                  </span>
                </div>
              </div>
            )}

            <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm py-2.5 -mx-4 px-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <h1 className="text-[14px] sm:text-base font-semibold text-gray-900 truncate">
                {sortedHotels.length} Hotels{searchParams.get("city") ? ` in ${searchParams.get("city")}` : searchParams.get("hotelName") ? ` matching "${searchParams.get("hotelName")}"` : ''}
              </h1>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="text-[12px] sm:text-[13px] px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none flex-shrink-0">
                <option value="default">Sort: Recommended</option>
                <option value="priceLowHigh">Price: Low → High</option>
                <option value="priceHighLow">Price: High → Low</option>
                <option value="ratingHighLow">Rating: High → Low</option>
                <option value="ratingLowHigh">Rating: Low → High</option>
              </select>
            </div>

            {/* Search summary */}
            <div className="flex items-center gap-2 text-[11px] text-gray-400 py-2 flex-wrap">
              <span>{searchParams.get("checkIn")} → {searchParams.get("checkOut")}</span>
              <span>·</span>
              <span>{searchParams.get("adults")} adult{searchParams.get("adults") !== "1" ? 's' : ''}{searchParams.get("children") && searchParams.get("children") !== "0" ? `, ${searchParams.get("children")} children` : ''}</span>
              <span>·</span>
              <span>{searchParams.get("rooms")} room{searchParams.get("rooms") !== "1" ? 's' : ''}</span>
              {searchParams.get("hotelName") && <><span>·</span><span className="text-blue-600">Hotel: {searchParams.get("hotelName")}</span></>}
            </div>

            {/* Hotel Cards */}
            <div className="space-y-3">
              {sortedHotels.map((hotel, cardIndex) => {
                const checkIn = searchParams.get("checkIn");
                const checkOut = searchParams.get("checkOut");
                const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 1;
                const totalPrice = parseFloat(hotel.price);
                const pricePerNight = nights > 0 ? (totalPrice / nights) : totalPrice;
                const roomTypes = [...new Set((hotel.rooms || []).map(r => r.name))];

                return (
                <div
                  key={hotel.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col sm:flex-row group animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${cardIndex * 50}ms`, animationFillMode: 'both' }}
                >
                  {/* Image */}
                  <div className="sm:w-56 lg:w-64 relative overflow-hidden flex-shrink-0">
                    <img src={hotel.thumbnail || "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"} alt={hotel.name} className="w-full h-40 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => (e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg")} />
                    {hotel.hasFreeCancellation && (
                      <div className="absolute top-2 left-2 bg-green-600/90 text-white px-2 py-0.5 rounded text-[10px] font-medium">Free cancellation</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="min-w-0">
                          <h2 className="text-[14px] font-semibold text-gray-900 truncate leading-tight">{hotel.name}</h2>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(hotel.stars)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-current" />)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-blue-600 leading-tight">{hotel.currency} {totalPrice.toFixed(0)}</div>
                          <div className="text-[10px] text-gray-400">{pricePerNight.toFixed(0)}/night · {nights}n</div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-400 text-[12px] mb-2">
                        <MapPin className="w-3 h-3 mr-0.5 flex-shrink-0" /><span className="truncate">{hotel.address}</span>
                      </div>

                      {/* Room types */}
                      {roomTypes.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                          {roomTypes.slice(0, 3).map((rt, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium truncate max-w-[140px]">{rt}</span>
                          ))}
                          {roomTypes.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{roomTypes.length - 3}</span>}
                        </div>
                      )}

                      {/* Board tags */}
                      {hotel.boards.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-1.5">
                          {hotel.boards.slice(0, 2).map((b, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">{b}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                      {hotelReviews[hotel.id] && hotelReviews[hotel.id].numReviews > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <RatingCircles rating={hotelReviews[hotel.id].rating} size="w-2 h-2" />
                          <span className="text-[10px] text-gray-400">{hotelReviews[hotel.id].numReviews.toLocaleString()}</span>
                        </div>
                      ) : <div />}
                      <button onClick={(e) => { e.stopPropagation(); setSelectedHotel(hotel); }} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-[12px] font-medium inline-flex items-center gap-1">
                        <Bed className="w-3 h-3" />View Rooms
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>

            {sortedHotels.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🏨</div>
                <p className="text-gray-800 text-lg font-medium mb-1">No hotels match your filters</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your filters or search criteria</p>
                <button onClick={clearFilters} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">Clear All Filters</button>
              </div>
            )}
          </div>
        </div>
        {/* Reviews Modal */}
<ReviewsModal
  isOpen={reviewsModal.isOpen}
  onClose={closeReviewsModal}
  hotelName={reviewsModal.hotelName}
  reviewData={reviewsModal.hotelId ? hotelReviews[reviewsModal.hotelId] : null}
/>

      {/* Hotel Detail Modal */}
      {selectedHotel && (() => {
        const checkIn = searchParams.get("checkIn");
        const checkOut = searchParams.get("checkOut");
        const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 1;
        const allImages = (selectedHotel.images || []).map(img => img.path ? `https://photos.hotelbeds.com/giata/original/${img.path}` : null).filter(Boolean);
        const modalImages = allImages.slice(0, 5);
        if (modalImages.length === 0 && selectedHotel.thumbnail) modalImages.push(selectedHotel.thumbnail);
        if (allImages.length === 0 && selectedHotel.thumbnail) allImages.push(selectedHotel.thumbnail);
        const uniqueRoomTypes = [...new Set((selectedHotel.rooms || []).map(r => r.name))];

        const openGallery = (idx) => { setGalleryImages(allImages); setGalleryIndex(idx); setGalleryOpen(true); };

        return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center" onClick={() => setSelectedHotel(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white w-full sm:max-w-4xl sm:rounded-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {/* Image Collage Header */}
            <div className="relative flex-shrink-0">
              {modalImages.length >= 3 ? (
                <div className="grid grid-cols-4 grid-rows-2 gap-0.5 h-48 sm:h-56">
                  <div className="col-span-2 row-span-2 cursor-pointer" onClick={() => openGallery(0)}>
                    <img src={modalImages[0]} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" onError={(e) => e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'} />
                  </div>
                  <div className="col-span-1 row-span-1 cursor-pointer" onClick={() => openGallery(1)}>
                    <img src={modalImages[1]} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" onError={(e) => e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'} />
                  </div>
                  <div className="col-span-1 row-span-1 cursor-pointer" onClick={() => openGallery(2)}>
                    <img src={modalImages[2]} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" onError={(e) => e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'} />
                  </div>
                  <div className="col-span-1 row-span-1 cursor-pointer" onClick={() => openGallery(3)}>
                    <img src={modalImages[3] || modalImages[0]} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" onError={(e) => e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'} />
                  </div>
                  <div className="col-span-1 row-span-1 relative cursor-pointer" onClick={() => openGallery(4)}>
                    <img src={modalImages[4] || modalImages[1]} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" onError={(e) => e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'} />
                    {allImages.length > 5 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors"><span className="text-white text-sm font-medium">+{allImages.length - 5} photos</span></div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-48 sm:h-56 cursor-pointer" onClick={() => openGallery(0)}>
                  <img src={modalImages[0] || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                </div>
              )}
              <button onClick={() => setSelectedHotel(null)} className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-full transition-colors"><X className="w-4 h-4 text-white" /></button>
            </div>

            {/* Hotel Info */}
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedHotel.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">{[...Array(selectedHotel.stars)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" />)}</div>
                    <span className="text-[12px] text-gray-400">·</span>
                    <span className="text-[12px] text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedHotel.address}</span>
                  </div>
                  {/* Amenities */}
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    {[...new Set(selectedHotel.amenities)].map((amenity, i) => {
                      const ad = availableAmenities.find(a => a.id === amenity);
                      if (!ad) return null;
                      const Ic = ad.icon;
                      return <span key={i} className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full"><Ic className="w-3 h-3" />{ad.name}</span>;
                    })}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[11px] text-gray-400">from</div>
                  <div className="text-xl font-bold text-blue-600">{selectedHotel.currency} {parseFloat(selectedHotel.price).toFixed(2)}</div>
                  <div className="text-[11px] text-gray-400">{nights} {nights === 1 ? 'night' : 'nights'}</div>
                  {/* Reviews */}
                  {hotelReviews[selectedHotel.id] && hotelReviews[selectedHotel.id].numReviews > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                      <RatingCircles rating={hotelReviews[selectedHotel.id].rating} size="w-2.5 h-2.5" />
                      <span className="text-[11px] text-gray-500">{hotelReviews[selectedHotel.id].numReviews.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Search summary */}
              <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400 flex-wrap">
                <span>{searchParams.get("checkIn")} → {searchParams.get("checkOut")}</span>
                <span>·</span>
                <span>{searchParams.get("adults")} adults{searchParams.get("children") && searchParams.get("children") !== "0" ? `, ${searchParams.get("children")} children` : ''}</span>
                <span>·</span>
                <span>{searchParams.get("rooms")} room(s)</span>
              </div>
              {/* Hotel details */}
              <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                <div className="text-[12px] text-gray-600 leading-relaxed">
                  {selectedHotel.category} hotel in {selectedHotel.zone}, {selectedHotel.address}.
                  {selectedHotel.boards.length > 0 && <> Available board options: {selectedHotel.boards.join(', ')}.</>}
                  {selectedHotel.hasFreeCancellation && <span className="text-green-600"> Free cancellation available on select rates.</span>}
                </div>
              </div>
            </div>

            {/* Room Types Tags - Sticky */}
            <div className="flex items-center gap-2 flex-wrap px-5 py-2.5 border-b border-gray-100 bg-white flex-shrink-0 overflow-x-auto" style={{scrollbarWidth:'none'}}>
              <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">{selectedHotel.rooms?.length || 0} Room Types</span>
              <span className="text-gray-200">|</span>
              {uniqueRoomTypes.slice(0, 8).map((rt, i) => (
                <button key={i} onClick={() => { const el = document.getElementById(`room-${selectedHotel.rooms.find(r => r.name === rt)?.code}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-medium hover:bg-blue-100 transition-colors flex-shrink-0">{rt}</button>
              ))}
              {uniqueRoomTypes.length > 8 && <span className="text-[11px] text-gray-400">+{uniqueRoomTypes.length - 8}</span>}
            </div>

            {/* Rooms List */}
            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3" style={{scrollbarWidth:'thin'}}>
              {selectedHotel.rooms && selectedHotel.rooms.length > 0 ? (
                selectedHotel.rooms.map((room) => {
                  const filteredRates = (room.rates || []).filter(rate => {
                    if (selectedBoards.length > 0 && !selectedBoards.includes(rate.boardName)) return false;
                    if (selectedCancellation === "free" && !(rate.cancellationPolicies?.length > 0 && parseFloat(rate.cancellationPolicies[0]?.amount || 0) === 0)) return false;
                    if (selectedCancellation === "nonrefundable" && rate.rateClass !== 'NRF') return false;
                    return true;
                  });
                  if (filteredRates.length === 0) return null;

                  return (
                  <div key={room.code} id={`room-${room.code}`} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span className="text-[13px] font-semibold text-gray-800">{room.name}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">{filteredRates.length} rate{filteredRates.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {filteredRates.map((rate, idx) => {
                        const total = parseFloat(rate.net);
                        const perNight = nights > 0 ? total / nights : total;
                        const hasFreeCancellation = rate.cancellationPolicies?.length > 0 && parseFloat(rate.cancellationPolicies[0]?.amount || 0) === 0;

                        return (
                          <div key={idx} className="px-4 py-3 hover:bg-blue-50/30 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0 flex-1 space-y-1.5">
                                {/* Tags row */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{rate.boardName}</span>
                                  {rate.rateClass === 'NRF' ? (
                                    <span className="text-[11px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium flex items-center gap-0.5"><XCircle className="w-2.5 h-2.5" />Non-Refundable</span>
                                  ) : hasFreeCancellation ? (
                                    <span className="text-[11px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" />Free Cancellation</span>
                                  ) : null}
                                  {rate.packaging && <span className="text-[11px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">Package</span>}
                                </div>
                                {/* Details row */}
                                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                  <span>{rate.paymentType === 'AT_WEB' ? 'Pay Online' : rate.paymentType === 'AT_HOTEL' ? 'Pay at Hotel' : rate.paymentType}</span>
                                  <span>·</span>
                                  <span>{rate.allotment} room{rate.allotment !== 1 ? 's' : ''} left</span>
                                  {rate.rooms && <><span>·</span><span>{rate.rooms} room(s)</span></>}
                                </div>
                                {/* Offers */}
                                {rate.offers && rate.offers.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {rate.offers.map((offer, oi) => (
                                      <span key={oi} className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" />{offer.name}{offer.amount ? `: €${Math.abs(parseFloat(offer.amount)).toFixed(0)} off` : ''}</span>
                                    ))}
                                  </div>
                                )}
                                {/* Cancellation detail */}
                                {rate.cancellationPolicies && rate.cancellationPolicies.length > 0 && (
                                  <div className="text-[11px] text-gray-400">
                                    {formatCancellationPolicy(rate.cancellationPolicies)}
                                  </div>
                                )}
                              </div>
                              {/* Price + CTA */}
                              <div className="text-right flex-shrink-0 min-w-[120px]">
                                <div className="text-[11px] text-gray-400">{selectedHotel.currency} {perNight.toFixed(0)} / night</div>
                                <div className="text-lg font-bold text-blue-600">{selectedHotel.currency} {total.toFixed(2)}</div>
                                <div className="text-[11px] text-gray-400 mb-2">total for {nights}n</div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(selectedHotel, room, rate); }}
                                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[12px] font-semibold"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">No rooms available</div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Image Gallery Lightbox */}
      {galleryOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <span className="text-white/70 text-sm">{galleryIndex + 1} / {galleryImages.length}</span>
            <button onClick={() => setGalleryOpen(false)} className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"><X className="w-5 h-5 text-white" /></button>
          </div>
          {/* Main image */}
          <div className="flex-1 flex items-center justify-center px-4 relative min-h-0">
            <button onClick={() => setGalleryIndex(prev => prev > 0 ? prev - 1 : galleryImages.length - 1)} className="absolute left-2 sm:left-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"><ChevronDown className="w-5 h-5 text-white rotate-90" /></button>
            <img src={galleryImages[galleryIndex]} alt="" className="max-h-full max-w-full object-contain rounded-lg" onError={(e) => e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'} />
            <button onClick={() => setGalleryIndex(prev => prev < galleryImages.length - 1 ? prev + 1 : 0)} className="absolute right-2 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"><ChevronDown className="w-5 h-5 text-white -rotate-90" /></button>
          </div>
          {/* Thumbnail strip */}
          <div className="flex-shrink-0 px-4 py-3 overflow-x-auto">
            <div className="flex gap-1.5 justify-center">
              {galleryImages.map((img, i) => (
                <button key={i} onClick={() => setGalleryIndex(i)} className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${i === galleryIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4" />{notification.message}
        </div>
      )}
      </div>
      
      {/* Overlay for mobile */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
      
      <Footer />
    </>
  );
};

export default HotelSearchResults;