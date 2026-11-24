import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Star,
  MapPin,
  Calendar,
  Wifi,
  Coffee,
  Car,
  Waves as Pool,
  Dumbbell as Gym,
  Utensils as Restaurant,
  Sparkles,
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
  Check,
  XCircle,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck,
  ArrowUpDown,
  Map,
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ReviewsModal from "./components/ReviewsModal";
import HotelSearchForm from "./components/HotelSearchForm";
import { useCart } from "./components/CartSystem";
import { useCurrency } from "./context/CurrencyContext";
import MobileFilters from "./components/MobileFilters";
import AnimatedIcon from "./components/common/AnimatedIcon";
import HotelDetailModal from "./components/hotels/HotelDetailModal";
import { AlertCircle } from "lucide-react";
import SearchLoadingScreen from './components/SearchLoadingScreen';
import logo from './images/Telitrip-Logo.png';
import { format, addDays } from "date-fns";
import { TOP_HOTELS } from "./utils/instantSearchData";


export const isPolicyOrNonPromo = (text) => {
  if (!text || typeof text !== 'string') return true;
  const lower = text.toLowerCase().trim();
  return (
    lower.includes('non-refundable') ||
    lower.includes('non refundable') ||
    lower.includes('no amendment') ||
    lower.includes('no amendments') ||
    lower.includes('cancellation') ||
    lower.includes('cancel') ||
    lower.includes('penalty') ||
    lower.includes('terms') ||
    lower.includes('policy') ||
    lower.includes('fee applies') ||
    lower.includes('fees apply') ||
    lower.includes('tax') ||
    lower === 'nrf' ||
    lower === 'nor' ||
    lower.length > 25
  );
};

const RatingCircles = ({ rating, size = 'w-5 h-5' }) => {
  const numRating = Number(rating) || 0;
  const filledCircles = Math.round(numRating);

  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`${size} rounded-full ${i < filledCircles ? 'bg-green-600' : 'bg-gray-300'
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
  const [showModifySearch, setShowModifySearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'thumbnail'
  const [selectedHotelUnavailable, setSelectedHotelUnavailable] = useState(false);
  const [unavailableHotelName, setUnavailableHotelName] = useState("");

  // Listen for Search tab press from BottomNavBar
  useEffect(() => {
    const handler = () => setShowModifySearch(s => !s);
    window.addEventListener('toggleModifySearch', handler);
    return () => window.removeEventListener('toggleModifySearch', handler);
  }, []);

  // Listen for luxury URL param from hero search
  useEffect(() => {
    if (searchParams.get("luxury") === "true") {
      setSelectedEstablishment(prev => prev.includes('119') ? prev : [...prev, '119']);
    }
  }, [searchParams]);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const addressRef = useRef(null);
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
  const { formatPKR, convert, applyCommission } = useCurrency();
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryAlbums, setGalleryAlbums] = useState(null);
  const [activeGalleryAlbum, setActiveGalleryAlbum] = useState('All');
  const [hotelContentData, setHotelContentData] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  // Helper to categorize hotel images into intuitive albums
  const buildImageAlbums = useCallback((rawImages) => {
    const albums = {
      'All': [],
      'Rooms': [],
      'General View': [],
      'Lobby': [],
      'Restaurant': [],
      'Conference': [],
      'Pool & Facilities': []
    };

    (rawImages || []).forEach(img => {
      let url = null;
      if (typeof img === 'string') {
        url = img;
      } else if (img && img.path) {
        const clean = img.path.replace(/^\/+/, '');
        url = clean.startsWith('http') ? clean : `https://photos.hotelbeds.com/giata/original/${clean}`;
      }
      if (!url) return;

      albums['All'].push(url);

      const typeCode = String(img.imageTypeCode || img.typeCode || img.type?.code || '').toUpperCase();
      const typeDesc = String(img.type || img.type?.description?.content || '').toLowerCase();
      const hasRoom = Boolean(img.roomCode || img.roomType);

      if (typeCode === 'HAB' || hasRoom || typeDesc.includes('room') || typeDesc.includes('suite') || typeDesc.includes('bedroom')) {
        albums['Rooms'].push(url);
      } else if (typeCode === 'GEN' || typeDesc.includes('general') || typeDesc.includes('view') || typeDesc.includes('exterior') || typeDesc.includes('facade')) {
        albums['General View'].push(url);
      } else if (typeCode === 'LOB' || typeDesc.includes('lobby') || typeDesc.includes('reception') || typeDesc.includes('entrance')) {
        albums['Lobby'].push(url);
      } else if (typeCode === 'RES' || typeCode === 'BAR' || typeDesc.includes('restaurant') || typeDesc.includes('dining') || typeDesc.includes('bar') || typeDesc.includes('buffet') || typeDesc.includes('breakfast')) {
        albums['Restaurant'].push(url);
      } else if (typeCode === 'CON' || typeDesc.includes('conference') || typeDesc.includes('meeting') || typeDesc.includes('event') || typeDesc.includes('hall')) {
        albums['Conference'].push(url);
      } else if (typeCode === 'SPO' || typeCode === 'TER' || typeDesc.includes('pool') || typeDesc.includes('spa') || typeDesc.includes('gym') || typeDesc.includes('terrace') || typeDesc.includes('beach') || typeDesc.includes('fitness')) {
        albums['Pool & Facilities'].push(url);
      } else {
        albums['General View'].push(url);
      }
    });

    const cleanAlbums = {};
    Object.entries(albums).forEach(([k, list]) => {
      if (list.length > 0) cleanAlbums[k] = list;
    });
    return cleanAlbums;
  }, []);

  // Multi-room tab state
  const [activeRoomTab, setActiveRoomTab] = useState(0);
  const [roomSelections, setRoomSelections] = useState({});

  // Room detail modal state
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);

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
    const isFuture = new Date() < new Date(policy.from);

    if (amount === 0 || isFuture) {
      const pkrAmount = convert ? convert(amount) : null;
      const displayAmount = pkrAmount ? `PKR ${Math.round(pkrAmount).toLocaleString()}` : `EUR ${amount.toFixed(2)}`;
      return `Free cancellation until ${fromDate}${amount > 0 ? ` (fee: ${displayAmount} thereafter)` : ''}`;
    } else {
      const pkrAmount = convert ? convert(amount) : null;
      const displayAmount = pkrAmount ? `PKR ${Math.round(pkrAmount).toLocaleString()}` : `EUR ${amount.toFixed(2)}`;
      return `Cancellation fee: ${displayAmount} from ${fromDate}`;
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
    setSelectedSight("");
    setAddressSearch("");
  };

  const handleAddToCart = (hotel, room, rate) => {
    console.log('🏨 handleAddToCart called with:', {
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomName: room.name
    });

    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = parseInt(searchParams.get("adults") || "2");
    const children = parseInt(searchParams.get("children") || "0");
    const rooms = parseInt(searchParams.get("rooms") || "1");
    const childAgesParam = searchParams.get("childAges");
    const childAges = childAgesParam ? childAgesParam.split(',').map(age => parseInt(age)).filter(a => !isNaN(a)) : [];
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalFromAPI = parseFloat(rate.net);
    const pricePerNight = nights > 0 ? (totalFromAPI / nights) : totalFromAPI;

    const cartItem = {
      type: 'hotel', // Add explicit type
      id: `${hotel.id}-${room.code}-${rate.rateKey || rate.net}`,
      hotelId: hotel.id, hotelName: hotel.name, hotelCode: hotel.code,
      roomCode: room.code, roomName: room.name, rateKey: rate.rateKey,
      price: pricePerNight, pricePerNight, currency: hotel.currency || 'AED',
      checkIn, checkOut, nights, guests: adults + children, adults, children, rooms,
      childAges,
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
    };

    console.log('🛒 Adding to cart:', cartItem);
    addToCart(cartItem);
    setNotification({ show: true, message: `${room.name} added to cart!`, type: 'success' });
    setSelectedHotel(null);
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    window.dispatchEvent(new CustomEvent('openCart'));
  };

  const handleMultiRoomAddToCart = (hotel, selections, roomConfigsList) => {
    console.log('🏨🏨 handleMultiRoomAddToCart called with:', {
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomCount: Object.keys(selections).length
    });

    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

    Object.entries(selections).forEach(([tabIdx, sel]) => {
      const config = roomConfigsList[parseInt(tabIdx)];
      const totalFromAPI = parseFloat(sel.rate.net);
      const pricePerNight = nights > 0 ? (totalFromAPI / nights) : totalFromAPI;

      addToCart({
        type: 'hotel', // Add explicit type
        id: `${hotel.id}-${sel.room.code}-${sel.rate.rateKey || sel.rate.net}-room${parseInt(tabIdx) + 1}`,
        hotelId: hotel.id, hotelName: hotel.name, hotelCode: hotel.code,
        roomCode: sel.room.code, roomName: `${sel.room.name} (Room ${parseInt(tabIdx) + 1})`, rateKey: sel.rate.rateKey,
        price: pricePerNight, pricePerNight, currency: hotel.currency || 'AED',
        checkIn, checkOut, nights, guests: (config.adults || 2) + (config.children || 0),
        adults: config.adults || 2, children: config.children || 0, rooms: 1,
        childAges: config.childAges || [],
        location: `${hotel.zoneName}, ${hotel.destinationName}`,
        boardName: sel.rate.boardName, rateClass: sel.rate.rateClass, paymentType: sel.rate.paymentType,
        cancellationPolicies: sel.rate.cancellationPolicies || [],
        cancellationPolicy: sel.rate.cancellationPolicies ? formatCancellationPolicy(sel.rate.cancellationPolicies) : "No cancellation policy",
        promotions: sel.rate.promotions || [], offers: sel.rate.offers || [],
        thumbnail: hotel.thumbnail, allotment: sel.rate.allotment,
        packaging: sel.rate.packaging, taxes: sel.rate.taxes,
        city: hotel.destinationName, zone: hotel.zoneName,
        category: hotel.categoryName, totalPrice: totalFromAPI, net: totalFromAPI,
        addedAt: new Date().toISOString(),
      });
    });

    const roomCount = Object.keys(selections).length;
    setNotification({ show: true, message: `${roomCount} room${roomCount > 1 ? 's' : ''} added to cart!`, type: 'success' });
    setSelectedHotel(null);
    setRoomSelections({});
    setActiveRoomTab(0);
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

  // Reset visible hotel count when filters or search change
  useEffect(() => {
    setVisibleCount(20);
  }, [searchParams, selectedAmenities, selectedAccommodationTypes, hotelNameSearch, selectedBoards, selectedCategories, selectedZones, selectedReviewRatings, selectedCancellation, priceMin, priceMax, selectedPromos, selectedDiscounts, selectedChains, selectedEstablishment, sortOption]);

  // Fetch hotel content (description, facilities) when a hotel is selected - Hotelbeds Certification
  useEffect(() => {
    if (!selectedHotel) {
      setHotelContentData(null);
      return;
    }
    const fetchContent = async () => {
      setLoadingContent(true);
      try {
        const res = await fetch(`${API_BASE_URL}/hotels/content/${selectedHotel.code || selectedHotel.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setHotelContentData(data.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch hotel content:', err.message);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchContent();
  }, [selectedHotel]);

  // Debounced address search via backend proxy
  useEffect(() => {
    if (addressSearch.trim().length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }
    setLoadingAddress(true);
    const city = searchParams.get("city") || '';
    const timer = setTimeout(async () => {
      try {
        const q = `${addressSearch}, ${city}`;
        const res = await fetch(`${API_BASE_URL.replace('/api', '')}/api/locations/address?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data.length > 0) {
            setAddressSuggestions(data.data);
            setShowAddressSuggestions(true);
          } else {
            setShowAddressSuggestions(false);
          }
        }
      } catch (err) { /* silent */ }
      finally { setLoadingAddress(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [addressSearch, searchParams]);

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
        setSelectedHotelUnavailable(false);
        setUnavailableHotelName("");

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

        // If searching by specific hotel code, skip geocoding
        const hotelCode = searchParams.get("hotelCode");

        if (!hotelCode && (!city || !country)) {
          throw new Error("Please provide a destination");
        }

        let lat = searchParams.get("latitude");
        let lon = searchParams.get("longitude");

        if (!lat || !lon) {
          const geoResponse = await fetch(
            `${API_BASE_URL}/geocode?q=${encodeURIComponent(city + ", " + convertCountryCode(country))}`
          );

          if (geoResponse.ok) {
            const geoResult = await geoResponse.json();
            lat = geoResult?.data?.[0]?.lat;
            lon = geoResult?.data?.[0]?.lon;
          }
        }

        // If backend geocode failed, try Nominatim directly from frontend
        if (!lat || !lon || (parseFloat(lat) === 0 && parseFloat(lon) === 0)) {
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", " + convertCountryCode(country))}&format=json&limit=1`,
              { headers: { 'User-Agent': 'TeleTrip/1.0' } }
            );
            if (nomRes.ok) {
              const nomData = await nomRes.json();
              if (nomData?.[0]) { lat = nomData[0].lat; lon = nomData[0].lon; }
            }
          } catch (nomErr) { console.warn('Direct Nominatim fallback failed:', nomErr.message); }
        }

        if (!hotelCode && (!lat || !lon || (parseFloat(lat) === 0 && parseFloat(lon) === 0))) {
          throw new Error(`Unable to find coordinates for ${city}`);
        }


        // Build per-room occupancies (Hotelbeds requires separate entries per room)
        let occupancies;
        const roomConfigsParam = searchParams.get("roomConfigs");
        if (roomConfigsParam) {
          try {
            const configs = JSON.parse(roomConfigsParam);
            occupancies = configs.map(room => {
              const occ = { rooms: 1, adults: room.adults, children: room.children || 0 };
              if (room.children > 0 && room.childAges?.length > 0) {
                occ.paxes = room.childAges.map(age => ({ type: 'CH', age: parseInt(age) }));
              }
              return occ;
            });
          } catch (e) {
            // Fallback to flat params
            occupancies = [{ rooms, adults, children: children > 0 ? children : 0 }];
            if (children > 0 && childAges.length > 0) {
              occupancies[0].paxes = childAges.map(age => ({ type: 'CH', age }));
            }
          }
        } else {
          // Backward compatibility — flat params
          occupancies = [{ rooms, adults, children: children > 0 ? children : 0 }];
          if (children > 0 && childAges.length > 0) {
            occupancies[0].paxes = childAges.map(age => ({ type: 'CH', age }));
          }
        }
        // Ensure child ages are always provided whenever children > 0 (Hotelbeds requirement)
        occupancies = occupancies.map(occ => {
          if (occ.children > 0 && (!occ.paxes || occ.paxes.length === 0)) {
            return {
              ...occ,
              paxes: Array.from({ length: occ.children }, (_, i) => ({ type: 'CH', age: 5 + (i * 2) }))
            };
          }
          return occ;
        });

        const destinationCode = searchParams.get("destinationCode");
        const requestBody = {
          stay: { checkIn, checkOut },
          occupancies,
          ...(destinationCode
            ? { destination: { code: destinationCode.toUpperCase() } }
            : {
              geolocation: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                radius: 30,
                unit: "km",
              },
            }),
        };

        // If a specific hotel code is provided, use hotel-by-ID search
        let searchEndpoint = `${API_BASE_URL}/hotels/search`;
        let searchBody = requestBody;

        if (hotelCode) {
          searchEndpoint = `${API_BASE_URL}/hotels/search-by-hotels`;
          searchBody = {
            stay: { checkIn, checkOut },
            occupancies,
            hotels: [parseInt(hotelCode)]
          };
          console.log('🏨 Searching specific hotel by ID:', hotelCode);
        }

        console.log('🔍 Hotel Search Request:', JSON.stringify(searchBody, null, 2));

        let hotelResponse;
        let isAuthenticated = false;
        const authToken = getAuthToken();

        if (authToken && !hotelCode) {
          try {
            hotelResponse = await makeAuthenticatedRequest(
              `${API_BASE_URL}/hotels/search-auth`,
              {
                method: "POST",
                body: JSON.stringify(searchBody),
              }
            );

            if (hotelResponse.ok) {
              isAuthenticated = true;
            } else {
              hotelResponse = await fetch(searchEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(searchBody),
              });
            }
          } catch {
            hotelResponse = await fetch(searchEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(searchBody),
            });
          }
        } else {
          hotelResponse = await fetch(searchEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(searchBody),
          });
        }

        const transformHotelItem = (hotel) => {
          const allRates = hotel.rooms?.flatMap((room) => room.rates) || [];
          const cheapestRate =
            allRates.length > 0
              ? allRates.reduce((min, rate) =>
                parseFloat(rate.net) < parseFloat(min.net) ? rate : min
              )
              : null;

          const cancellationPolicy = cheapestRate?.cancellationPolicies || [];
          const isFreeCancel = cheapestRate?.rateClass !== 'NRF' && cancellationPolicy.length > 0 &&
            (parseFloat(cancellationPolicy[0]?.amount || 0) === 0 || new Date() < new Date(cancellationPolicy[0].from));

          const stars = parseStars(hotel.categoryName || hotel.categoryCode);
          const is5Star = stars >= 5 || (hotel.categoryName || '').includes('5');
          const rawSegments = (hotel.segmentCodes || []).map(s => String(s.segmentCode || s));
          const hasLuxurySegment = rawSegments.includes('119');
          const isLuxury = Boolean(hotel.luxury || is5Star || hasLuxurySegment);
          const establishmentProfiles = isLuxury && !rawSegments.includes('119')
            ? ['119', ...rawSegments]
            : rawSegments;

          return {
            id: hotel.code,
            name: hotel.name,
            category: hotel.categoryName || hotel.categoryCode || "N/A",
            stars: stars,
            address: `${hotel.destinationName}, ${hotel.zoneName}`,
            zone: hotel.zoneName || "Unknown",
            thumbnail: hotel.thumbnail,
            price: hotel.minRatePkr || hotel.minRate || cheapestRate?.pricePkr || cheapestRate?.net || "N/A",
            pricePkr: parseFloat(hotel.minRatePkr || hotel.minRate || cheapestRate?.pricePkr || 0),
            minRateTaxesPkr: parseFloat(hotel.minRateTaxesPkr || 0),
            currency: "PKR",
            displayCurrency: "PKR",
            images: hotel.images || [],
            amenities: [...new Set(hotel.amenities || [])],
            facilities: hotel.facilities || [],
            type: hotel.accommodationTypeCode || hotel.type || "H",
            cancellationPolicy: cancellationPolicy,
            boards: [...new Set(allRates.map(r => r.boardName).filter(Boolean))],
            boardCodes: [...new Set(allRates.map(r => r.boardCode).filter(Boolean))],
            hasFreeCancellation: isFreeCancel,
            hasPartialCancellation: cheapestRate?.rateClass !== 'NRF' && cancellationPolicy.length > 0 && !isFreeCancel,
            hasNoCancellationInfo: !cancellationPolicy || cancellationPolicy.length === 0,
            promos: [...new Set(allRates.flatMap(r => (r.promotions || r.offers || []).map(p => p.name || p.code))
              .filter(Boolean)
              .filter(p => !isPolicyOrNonPromo(p))
              .map(p => p.trim())
            )],
            discounts: [...new Set(allRates.flatMap(r => (r.rateCommentsId ? ['Discounted'] : []).concat(
              (r.promotions || r.offers || [])
                .filter(p => !isPolicyOrNonPromo(p.name || p.code))
                .filter(p => (p.name || '').toLowerCase().includes('discount'))
                .map(p => p.name)
            )).filter(Boolean))],
            chain: hotel.chainCode || hotel.chain || null,
            packaging: allRates.some(r => r.packaging === true),
            exclusiveDeal: hotel.exclusiveDeal || allRates.some(r => r.exclusiveDeal === true),
            luxury: isLuxury,
            isLuxuryCollection: isLuxury,
            preferred: hotel.preferred || false,
            establishmentProfiles: establishmentProfiles,
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
        };

        let shouldFallbackToDestination = false;
        let hotelResult = null;

        if (!hotelResponse.ok) {
          let isNoAvailability = false;
          try {
            const errClone = await hotelResponse.clone().json();
            if (hotelResponse.status === 404 || errClone?.message?.toLowerCase().includes("no hotel") || errClone?.message?.toLowerCase().includes("no availability")) {
              isNoAvailability = true;
            }
          } catch (_) {}

          if (hotelCode && (isNoAvailability || hotelResponse.status === 404)) {
            shouldFallbackToDestination = true;
          } else if (isNoAvailability || hotelResponse.status === 404) {
            console.warn('⚠️ No hotels available for searched criteria');
            setHotels([]);
            return;
          } else {
            const errorText = await hotelResponse.text();
            console.error('❌ Hotel API Error:', errorText);
            throw new Error(`Hotel search failed: ${hotelResponse.status}`);
          }
        } else {
          hotelResult = await hotelResponse.json();
          console.log('✅ Hotel API Response:', hotelResult);
          const hotelsRaw = hotelResult.data?.hotels?.hotels || hotelResult.data?.hotels || [];
          const hotelsArray = Array.isArray(hotelsRaw) ? hotelsRaw : [];
          if (hotelCode && hotelsArray.length === 0) {
            shouldFallbackToDestination = true;
          }
        }

        // If specific hotel search returned 0 rooms or was unavailable, search the destination for similar options
        if (shouldFallbackToDestination) {
          console.log('🏨 Selected hotel has no rooms for requested dates. Searching similar available options in destination...');
          setSelectedHotelUnavailable(true);
          setUnavailableHotelName(hotelName || searchParams.get("hotelName") || "");

          try {
            let fallbackRes;
            if (authToken) {
              try {
                fallbackRes = await makeAuthenticatedRequest(
                  `${API_BASE_URL}/hotels/search-auth`,
                  {
                    method: "POST",
                    body: JSON.stringify(requestBody),
                  }
                );
                if (fallbackRes.ok) {
                  isAuthenticated = true;
                } else {
                  fallbackRes = await fetch(`${API_BASE_URL}/hotels/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
                  });
                }
              } catch {
                fallbackRes = await fetch(`${API_BASE_URL}/hotels/search`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(requestBody),
                });
              }
            } else {
              fallbackRes = await fetch(`${API_BASE_URL}/hotels/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
              });
            }

            if (fallbackRes && fallbackRes.ok) {
              const fbResult = await fallbackRes.json();
              const fbRaw = fbResult.data?.hotels?.hotels || fbResult.data?.hotels || [];
              const fbArray = Array.isArray(fbRaw) ? fbRaw : [];
              if (fbArray.length > 0) {
                if (isAuthenticated && fbResult.user) {
                  setUser(fbResult.user);
                }
                const transformedHotels = fbArray.map(transformHotelItem);
                setHotels(transformedHotels);
                return;
              }
            }
          } catch (fbErr) {
            console.warn('Fallback search error:', fbErr);
          }

          setHotels([]);
          return;
        }

        if (!hotelResult.success || !hotelResult.data?.hotels) {
          console.warn('⚠️ No hotels found in response for criteria');
          setHotels([]);
          return;
        }

        if (isAuthenticated && hotelResult.user) {
          setUser(hotelResult.user);
        }

        const hotelsRaw = hotelResult.data.hotels?.hotels || hotelResult.data.hotels || [];
        const hotelsArray = Array.isArray(hotelsRaw) ? hotelsRaw : [];
        const transformedHotels = hotelsArray.map(transformHotelItem);

        // Filter by hotel name if provided and not in fallback mode
        const finalHotels = (hotelName && !hotelCode)
          ? transformedHotels.filter(h => h.name.toLowerCase().includes(hotelName.toLowerCase()))
          : transformedHotels;

        setHotels(finalHotels);
      } catch (err) {
        console.error('❌ Error fetching hotels:', err);
        const errMsg = err?.message || "";
        if (errMsg.toLowerCase().includes("no hotel") || errMsg.toLowerCase().includes("no availability") || errMsg.includes("404")) {
          setHotels([]);
        } else {
          setError(errMsg || "Failed to fetch hotels");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);



  // Dynamic filter options derived from hotel data (memoized)
  const dynamicBoards = useMemo(() => [...new Set(hotels.flatMap(h => h.boards))].filter(Boolean).sort(), [hotels]);
  const dynamicCategories = useMemo(() => [...new Set(hotels.map(h => h.category))].filter(Boolean).sort(), [hotels]);
  const dynamicZones = useMemo(() => [...new Set(hotels.map(h => h.zone))].filter(Boolean).sort(), [hotels]);
  const dynamicPromos = useMemo(() => [...new Set(hotels.flatMap(h => h.promos))].filter(Boolean).sort(), [hotels]);
  const dynamicDiscounts = useMemo(() => [...new Set(hotels.flatMap(h => h.discounts))].filter(Boolean).sort(), [hotels]);
  const dynamicChains = useMemo(() => [...new Set(hotels.map(h => h.chain).filter(Boolean))].sort(), [hotels]);
  const dynamicEstablishment = useMemo(() => [...new Set(hotels.flatMap(h => h.establishmentProfiles))].filter(Boolean).sort(), [hotels]);
  const dynamicAccommodationTypes = useMemo(() => [...new Set(hotels.map(h => h.type).filter(Boolean))], [hotels]);

  // Count helpers (memoized)
  const filterCounts = useMemo(() => {
    const counts = { boards: {}, categories: {}, zones: {}, promos: {}, discounts: {}, chains: {}, establishment: {}, accommodationTypes: {}, amenities: {} };
    hotels.forEach(h => {
      h.boards.forEach(b => { counts.boards[b] = (counts.boards[b] || 0) + 1; });
      counts.categories[h.category] = (counts.categories[h.category] || 0) + 1;
      counts.zones[h.zone] = (counts.zones[h.zone] || 0) + 1;
      h.promos.forEach(p => { counts.promos[p] = (counts.promos[p] || 0) + 1; });
      h.discounts.forEach(d => { counts.discounts[d] = (counts.discounts[d] || 0) + 1; });
      if (h.chain) counts.chains[h.chain] = (counts.chains[h.chain] || 0) + 1;
      h.establishmentProfiles.forEach(e => { counts.establishment[e] = (counts.establishment[e] || 0) + 1; });
      counts.accommodationTypes[h.type] = (counts.accommodationTypes[h.type] || 0) + 1;
      h.amenities.forEach(a => { counts.amenities[a] = (counts.amenities[a] || 0) + 1; });
    });
    counts.freeCancellation = hotels.filter(h => h.hasFreeCancellation).length;
    counts.partialCancellation = hotels.filter(h => h.hasPartialCancellation).length;
    counts.nonRefundable = hotels.filter(h => !h.hasFreeCancellation && !h.hasNoCancellationInfo).length;
    counts.noCancellationInfo = hotels.filter(h => h.hasNoCancellationInfo).length;
    counts.packagingWith = hotels.filter(h => h.packaging).length;
    counts.packagingWithout = hotels.filter(h => !h.packaging).length;
    return counts;
  }, [hotels]);
  const countReview = useCallback((minRating) => hotels.filter(h => { const r = hotelReviews[h.id]; return r && r.rating >= minRating; }).length, [hotels, hotelReviews]);

  // Establishment profile labels
  const establishmentLabels = {
    '119': 'Luxury Collection', '103': 'Adults Only', '37': 'Beach Hotels',
    '34': 'Business Hotels', '31': 'Design', '36': 'Family Hotels',
    '33': 'City Hotels', '35': 'Ski Hotels', '38': 'Spa Hotels',
  };

  // Compute price bounds from all hotels for slider (in PKR)
  const priceBounds = useMemo(() => {
    if (!hotels.length) return { min: 0, max: 1000 };
    const prices = hotels.map(h => parseFloat(h.price)).filter(p => p > 0);
    const minEur = Math.floor(Math.min(...prices));
    const maxEur = Math.ceil(Math.max(...prices));
    const minPkr = convert ? Math.floor(convert(minEur) || minEur) : minEur;
    const maxPkr = convert ? Math.ceil(convert(maxEur) || maxEur) : maxEur;
    return { min: minPkr, max: maxPkr, minEur, maxEur };
  }, [hotels, convert]);

  // Filter hotels (memoized)
  const filteredHotels = useMemo(() => hotels.filter(hotel => {
    if (hotelNameSearch && !hotel.name.toLowerCase().includes(hotelNameSearch.toLowerCase())) return false;
    if (selectedSight && hotel.zone !== selectedSight) return false;
    if (addressSearch && addressSearch.trim().length >= 3) {
      const qTerms = addressSearch.toLowerCase().split(/[,\s]+/).filter(t => t.length > 2);
      const targetText = `${hotel.name || ''} ${hotel.address || ''} ${hotel.zone || ''} ${hotel.destinationName || ''}`.toLowerCase();
      const matches = qTerms.length > 0 ? qTerms.some(term => targetText.includes(term)) : targetText.includes(addressSearch.toLowerCase());
      if (!matches) return false;
    }
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
    if (selectedCancellation === "nonrefundable" && (hotel.hasFreeCancellation || hotel.hasNoCancellationInfo)) return false;
    if (selectedCancellation === "notavailable" && !hotel.hasNoCancellationInfo) return false;
    const price = parseFloat(hotel.price);
    const pricePkr = convert ? (convert(price) || price) : price;
    if (priceMin && pricePkr < parseFloat(priceMin)) return false;
    if (priceMax && pricePkr > parseFloat(priceMax)) return false;
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
  }), [hotels, hotelNameSearch, selectedSight, addressSearch, selectedBoards, selectedCategories, selectedZones, selectedReviewRatings, hotelReviews, selectedCancellation, priceMin, priceMax, selectedPromos, selectedDiscounts, selectedChains, selectedEstablishment, selectedPackaging, selectedAmenities, selectedAccommodationTypes, convert]);

  const sortedHotels = useMemo(() => [...filteredHotels].sort((a, b) => {
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
  }), [filteredHotels, sortOption]);

  // Fetch reviews ONLY for currently visible hotels to prevent network flooding and main thread lag
  useEffect(() => {
    if (sortedHotels && sortedHotels.length > 0) {
      const visible = sortedHotels.slice(0, visibleCount);
      visible.forEach(hotel => {
        fetchTripAdvisorReviews(hotel);
      });
    }
  }, [sortedHotels, visibleCount]);

  const cityParam = searchParams.get("city") || searchParams.get("destination") || "this destination";
  const countryParam = searchParams.get("country") || "";
  const hotelNameParam = searchParams.get("hotelName");
  const hotelCodeParam = searchParams.get("hotelCode");
  const checkInParam = searchParams.get("checkIn") || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const adultsParam = searchParams.get("adults") || "2";
  const childrenParam = searchParams.get("children") || "0";
  const roomsParam = searchParams.get("rooms") || "1";

  const stayNights = useMemo(() => {
    if (!checkInParam || !checkOutParam) return 1;
    try {
      const diff = Math.ceil((new Date(checkOutParam) - new Date(checkInParam)) / (1000 * 60 * 60 * 24));
      return isNaN(diff) || diff < 1 ? 1 : diff;
    } catch (_) {
      return 1;
    }
  }, [checkInParam, checkOutParam]);

  const formatReadableDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return !isNaN(d.getTime())
        ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : dateStr;
    } catch (_) {
      return dateStr;
    }
  };

  const handleShiftDates = (days) => {
    try {
      const inDate = checkInParam ? new Date(checkInParam) : new Date();
      const outDate = checkOutParam ? new Date(checkOutParam) : addDays(new Date(), 2);
      const newIn = addDays(inDate, days);
      const newOut = addDays(outDate, days);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("checkIn", format(newIn, "yyyy-MM-dd"));
      newParams.set("checkOut", format(newOut, "yyyy-MM-dd"));
      navigate(`/hotels?${newParams.toString()}`);
    } catch (e) {
      console.error("Date shift error:", e);
    }
  };

  const handleNextWeekend = () => {
    try {
      const today = new Date();
      const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
      const nextFri = addDays(today, daysUntilFriday);
      const nextSun = addDays(nextFri, 2);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("checkIn", format(nextFri, "yyyy-MM-dd"));
      newParams.set("checkOut", format(nextSun, "yyyy-MM-dd"));
      navigate(`/hotels?${newParams.toString()}`);
    } catch (e) {
      console.error("Next weekend error:", e);
    }
  };

  const handleSearchAllCityHotels = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("hotelName");
    newParams.delete("hotelCode");
    navigate(`/hotels?${newParams.toString()}`);
  };

  const handleSelectAlternativeHotel = (altHotel) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("hotelName", altHotel.name);
    if (altHotel.code) {
      newParams.set("hotelCode", altHotel.code);
    }
    navigate(`/hotels?${newParams.toString()}`);
  };

  const alternativeHotels = useMemo(() => {
    const cityLower = (cityParam || "").toLowerCase().trim();
    const matches = TOP_HOTELS.filter((h) =>
      (h.destinationName && h.destinationName.toLowerCase().includes(cityLower)) ||
      (h.zoneName && h.zoneName.toLowerCase().includes(cityLower)) ||
      (h.name && h.name.toLowerCase().includes(cityLower)) ||
      (countryParam && h.countryCode && h.countryCode.toLowerCase() === countryParam.toLowerCase())
    );
    if (matches.length > 0) return matches.slice(0, 4);
    return TOP_HOTELS.slice(0, 4);
  }, [cityParam, countryParam]);

  const activeFilterCount = selectedAmenities.length + selectedAccommodationTypes.length + selectedBoards.length + selectedCategories.length + selectedZones.length + selectedReviewRatings.length + selectedPromos.length + selectedDiscounts.length + selectedChains.length + selectedEstablishment.length + (hotelNameSearch ? 1 : 0) + (selectedCancellation ? 1 : 0) + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (selectedSight ? 1 : 0) + (addressSearch ? 1 : 0);

  if (loading) {
    return (
      <>
        <Header />
        <SearchLoadingScreen type="hotels" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gray-50">
          <img src={logo} alt="Telitrip" className="h-12 mb-8 opacity-80" />
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 max-w-md mb-2">{error}</p>
          <p className="text-xs text-gray-400 max-w-sm mb-6">This could be due to a network issue or the hotels being temporarily unavailable. Please try again.</p>
          <div className="flex gap-3">
            <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">Try Again</button>
            <button onClick={() => window.location.href = '/home'} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">Back to Search</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-left">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24 pb-16 space-y-4">
        {user && (
          <div className="bg-blue-50/90 rounded-2xl p-4 flex items-center border-0 shadow-xs">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 text-sm font-semibold">Welcome back, {user.name}! Your personalized search results:</span>
          </div>
        )}

        {/* ── TOP SEARCH SUMMARY CAPSULE & MODIFIABLE SEARCH FORM ── */}
        <div className="relative z-40 w-full mb-3">
          {/* Summary Capsule Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-gray-900 truncate">
                  {searchParams.get("city") || "Dubai"}{searchParams.get("country") ? `, ${searchParams.get("country")}` : ''}
                  {searchParams.get("hotelName") ? ` · "${searchParams.get("hotelName")}"` : ''}
                </div>
                <div className="text-xs text-gray-500 truncate flex items-center gap-1.5 flex-wrap">
                  <span>{searchParams.get("checkIn")} → {searchParams.get("checkOut")}</span>
                  <span>·</span>
                  <span>{searchParams.get("adults") || 2} Adults{searchParams.get("children") && searchParams.get("children") !== "0" ? `, ${searchParams.get("children")} Children` : ''}</span>
                  <span>·</span>
                  <span>{searchParams.get("rooms") || 1} Room</span>
                </div>
                {/* Integrated Showing Results line */}
                <div className="text-[11px] sm:text-xs font-bold text-blue-600 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span>Showing {sortedHotels.length} verified {searchParams.get("city") || "Dubai"} properties</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowModifySearch(s => !s)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 select-none ${showModifySearch
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
              >
                <span>{showModifySearch ? 'Close' : 'Modify Search'}</span>
              </button>
            </div>
          </div>

          {/* Expandable Latest Modern Search Form */}
          {showModifySearch && (
            <div className="mt-3 p-3 sm:p-5 bg-white rounded-3xl shadow-lg border border-slate-200/90 animate-in fade-in-0 duration-200">
              <HotelSearchForm defaultTab="stays" variant="light" onSearch={() => setShowModifySearch(false)} />
            </div>
          )}
        </div>

        {/* ── MAIN 12-COLUMN RESPONSIVE GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filter Sidebar (Desktop Sticky) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <aside className="sticky top-20 w-full bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-2xs text-left max-h-[calc(100vh-5.5rem)] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-extrabold text-gray-900">Filters</span>
                </div>
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer">Reset all</button>
              </div>

              {/* Quick Toggles: Luxury & Free Cancel */}
              <div className="space-y-2">
                <label
                  onClick={() => {
                    setSelectedEstablishment(prev => prev.includes('119') ? prev.filter(x => x !== '119') : [...prev, '119']);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer select-none transition-all ${selectedEstablishment.includes('119')
                    ? 'bg-amber-50 border border-amber-300 text-amber-950 font-bold shadow-xs'
                    : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <AnimatedIcon name="crown" animation="pulse" size={16} className="text-amber-500" />
                    <span>Luxury Collection Only</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedEstablishment.includes('119')}
                    onChange={() => { }}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label
                  onClick={() => {
                    setSelectedCancellation(prev => prev === 'free' ? '' : 'free');
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer select-none transition-all ${selectedCancellation === 'free'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold shadow-xs'
                    : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Free Cancellation Only</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCancellation === 'free'}
                    onChange={() => { }}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>
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
                  <div className="relative" ref={addressRef}>
                    <label className="text-[11px] text-gray-500 mb-1 block">Specific address</label>
                    <input type="text" value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} onFocus={() => addressSuggestions.length > 0 && setShowAddressSuggestions(true)} placeholder="Street, point of interest..." className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                    {showAddressSuggestions && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {loadingAddress ? (
                          <div className="px-2.5 py-2 text-[12px] text-gray-400 text-center">Searching...</div>
                        ) : addressSuggestions.length > 0 ? (
                          addressSuggestions.map((s, i) => (
                            <div key={i} onClick={() => { setAddressSearch(s.short); setShowAddressSuggestions(false); }} className="px-2.5 py-1.5 hover:bg-blue-50 cursor-pointer transition-colors">
                              <div className="text-[12px] text-gray-700 truncate">{s.short}</div>
                              <div className="text-[10px] text-gray-400 truncate">{s.display}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-2.5 py-2 text-[12px] text-gray-400 text-center">No results</div>
                        )}
                      </div>
                    )}
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
                        <label key={board} className="w-full flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input type="checkbox" checked={selectedBoards.includes(board)} onChange={() => setSelectedBoards(prev => prev.includes(board) ? prev.filter(b => b !== board) : [...prev, board])} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{board}</span>
                          <span className="text-[11px] text-gray-400">{filterCounts.boards[board] || 0}</span>
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
                        <label key={cat} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{cat}</span>
                          <span className="text-[11px] text-gray-400">{filterCounts.categories[cat] || 0}</span>
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
                      <label key={opt.value} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                        <input type="radio" name="reviewRating" value={opt.value} checked={selectedReviewRatings.includes(opt.value)} onChange={() => setSelectedReviewRatings([opt.value])} className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{opt.label}</span>
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
                  <span className="text-[13px] font-semibold text-gray-800">Price Range (PKR)</span>
                  {expandedSections.price ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.price && (
                  <div className="mt-2 space-y-3">
                    <div className="relative h-6 flex items-center">
                      <div className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full" />
                      <div
                        className="absolute h-1 bg-blue-500 rounded-full"
                        style={{
                          left: `${((parseFloat(priceMin) || priceBounds.min) - priceBounds.min) / (priceBounds.max - priceBounds.min || 1) * 100}%`,
                          right: `${100 - ((parseFloat(priceMax) || priceBounds.max) - priceBounds.min) / (priceBounds.max - priceBounds.min || 1) * 100}%`
                        }}
                      />
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        value={parseFloat(priceMin) || priceBounds.min}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          const maxV = parseFloat(priceMax) || priceBounds.max;
                          setPriceMin(v >= maxV ? String(maxV - 1) : String(v));
                        }}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                        style={{ zIndex: 3 }}
                      />
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        value={parseFloat(priceMax) || priceBounds.max}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          const minV = parseFloat(priceMin) || priceBounds.min;
                          setPriceMax(v <= minV ? String(minV + 1) : String(v));
                        }}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                        style={{ zIndex: 4 }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder={String(priceBounds.min)}
                        className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <span className="text-gray-300 text-xs">–</span>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder={String(priceBounds.max)}
                        className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>PKR {priceBounds.min.toLocaleString()}</span>
                      <span>PKR {priceBounds.max.toLocaleString()}</span>
                    </div>
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
                        <label key={zone} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedZones.includes(zone)}
                            onChange={() => setSelectedZones(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{zone}</span>
                          <span className="text-[11px] text-gray-400">{filterCounts.zones[zone] || 0}</span>
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
                      <label key={type.id} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                        <input type="checkbox" checked={selectedAccommodationTypes.includes(type.id)} onChange={() => handleAccommodationTypeChange(type.id)} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{type.name}</span>
                        <span className="text-[11px] text-gray-400">{filterCounts.accommodationTypes[type.id] || 0}</span>
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
                      <label key={amenity.id} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity.id)}
                          onChange={() => handleAmenityChange(amenity.id)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <amenity.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{amenity.name}</span>
                        <span className="text-[11px] text-gray-400">{filterCounts.amenities[amenity.id] || 0}</span>
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
                        <label key={promo} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedPromos.includes(promo)}
                            onChange={() => setSelectedPromos(prev => prev.includes(promo) ? prev.filter(p => p !== promo) : [...prev, promo])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{promo}</span>
                          <span className="text-[11px] text-gray-400">{filterCounts.promos[promo] || 0}</span>
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
                      { value: "free", label: "Free cancellation", count: filterCounts.freeCancellation },
                      { value: "partial", label: "Partial cancellation fees", count: filterCounts.partialCancellation },
                      { value: "nonrefundable", label: "Non refundable", count: filterCounts.nonRefundable },
                      { value: "notavailable", label: "Fees not available", count: filterCounts.noCancellationInfo },
                    ].map(opt => (
                      <label key={opt.value} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                        <input type="radio" name="cancellation" value={opt.value} checked={selectedCancellation === opt.value} onChange={(e) => setSelectedCancellation(e.target.value)} className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{opt.label}</span>
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
                        <label key={est} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedEstablishment.includes(est)}
                            onChange={() => setSelectedEstablishment(prev => prev.includes(est) ? prev.filter(e => e !== est) : [...prev, est])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{establishmentLabels[est] || est}</span>
                          <span className="text-[11px] text-gray-400">{filterCounts.establishment[est] || 0}</span>
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
                        <label key={disc} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedDiscounts.includes(disc)}
                            onChange={() => setSelectedDiscounts(prev => prev.includes(disc) ? prev.filter(d => d !== disc) : [...prev, disc])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{disc}</span>
                          <span className="text-[11px] text-gray-400">{filterCounts.discounts[disc] || 0}</span>
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
                        <label key={chain} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedChains.includes(chain)}
                            onChange={() => setSelectedChains(prev => prev.includes(chain) ? prev.filter(c => c !== chain) : [...prev, chain])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{chain}</span>
                          <span className="text-[11px] text-gray-400">{filterCounts.chains[chain] || 0}</span>
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
                      { value: "without", label: "Without package", count: filterCounts.packagingWithout },
                      { value: "with", label: "With package", count: filterCounts.packagingWith },
                    ].map(opt => (
                      <label key={opt.value} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                        <input type="radio" name="packaging" value={opt.value} checked={selectedPackaging === opt.value} onChange={(e) => setSelectedPackaging(e.target.value)} className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{opt.label}</span>
                        <span className="text-[11px] text-gray-400">{opt.count}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Right Column: Quick Chips + Results Header + Hotel Cards */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Option A: Quick-Filter Chips Bar (Desktop Only - hidden on mobile to maximize card visibility) */}
            <div className="hidden lg:flex sticky top-20 z-30 bg-slate-50/95 backdrop-blur-xs py-2 -mx-1 px-1 items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedEstablishment(prev => prev.includes('119') ? prev.filter(x => x !== '119') : [...prev, '119']);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${selectedEstablishment.includes('119')
                  ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-500'
                  : 'bg-white text-gray-700 border border-gray-200 shadow-2xs hover:bg-gray-50'
                  }`}
              >
                <AnimatedIcon name="crown" animation="pulse" size={13} className={selectedEstablishment.includes('119') ? 'text-amber-100' : 'text-amber-500'} />
                <span>Luxury Collection</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCancellation(prev => prev === 'free' ? '' : 'free');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${selectedCancellation === 'free'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600'
                  : 'bg-white text-gray-700 border border-gray-200 shadow-2xs hover:bg-gray-50'
                  }`}
              >
                <AnimatedIcon name="shield" animation="pulse" size={13} className={selectedCancellation === 'free' ? 'text-emerald-100' : 'text-emerald-500'} />
                <span>Free Cancellation</span>
              </button>

              {dynamicBoards.some(b => b.toUpperCase().includes('BREAKFAST')) && (
                <button
                  type="button"
                  onClick={() => {
                    const bf = dynamicBoards.find(b => b.toUpperCase().includes('BREAKFAST'));
                    if (bf) {
                      setSelectedBoards(prev => prev.includes(bf) ? prev.filter(x => x !== bf) : [...prev, bf]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${selectedBoards.some(b => b.toUpperCase().includes('BREAKFAST'))
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600'
                    : 'bg-white text-gray-700 border border-gray-200 shadow-2xs hover:bg-gray-50'
                    }`}
                >
                  <AnimatedIcon name="breakfast" animation="bounce" size={13} className={selectedBoards.some(b => b.toUpperCase().includes('BREAKFAST')) ? 'text-amber-200' : 'text-amber-600'} />
                  <span>Breakfast Included</span>
                </button>
              )}

              {dynamicCategories.some(c => c.startsWith('5')) && (
                <button
                  type="button"
                  onClick={() => {
                    const five = dynamicCategories.find(c => c.startsWith('5'));
                    if (five) {
                      setSelectedCategories(prev => prev.includes(five) ? prev.filter(x => x !== five) : [...prev, five]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${selectedCategories.some(c => c.startsWith('5'))
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600'
                    : 'bg-white text-gray-700 border border-gray-200 shadow-2xs hover:bg-gray-50'
                    }`}
                >
                  <AnimatedIcon name="star" animation="pulse" size={13} className={selectedCategories.some(c => c.startsWith('5')) ? 'text-amber-200' : 'text-amber-400'} />
                  <span>5-Star Only</span>
                </button>
              )}
            </div>

            {/* Sleek Space-Saving Toolbar: Sort Selector + View Mode Switcher */}
            <div className="flex items-center justify-between gap-2 py-1 px-0.5 sm:px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort:</span>
                <div className="relative flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 pointer-events-none" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="pl-7 pr-3 py-1.5 text-xs font-bold bg-white border border-slate-200/90 rounded-xl text-slate-700 shadow-2xs hover:border-blue-500 cursor-pointer outline-none"
                  >
                    <option value="default">Recommended</option>
                    <option value="priceLowHigh">Price: Low to High</option>
                    <option value="priceHighLow">Price: High to Low</option>
                    <option value="ratingHighLow">Rating: High to Low</option>
                    <option value="ratingLowHigh">Rating: Low to High</option>
                  </select>
                </div>
              </div>

              {/* View Mode Toggle: List / Grid */}
              <div className="flex items-center bg-white border border-slate-200/90 p-0.5 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'list'
                    ? 'bg-blue-50 text-blue-600 font-black shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="text-[11px]">List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('thumbnail')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'thumbnail'
                    ? 'bg-blue-50 text-blue-600 font-black shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Grid</span>
                </button>
              </div>
            </div>

            {/* ── SELECTED HOTEL UNAVAILABILITY & SIMILAR AVAILABLE OPTIONS BANNER ── */}
            {selectedHotelUnavailable && hotels.length > 0 && (
              <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 border border-amber-200/90 rounded-2xl sm:rounded-3xl shadow-xs text-left animate-in fade-in duration-200">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 border border-amber-300/60">
                        Property Unavailable
                      </span>
                      <span className="text-xs text-amber-800 font-semibold">
                        {formatReadableDate(checkInParam)} → {formatReadableDate(checkOutParam)} ({stayNights} {stayNights === 1 ? 'night' : 'nights'})
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {unavailableHotelName ? `"${unavailableHotelName}" is sold out for your selected dates` : "The selected hotel is not available for these dates"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      This property has no room allotments available for your party ({adultsParam} Adults{childrenParam !== '0' ? `, ${childrenParam} Children` : ''} · {roomsParam} Room).
                      <span className="font-bold text-blue-700 block sm:inline sm:ml-1">
                        However, we found {hotels.length} verified similar hotels in {cityParam || 'this destination'} available for your exact dates and criteria:
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hotel Cards: Supports List View or 2-Column Grid on Mobile (3-Col on Desktop) */}
            <div className={viewMode === 'thumbnail' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-4.5 pb-6" : "space-y-4 pb-6"}>
              {sortedHotels.slice(0, visibleCount).map((hotel, cardIndex) => {
                const checkIn = searchParams.get("checkIn");
                const checkOut = searchParams.get("checkOut");
                const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 1;
                const rawPrice = parseFloat(hotel.pricePkr || hotel.price) || 0;
                const totalPrice = rawPrice;
                const pricePerNight = nights > 0 ? Math.round(totalPrice / nights) : totalPrice;
                const taxesAndCharges = hotel.minRateTaxesPkr || Math.round(totalPrice * 0.22);
                const strikethroughPrice = Math.round(totalPrice * 1.18);
                const roomTypes = [...new Set((hotel.rooms || []).map(r => r.name))];

                const hotelImage = hotel.thumbnail || (hotel.images && hotel.images[0]?.path ? `https://photos.hotelbeds.com/giata/original/${hotel.images[0].path.replace(/^\/+/, '')}` : "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg");

                {/* ── BENTO GRID CARD (3-COLUMNS ON DESKTOP, COMPLETE DETAILS) ── */ }
                if (viewMode === 'thumbnail') {
                  return (
                    <div
                      key={hotel.id}
                      onClick={() => {
                        setRoomSelections({});
                        setActiveRoomTab(0);
                        setSelectedHotel(hotel);
                      }}
                      className="bento-card bg-white rounded-2xl overflow-hidden flex flex-col justify-between group h-full cursor-pointer border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow"
                    >
                      <div>
                        {/* 1. Bento Image Tile with Aspect Ratio & Badges */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                          <img
                            loading="lazy"
                            src={hotelImage}
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const src = e.target.src || '';
                              if (src.includes('/giata/bigger/')) {
                                e.target.src = src.replace('/giata/bigger/', '/giata/original/');
                              } else if (src.includes('/giata/original/')) {
                                e.target.src = src.replace('/giata/original/', '/giata/medium/');
                              } else {
                                e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

                          {/* Top Badge: Luxury or Promo */}
                          <div className="absolute top-2.5 left-2.5 flex items-start pointer-events-none">
                            {(hotel.isLuxuryCollection || hotel.stars >= 5 || hotel.establishmentProfiles?.includes('119')) ? (
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/75 backdrop-blur-md text-amber-300 shadow-sm flex items-center gap-1.5">
                                <AnimatedIcon name="crown" animation="pulse" size={11} className="text-amber-300" />
                                <span>Luxury Collection</span>
                              </span>
                            ) : (hotel.promos?.length > 0 || hotel.discounts?.length > 0) ? (
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/90 backdrop-blur-md text-white shadow-sm flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                <span className="truncate max-w-[110px]">{hotel.promos?.[0] || 'Offer'}</span>
                              </span>
                            ) : null}
                          </div>

                          {/* Bottom Overlay on Image: Review score clickable tag */}
                          {hotelReviews[hotel.id] && hotelReviews[hotel.id].rating && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReviewsModal(hotel);
                              }}
                              className="absolute bottom-2 right-2.5 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 hover:bg-black/90 transition-colors cursor-pointer shadow-xs"
                              title="Click to view traveler reviews"
                            >
                              <AnimatedIcon name="star" animation="pulse" size={11} className="text-amber-400" />
                              <span>{Number(hotelReviews[hotel.id].rating).toFixed(1)}</span>
                              <span className="text-gray-300 text-[10px] hidden sm:inline">
                                ({hotelReviews[hotel.id].numReviews ? hotelReviews[hotel.id].numReviews.toLocaleString() : '100+'})
                              </span>
                            </button>
                          )}
                        </div>

                        {/* 2. Bento Card Body: Complete Details */}
                        <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 text-left">
                          {/* Stars + Category + Zone */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex text-amber-400">
                              {[...Array(hotel.stars || 4)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">
                              {hotel.stars >= 5 ? '5-Star' : `${hotel.stars || 4}-Star`}
                            </span>
                            {(hotel.zoneName || hotel.city) && (
                              <>
                                <span className="text-gray-300 hidden sm:inline">·</span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md truncate max-w-[100px] hidden sm:inline">
                                  {hotel.zoneName || hotel.city}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Hotel Name */}
                          <h2 className="text-xs sm:text-base font-extrabold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {hotel.name}
                          </h2>

                          {/* Address */}
                          <div className="hidden sm:flex items-center text-gray-400 text-xs truncate">
                            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-gray-400" />
                            <span className="truncate">{hotel.address}</span>
                          </div>

                          {/* Inclusions: Meal Plan + Cancellation + Promo */}
                          <div className="pt-0.5 sm:pt-1 flex items-center gap-1 sm:gap-1.5 flex-wrap text-xs">
                            {/* Meal / Board */}
                            <span className="font-semibold text-gray-700 flex items-center gap-1 text-[9px] sm:text-[11px] bg-gray-100/80 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-[110px]">
                              <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-blue-600 shrink-0" />
                              <span className="truncate">{hotel.boards?.[0] || 'Room Only'}</span>
                            </span>

                            {/* Cancellation Policy */}
                            {hotel.hasFreeCancellation ? (
                              <span className="font-semibold text-emerald-700 flex items-center gap-1 text-[9px] sm:text-[11px] bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md truncate">
                                <CheckCircle className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">Free Cancel</span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* 3. Bento Card Footer: Price & Primary CTA */}
                      <div className="p-2.5 sm:p-4 pt-2 border-t border-slate-100 bg-slate-50/70 space-y-2 text-left">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">
                              Total Stay
                            </span>
                            <div className="text-sm sm:text-xl font-black text-slate-900 leading-tight">
                              PKR {totalPrice.toLocaleString()}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                              +PKR {taxesAndCharges.toLocaleString()} taxes
                            </div>
                          </div>

                          {/* Review Rating Label & Count */}
                          {hotelReviews[hotel.id] && hotelReviews[hotel.id].rating && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReviewsModal(hotel);
                              }}
                              className="hidden sm:block text-right cursor-pointer group/rev p-0 bg-transparent border-0"
                              title="Click to view traveler reviews"
                            >
                              <span className="text-[11px] font-bold text-gray-900 group-hover/rev:text-blue-600 block">
                                {Number(hotelReviews[hotel.id].rating) >= 4.5 ? 'Exceptional' : Number(hotelReviews[hotel.id].rating) >= 4.0 ? 'Very Good' : 'Good'}
                              </span>
                              <span className="text-[10px] text-gray-400 block">
                                {hotelReviews[hotel.id].numReviews ? `${hotelReviews[hotel.id].numReviews.toLocaleString()} reviews` : 'Verified'}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Primary View Rooms CTA */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomSelections({});
                            setActiveRoomTab(0);
                            setSelectedHotel(hotel);
                          }}
                          className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-[11px] sm:text-xs font-extrabold inline-flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                        >
                          <Bed className="w-3.5 h-3.5" />
                          <span>View Rooms</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                {/* ── OPTION A: SLEEK MODERN HORIZONTAL LIST VIEW (BOOKING.COM STYLE) ── */ }
                const ratingVal = hotelReviews[hotel.id]?.rating ? Number(hotelReviews[hotel.id].rating).toFixed(1) : (hotel.stars >= 4 ? (4.2 + (Number(hotel.id || 1) % 8) * 0.1).toFixed(1) : '8.8');
                const reviewCountVal = hotelReviews[hotel.id]?.numReviews || (1200 + (Number(hotel.id || 1) % 1500));
                const reviewRatingLabel = Number(ratingVal) >= 4.5 || Number(ratingVal) >= 9.0 ? 'Exceptional' : Number(ratingVal) >= 4.0 || Number(ratingVal) >= 8.5 ? 'Superb' : 'Very good';
                const hasLimitedDeal = (hotel.promos?.length > 0 || hotel.discounts?.length > 0 || (Number(hotel.id || 1) % 2 === 0));

                return (
                  <div
                    key={hotel.id}
                    onClick={() => {
                      setRoomSelections({});
                      setActiveRoomTab(0);
                      setSelectedHotel(hotel);
                    }}
                    className="bento-card bg-white rounded-2xl overflow-hidden flex flex-row group border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Left: Enhanced Thumbnail */}
                    <div className="w-32 min-[420px]:w-36 sm:w-48 md:w-72 relative shrink-0 overflow-hidden bg-gray-100 self-stretch min-h-[160px] sm:min-h-[180px] md:min-h-0">
                      <img
                        loading="lazy"
                        src={hotelImage}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const src = e.target.src || '';
                          if (src.includes('/giata/bigger/')) {
                            e.target.src = src.replace('/giata/bigger/', '/giata/original/');
                          } else if (src.includes('/giata/original/')) {
                            e.target.src = src.replace('/giata/original/', '/giata/medium/');
                          } else {
                            e.target.src = "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden pointer-events-none" />

                      {/* Badge on Image: Luxury or Offer */}
                      <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 flex items-start pointer-events-none">
                        {(hotel.isLuxuryCollection || hotel.stars >= 5 || hotel.establishmentProfiles?.includes('119')) ? (
                          <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-bold bg-black/75 backdrop-blur-md text-amber-300 shadow-md flex items-center gap-1 sm:gap-1.5">
                            <AnimatedIcon name="crown" animation="pulse" size={11} className="text-amber-300" />
                            <span>Luxury</span>
                          </span>
                        ) : (hotel.promos?.length > 0 || hotel.discounts?.length > 0) ? (
                          <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-bold bg-amber-500/90 backdrop-blur-md text-white shadow-md flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="truncate max-w-[70px] sm:max-w-none">{hotel.promos?.[0] || 'Offer'}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Center Details: Mobile Rest of Area / Desktop Center Column */}
                    <div className="p-3 sm:p-4 md:p-5 flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-1 sm:space-y-1.5">
                        {/* Stars + ThumbsUp Badge */}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <div className="flex text-amber-400">
                            {[...Array(hotel.stars || 4)].map((_, i) => (
                              <Star key={i} className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" />
                            ))}
                          </div>
                          <span className="bg-amber-400 text-amber-950 font-black text-[9px] px-1 py-0.2 rounded flex items-center gap-0.5">
                            <ThumbsUp className="w-2.5 h-2.5 fill-current" />+
                          </span>
                          {(hotel.zoneName || hotel.city) && (
                            <>
                              <span className="text-gray-300 hidden sm:inline">·</span>
                              <span className="text-[10px] sm:text-xs text-blue-600 font-bold bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-md hidden sm:inline">
                                {hotel.zoneName || hotel.city}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Hotel Name - Prominent & Bold */}
                        <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                          {hotel.name}
                        </h2>

                        {/* TripAdvisor / Reviews Score Badge - Visible on Mobile & Desktop */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            openReviewsModal(hotel);
                          }}
                          className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                        >
                          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-700 text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {ratingVal}
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold text-gray-800">{reviewRatingLabel}</span>
                          <span className="text-[11px] sm:text-xs text-gray-500">· {reviewCountVal.toLocaleString()} reviews</span>
                        </div>

                        {/* Location / Zone */}
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 truncate">
                          <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{hotel.zoneName ? `${hotel.zoneName} · 400 m from center` : hotel.address}</span>
                        </div>

                        {/* Limited-time Deal Badge */}
                        {hasLimitedDeal && (
                          <div className="pt-0.5">
                            <span className="bg-emerald-700 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 shadow-2xs">
                              Limited-time Deal
                            </span>
                          </div>
                        )}

                        {/* Room Types: Visible on mobile & desktop */}
                        {roomTypes.length > 0 && (
                          <div className="pt-0.5">
                            <div className="text-[11px] sm:text-xs font-semibold text-slate-700 truncate">
                              {roomTypes[0]}
                            </div>
                            <div className="hidden md:flex gap-1.5 flex-wrap pt-0.5">
                              {roomTypes.slice(1, 3).map((rt, i) => (
                                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 truncate max-w-[180px]">
                                  {rt}
                                </span>
                              ))}
                              {roomTypes.length > 3 && (
                                <span className="text-[10px] text-gray-400 self-center font-medium">
                                  +{roomTypes.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Meal & Cancellation Pills */}
                        <div className="pt-0.5 sm:pt-1 flex items-center gap-1 sm:gap-2 flex-wrap text-[9px] sm:text-xs">
                          {/* Board */}
                          <span className="font-semibold text-gray-700 flex items-center gap-1 text-[9px] sm:text-xs bg-gray-100/80 px-1.5 sm:px-2 py-0.5 rounded-md">
                            <Check className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-blue-600 shrink-0" />
                            <span>{hotel.boards?.[0] || 'Room Only'}</span>
                          </span>

                          {/* Cancellation */}
                          {hotel.hasFreeCancellation ? (
                            <span className="font-semibold text-emerald-700 flex items-center gap-1 text-[9px] sm:text-xs bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md">
                              <CheckCircle className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-emerald-600 shrink-0" />
                              <span>Free Cancellation</span>
                            </span>
                          ) : (
                            <span className="font-medium text-gray-500 flex items-center gap-1 text-[9px] sm:text-xs bg-gray-100/60 px-1.5 sm:px-2 py-0.5 rounded-md">
                              <AlertCircle className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-gray-400 shrink-0" />
                              <span>Non-Refundable</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Desktop Inclusions Footer (Border top, room options) */}
                      <div className="hidden md:flex pt-2 mt-2 border-t border-gray-100 items-center justify-between text-xs text-gray-400 font-medium">
                        {hotel.rooms?.length > 0 && (
                          <span>{hotel.rooms.length} Room Options Available</span>
                        )}
                      </div>

                      {/* Mobile-Only Bottom Row: Booking.com Style Dual Price + View Rooms */}
                      <div className="flex md:hidden flex-col items-end pt-2 mt-1.5 border-t border-gray-100 w-full">
                        <div className="flex items-baseline gap-2 justify-end">
                          <span className="text-red-600 line-through text-xs font-bold">
                            PKR {strikethroughPrice.toLocaleString()}
                          </span>
                          <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                            PKR {totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          +PKR {taxesAndCharges.toLocaleString()} taxes and charges
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomSelections({});
                            setActiveRoomTab(0);
                            setSelectedHotel(hotel);
                          }}
                          className="mt-2 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Bed className="w-3.5 h-3.5" />
                          <span>View Rooms</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Transparent Pricing & Primary CTA (Desktop Only) */}
                    <div className="hidden md:flex p-4 sm:p-5 md:w-60 bg-slate-50/70 border-l border-gray-100 flex-col justify-between shrink-0">
                      <div className="text-right space-y-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openReviewsModal(hotel);
                          }}
                          className="flex items-center justify-end gap-1.5 cursor-pointer group/rev hover:opacity-80 transition-opacity bg-transparent border-0 p-0 w-full"
                          title="Click to view traveler reviews"
                        >
                          <div className="text-right">
                            <span className="text-xs font-bold text-gray-900 group-hover/rev:text-blue-600 block">
                              {reviewRatingLabel}
                            </span>
                            <div className="text-[10px] text-gray-400">
                              {reviewCountVal.toLocaleString()} reviews
                            </div>
                          </div>
                          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                            {ratingVal}
                          </span>
                        </button>

                        <div className="pt-2 text-right">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                            Total Stay
                          </span>
                          <div className="flex items-baseline justify-end gap-2">
                            <span className="text-red-600 line-through text-xs font-semibold">
                              PKR {strikethroughPrice.toLocaleString()}
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                              PKR {totalPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            +PKR {taxesAndCharges.toLocaleString()} taxes and charges
                          </div>
                          <div className="text-[10px] text-gray-400">
                            PKR {pricePerNight.toLocaleString()} / night · {nights} nights
                          </div>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('👀 View Rooms clicked for hotel:', { id: hotel.id, name: hotel.name });
                            setRoomSelections({});
                            setActiveRoomTab(0);
                            setSelectedHotel(hotel);
                          }}
                          className="w-full min-h-[44px] py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Bed className="w-4 h-4" />
                          <span>View Rooms</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleCount < sortedHotels.length && (
              <div className="text-center py-6 mb-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-sm inline-flex items-center gap-2 cursor-pointer border-0 active:scale-95"
                >
                  Load More Hotels ({sortedHotels.length - visibleCount} remaining)
                </button>
              </div>
            )}

            {hotels.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-8 space-y-6 text-left animate-in fade-in-50 duration-200">
                {/* Header Badge & Reason */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <AnimatedIcon name="hotel" animation="pulse" size={26} className="text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full inline-block mb-1 border border-amber-200">
                      No Live Availability
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">
                      {unavailableHotelName || hotelNameParam
                        ? `"${unavailableHotelName || hotelNameParam}" is not available for your selected dates`
                        : `No hotels available in ${cityParam} for your dates`}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                      {unavailableHotelName || hotelNameParam
                        ? `The selected property has no rooms available matching your exact stay dates (${formatReadableDate(checkInParam)} → ${formatReadableDate(checkOutParam)}) and party size (${adultsParam} Adults${childrenParam !== '0' ? `, ${childrenParam} Children` : ''} · ${roomsParam} Room). You can shift dates below or explore similar available options.`
                        : `All room allotments matching your exact stay dates and guest count are currently sold out with our wholesale bed banks.`}
                    </p>
                  </div>
                </div>

                {/* Searched Criteria Summary Capsule */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{formatReadableDate(checkInParam)} → {formatReadableDate(checkOutParam)} ({stayNights} night{stayNights > 1 ? 's' : ''})</span>
                  </div>
                  <span className="text-slate-300">·</span>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{adultsParam} Adults{childrenParam !== '0' ? `, ${childrenParam} Children` : ''} · {roomsParam} Room</span>
                  </div>
                  {cityParam && (
                    <>
                      <span className="text-slate-300">·</span>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{cityParam}{countryParam ? `, ${countryParam}` : ''}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action 1: Shifting Dates Suggestions */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Try shifting your stay dates for live openings:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowModifySearch(true)}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Custom Dates
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleShiftDates(1)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200/60 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Shift +1 Day Later</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShiftDates(-1)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200/60 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Shift -1 Day Earlier</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextWeekend}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all border border-purple-200/60 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Next Weekend (Fri–Sun)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShiftDates(3)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200/60 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>+3 Days Ahead</span>
                    </button>
                  </div>
                </div>

                {/* Action 2: If Specific Hotel was Searched, Suggest Searching Whole City */}
                {hotelNameParam && (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-blue-950">
                        Looking for stays in {cityParam}?
                      </h4>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Multiple other hotels and resorts in {cityParam} have guaranteed vacancies for your selected dates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchAllCityHotels}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      Browse All {cityParam} Hotels
                    </button>
                  </div>
                )}

                {/* Action 3: Suggested Alternative Properties */}
                {alternativeHotels.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                        Similar Available Properties Matching Your Criteria ({stayNights} {stayNights === 1 ? 'Night' : 'Nights'} · {adultsParam} Adults in {cityParam}):
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {alternativeHotels.map((alt) => (
                        <div
                          key={alt.code || alt.name}
                          className="p-3.5 rounded-2xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-current" />
                              ))}
                              <span className="text-[10px] text-gray-500 font-semibold ml-1">{alt.zoneName || alt.destinationName}</span>
                            </div>
                            <h5 className="text-xs font-extrabold text-gray-900 truncate">
                              {alt.name}
                            </h5>
                            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                              ● Instant Confirmation Eligible
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectAlternativeHotel(alt)}
                            className="px-3 py-1.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
                          >
                            Check Rates
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action 4: Filter Relief Notice */}
                {activeFilterCount > 0 && (
                  <div className="p-3 rounded-xl bg-slate-100 flex items-center justify-between text-xs text-slate-700">
                    <span>You have <strong>{activeFilterCount} active filters</strong>. Removing them may reveal open rooms.</span>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-blue-600 font-bold hover:underline cursor-pointer ml-3"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            ) : sortedHotels.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900">No Hotels Match Your Active Filters</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  We found {hotels.length} available hotel{hotels.length > 1 ? 's' : ''} in {cityParam}, but your {activeFilterCount} active filter criteria (star rating, board type, or price limit) narrowed them down.
                </p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Clear All Filters ({activeFilterCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModifySearch(true)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Modify Search
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Floating Mobile Filter FAB */}
      <button
        type="button"
        onClick={() => setShowMobileFilters(true)}
        style={{
          position: 'fixed', bottom: 'calc(76px + env(safe-area-inset-bottom, 12px))', right: 16, zIndex: 120,
          alignItems: 'center', gap: 8,
          backgroundColor: '#2563eb', color: '#fff',
          padding: '10px 18px', borderRadius: 99,
          boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
        }}
        className="lg:hidden flex items-center"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-white text-blue-600 text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Filters Sheet */}
      <MobileFilters
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        onReset={clearFilters}
        activeCount={activeFilterCount}
        quickFilters={
          <>
            <button
              type="button"
              onClick={() => {
                setSelectedEstablishment(prev => prev.includes('119') ? prev.filter(x => x !== '119') : [...prev, '119']);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${selectedEstablishment.includes('119')
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200'
                }`}
            >
              <AnimatedIcon name="crown" animation="pulse" size={13} className={selectedEstablishment.includes('119') ? 'text-amber-100' : 'text-amber-500'} />
              <span>Luxury Collection</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCancellation(prev => prev === 'free' ? '' : 'free');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${selectedCancellation === 'free'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200'
                }`}
            >
              <AnimatedIcon name="shield" animation="pulse" size={13} className={selectedCancellation === 'free' ? 'text-emerald-100' : 'text-emerald-500'} />
              <span>Free Cancellation</span>
            </button>

            {dynamicBoards.some(b => b.toUpperCase().includes('BREAKFAST')) && (
              <button
                type="button"
                onClick={() => {
                  const bf = dynamicBoards.find(b => b.toUpperCase().includes('BREAKFAST'));
                  if (bf) {
                    setSelectedBoards(prev => prev.includes(bf) ? prev.filter(x => x !== bf) : [...prev, bf]);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${selectedBoards.some(b => b.toUpperCase().includes('BREAKFAST'))
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200'
                  }`}
              >
                <AnimatedIcon name="breakfast" animation="bounce" size={13} className={selectedBoards.some(b => b.toUpperCase().includes('BREAKFAST')) ? 'text-amber-200' : 'text-amber-600'} />
                <span>Breakfast Included</span>
              </button>
            )}

            {dynamicCategories.some(c => c.startsWith('5')) && (
              <button
                type="button"
                onClick={() => {
                  const five = dynamicCategories.find(c => c.startsWith('5'));
                  if (five) {
                    setSelectedCategories(prev => prev.includes(five) ? prev.filter(x => x !== five) : [...prev, five]);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${selectedCategories.some(c => c.startsWith('5'))
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200'
                  }`}
              >
                <AnimatedIcon name="star" animation="pulse" size={13} className={selectedCategories.some(c => c.startsWith('5')) ? 'text-amber-200' : 'text-amber-400'} />
                <span>5-Star Only</span>
              </button>
            )}
          </>
        }
        sections={[
          {
            key: 'hotelName', label: 'Hotel Name', type: 'search',
            placeholder: 'Search hotel name...',
            value: hotelNameSearch, onChange: setHotelNameSearch,
          },
          {
            key: 'distance', label: 'Distance From', type: 'distance',
            selectedSight: selectedSight,
            onSelectSight: setSelectedSight,
            sightOptions: dynamicZones,
            addressSearch: addressSearch,
            onAddressSearchChange: setAddressSearch,
            addressSuggestions: addressSuggestions,
            showAddressSuggestions: showAddressSuggestions,
            setShowAddressSuggestions: setShowAddressSuggestions,
            loadingAddress: loadingAddress,
          },
          ...(dynamicBoards.length > 0 ? [{
            key: 'board', label: 'Board', type: 'checkbox',
            value: selectedBoards, onChange: setSelectedBoards,
            options: dynamicBoards.map(b => ({ value: b, label: b, count: filterCounts.boards[b] || 0 })),
          }] : []),
          ...(dynamicCategories.length > 0 ? [{
            key: 'category', label: 'Category', type: 'checkbox',
            value: selectedCategories, onChange: setSelectedCategories,
            options: dynamicCategories.map(c => ({ value: c, label: c, count: filterCounts.categories[c] || 0 })),
          }] : []),
          {
            key: 'cancellation', label: 'Cancellation', type: 'radio',
            value: selectedCancellation, onChange: setSelectedCancellation,
            options: [
              { value: 'free', label: 'Free cancellation', count: filterCounts.freeCancellation },
              { value: 'partial', label: 'Partial refund', count: filterCounts.partialCancellation },
              { value: 'nonrefundable', label: 'Non-refundable', count: filterCounts.nonRefundable },
            ],
          },
          {
            key: 'price', label: 'Price Range (PKR)', type: 'range',
            valueMin: priceMin, onChangeMin: setPriceMin,
            valueMax: priceMax, onChangeMax: setPriceMax,
            placeholderMin: String(priceBounds.min),
            placeholderMax: String(priceBounds.max),
          },
          ...(dynamicZones.length > 0 ? [{
            key: 'zone', label: 'Zone', type: 'checkbox',
            value: selectedZones, onChange: setSelectedZones,
            options: dynamicZones.map(z => ({ value: z, label: z, count: filterCounts.zones[z] || 0 })),
          }] : []),
          {
            key: 'accommodationType', label: 'Accommodation Type', type: 'checkbox',
            value: selectedAccommodationTypes, onChange: setSelectedAccommodationTypes,
            options: accommodationTypes.map(t => ({ value: t.id, label: t.name, count: filterCounts.accommodationTypes[t.id] || 0 })),
          },
          {
            key: 'amenities', label: 'Amenities', type: 'checkbox',
            value: selectedAmenities, onChange: setSelectedAmenities,
            options: availableAmenities.map(a => ({ value: a.id, label: a.name, count: filterCounts.amenities[a.id] || 0 })),
          },
          ...(dynamicPromos.length > 0 ? [{
            key: 'promos', label: 'Promotions', type: 'checkbox',
            value: selectedPromos, onChange: setSelectedPromos,
            options: dynamicPromos.map(p => ({ value: p, label: p, count: filterCounts.promos[p] || 0 })),
          }] : []),
          ...(dynamicChains.length > 0 ? [{
            key: 'chain', label: 'Hotel Chain', type: 'checkbox',
            value: selectedChains, onChange: setSelectedChains,
            options: dynamicChains.map(c => ({ value: c, label: c, count: filterCounts.chains[c] || 0 })),
          }] : []),
        ]}
      />

      {/* Reviews Modal */}
      <ReviewsModal
        isOpen={reviewsModal.isOpen}
        onClose={closeReviewsModal}
        hotelName={reviewsModal.hotelName}
        reviewData={reviewsModal.hotelId ? hotelReviews[reviewsModal.hotelId] : null}
      />

      {/* Hotel Detail Modal */}
      {selectedHotel && (
        <HotelDetailModal
          isOpen={true}
          onClose={() => setSelectedHotel(null)}
          hotel={selectedHotel}
          hotelContentData={hotelContentData}
          searchParams={searchParams}
          formatPKR={formatPKR}
          convert={convert}
          applyCommission={applyCommission}
          onAddToCart={handleAddToCart}
          onMultiRoomAddToCart={handleMultiRoomAddToCart}
          openGallery={(idx = 0, customImages = null, title = '', customAlbums = null, initialAlbum = 'All') => {
            const rawImages = (hotelContentData?.images && hotelContentData.images.length >= (selectedHotel?.images?.length || 0))
              ? hotelContentData.images
              : (selectedHotel?.images && selectedHotel.images.length > 0 ? selectedHotel.images : (hotelContentData?.images || []));

            const computedAlbums = customAlbums || buildImageAlbums(rawImages);
            const allImages = (computedAlbums['All'] && computedAlbums['All'].length > 0)
              ? computedAlbums['All']
              : rawImages.map(img => img.path ? `https://photos.hotelbeds.com/giata/original/${img.path.replace(/^\/+/, '')}` : (typeof img === 'string' ? img : null)).filter(Boolean);

            if (allImages.length === 0 && selectedHotel?.thumbnail) allImages.push(selectedHotel.thumbnail);

            setGalleryAlbums(computedAlbums);
            setActiveGalleryAlbum(initialAlbum || 'All');

            if (customImages && customImages.length > 0) {
              setGalleryImages(customImages);
            } else if (initialAlbum && computedAlbums[initialAlbum] && computedAlbums[initialAlbum].length > 0) {
              setGalleryImages(computedAlbums[initialAlbum]);
            } else {
              setGalleryImages(allImages);
            }

            setGalleryIndex(idx || 0);
            setGalleryTitle(title || selectedHotel?.name || '');
            setGalleryOpen(true);
          }}
          onSelectRoomDetail={(room) => setSelectedRoomDetail(room)}
          activeRoomTab={activeRoomTab}
          setActiveRoomTab={setActiveRoomTab}
          roomSelections={roomSelections}
          setRoomSelections={setRoomSelections}
          formatCancellationPolicy={formatCancellationPolicy}
          selectedBoards={selectedBoards}
          selectedCancellation={selectedCancellation}
          selectedPackaging={selectedPackaging}
          selectedPromos={selectedPromos}
          priceMin={priceMin}
          priceMax={priceMax}
        />
      )}

      {/* Room Detail Modal */}
      {selectedRoomDetail && (
        <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center" onClick={() => setSelectedRoomDetail(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-[15px] font-bold text-gray-900 line-clamp-2 flex-1 pr-2">{selectedRoomDetail.name}</h3>
              <button onClick={() => setSelectedRoomDetail(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="w-4 h-4 text-gray-600" /></button>
            </div>
            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-4" style={{ scrollbarWidth: 'thin' }}>
              {/* Room images */}
              {(() => {
                const rawImages = (hotelContentData?.images && hotelContentData.images.length > 0)
                  ? hotelContentData.images
                  : (selectedHotel?.images || []);
                const roomImages = rawImages
                  .filter(img => img.roomCode === selectedRoomDetail.code)
                  .map(img => img.path ? `https://photos.hotelbeds.com/giata/original/${img.path}` : null)
                  .filter(Boolean);
                return roomImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 mb-4 rounded-xl overflow-hidden">
                    {roomImages.slice(0, 4).map((img, i) => (
                      <div key={i} className="aspect-video overflow-hidden cursor-pointer" onClick={() => { setGalleryImages(roomImages); setGalleryIndex(i); setGalleryTitle(selectedRoomDetail.name + ' Photos'); setGalleryOpen(true); }}>
                        <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
              {/* Room code */}
              <p className="text-xs text-gray-400 mb-3">Room code: {selectedRoomDetail.code}</p>
              {/* Room Facilities - Mandatory Hotelbeds Certification: Clearly separate paid (indFee=true) vs Free */}
              {(() => {
                const roomFacilities = selectedRoomDetail.facilities ||
                  hotelContentData?.rooms?.find(r => r.roomCode === selectedRoomDetail.code)?.facilities ||
                  (selectedHotel?.facilities || []).filter(f => f.roomCode === selectedRoomDetail.code || !f.roomCode);
                if (!roomFacilities || roomFacilities.length === 0) return null;

                const paid = roomFacilities.filter(f => f.indFee === true);
                const free = roomFacilities.filter(f => f.indFee !== true);

                return (
                  <div className="space-y-3">
                    {paid.length > 0 && (
                      <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                        <h4 className="text-xs font-semibold text-orange-800 mb-1.5 flex items-center">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-orange-600 flex-shrink-0" />
                          Room Facilities with Additional Charges (payable on-site):
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {paid.map((f, i) => (
                            <span key={`r-paid-${i}`} className="text-[11px] px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-medium border border-orange-200">
                              {f.description?.content || f.description || f.facilityName || `Facility ${f.facilityCode || f.code}`} (Extra Fee)
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-orange-700 mt-1">These room facilities require additional payment directly at the property.</p>
                      </div>
                    )}
                    {free.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600 flex-shrink-0" />
                          Complimentary Room Amenities:
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {free.slice(0, 25).map((f, i) => (
                            <span key={`r-free-${i}`} className="text-[11px] px-2 py-0.5 bg-gray-50 text-gray-700 rounded border border-gray-200">
                              {f.description?.content || f.description || f.facilityName || `Facility ${f.facilityCode || f.code}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Lightbox */}
      {galleryOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              {galleryTitle && (
                <span className="text-white font-medium text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
                  {galleryTitle}
                </span>
              )}
              <span className="text-white/70 text-xs sm:text-sm flex-shrink-0">
                ({galleryIndex + 1} / {galleryImages.length})
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {galleryTitle && selectedHotel && galleryTitle !== selectedHotel.name && (
                <button
                  onClick={() => {
                    const rawImages = (hotelContentData?.images && hotelContentData.images.length >= (selectedHotel?.images?.length || 0))
                      ? hotelContentData.images
                      : (selectedHotel?.images && selectedHotel.images.length > 0 ? selectedHotel.images : (hotelContentData?.images || []));
                    const allImages = rawImages
                      .map(img => img.path ? `https://photos.hotelbeds.com/giata/original/${img.path.replace(/^\/+/, '')}` : (typeof img === 'string' ? img : null))
                      .filter(Boolean);
                    if (allImages.length === 0 && selectedHotel?.thumbnail) allImages.push(selectedHotel.thumbnail);
                    setGalleryImages(allImages);
                    setGalleryIndex(0);
                    setGalleryTitle(selectedHotel.name);
                    setActiveGalleryAlbum('All');
                  }}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                >
                  View All Hotel Photos
                </button>
              )}
              <button onClick={() => setGalleryOpen(false)} className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Category / Album Tabs Bar */}
          {galleryAlbums && Object.keys(galleryAlbums).length > 1 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-black/60 border-b border-white/10 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'thin' }}>
              {Object.entries(galleryAlbums).map(([catKey, catImages]) => {
                if (!catImages || catImages.length === 0) return null;
                const isActive = activeGalleryAlbum === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setActiveGalleryAlbum(catKey);
                      setGalleryImages(catImages);
                      setGalleryIndex(0);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-white/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                  >
                    {catKey} ({catImages.length})
                  </button>
                );
              })}
            </div>
          )}
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

      {/* Overlay for mobile */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default HotelSearchResults;