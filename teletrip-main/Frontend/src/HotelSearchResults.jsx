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
  ChevronUp,
  Filter,
  X,
  MessageSquare, 
  ThumbsUp,
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ReviewsModal from "./components/ReviewsModal";


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
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedAccommodationTypes, setSelectedAccommodationTypes] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    accommodationType: true,
    amenities: true,
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
    { id: "hotel", name: "Hotel",  },
    { id: "boutique", name: "Boutique",  },
    { id: "aparthotel", name: "Aparthotel",  },
    { id: "beach", name: "Beach hotels",  },
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

        if (!checkIn || !checkOut || !city || !country) {
          throw new Error("Missing required search parameters");
        }

        let lat, lon;
        
        const geoResponse = await fetch(
          `${API_BASE_URL}/geocode?q=${encodeURIComponent(
            city + ", " + convertCountryCode(country)
          )}`
        );

        if (geoResponse.ok) {
          const geoResult = await geoResponse.json();  
          lat = geoResult?.data?.[0]?.lat;
          lon = geoResult?.data?.[0]?.lon;
        }
        
        if (!lat || !lon) {
          throw new Error(`Unable to find coordinates for ${city}`);
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

        const transformedHotels = (
          hotelResult.data.hotels?.hotels ||
          hotelResult.data.hotels ||
          []
        ).map((hotel) => {
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
            thumbnail: hotel.thumbnail,
            price: hotel.minRate || cheapestRate?.net || "N/A",
            currency: hotel.currency || "EUR",
            images: hotel.images || [],
            amenities: hotel.amenities || [],
            type: hotel.type || "hotel",
            cancellationPolicy: cancellationPolicy,
          };
        });

        setHotels(transformedHotels);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

 

  // Filter hotels based on selected filters
  const filteredHotels = hotels.filter(hotel => {
    // Amenities filter
    if (selectedAmenities.length > 0) {
      const hasSelectedAmenities = selectedAmenities.every(amenity => 
        hotel.amenities.includes(amenity)
      );
      if (!hasSelectedAmenities) return false;
    }
    
    // Accommodation type filter
    if (selectedAccommodationTypes.length > 0) {
      if (!selectedAccommodationTypes.includes(hotel.type)) return false;
    }
    
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
        <div className="lg:hidden fixed top-20 left-4 z-50">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Filters */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-80 bg-white shadow-lg transform ${showFilters ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out pt-16 lg:pt-0`}>
          <div className="p-6 h-full overflow-y-auto">
            {/* Mobile Close Button */}
            <div className="lg:hidden flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold hidden lg:block">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear all
              </button>
            </div>

            {/* Sort By Filter */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('sortBy')}
                className="flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-3"
              >
                <span className="font-bold text-lg">Sort by</span>
                {expandedSections.sortBy ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedSections.sortBy && (
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="default"
                      checked={sortOption === "default"}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Default</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="priceLowHigh"
                      checked={sortOption === "priceLowHigh"}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Price: Low to High</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="priceHighLow"
                      checked={sortOption === "priceHighLow"}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Price: High to Low</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="ratingHighLow"
                      checked={sortOption === "ratingHighLow"}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Rating: High to Low</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="ratingLowHigh"
                      checked={sortOption === "ratingLowHigh"}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Rating: Low to High</span>
                  </label>
                </div>
              )}
            </div>

            {/* Accommodation Type Filter */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('accommodationType')}
                className="flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-3"
              >
                <span className="font-bold text-lg">Accommodation Type</span>
                {expandedSections.accommodationType ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedSections.accommodationType && (
                <div className="space-y-2">
                  {accommodationTypes.map(type => (
                    <label key={type.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAccommodationTypes.includes(type.id)}
                          onChange={() => handleAccommodationTypeChange(type.id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{type.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{type.count}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities Filter */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('amenities')}
                className="flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-3"
              >
                <span className="font-bold text-lg">Amenities</span>
                {expandedSections.amenities ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedSections.amenities && (
                <div className="space-y-2">
                  {availableAmenities.map(amenity => (
                    <label key={amenity.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity.id)}
                        onChange={() => handleAmenityChange(amenity.id)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <amenity.icon className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-700">{amenity.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 ">
          <div className="container mx-auto px-4 py-8">
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

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <h1 className="text-2xl font-bold">
                {sortedHotels.length} Hotels Found in {searchParams.get("city")}
              </h1>
            </div>

            {/* Hotel Cards */}
            <div className="space-y-6">
              {sortedHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col lg:flex-row"
                >
                  {/* Hotel Image */}
                  <div className="lg:w-1/3 relative">
                    <img
                      src={
                        hotel.thumbnail ||
                        "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"
                      }
                      alt={hotel.name}
                      className="w-full h-48 lg:h-full object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg")
                      }
                    />
                    {hotel.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm flex items-center">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        {hotel.images.length}
                      </div>
                    )}

                  </div>

                  {/* Hotel Details */}
                  <div className="lg:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="text-xl font-semibold mb-1">{hotel.name}</h2>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < hotel.stars
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
  {(() => {
    // Get search parameters
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    
    if (checkIn && checkOut) {
      // Calculate nights
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      // hotel.price is the total price from API
      const totalPrice = parseFloat(hotel.price);
      const pricePerNight = nights > 0 ? (totalPrice / nights) : totalPrice;
      
      return (
        <>
          {/* Small per night price */}
          <div className="text-xs text-gray-500">
            {hotel.currency} {pricePerNight.toFixed(2)}/night
          </div>
          
          {/* Large total price */}
          <div className="text-2xl font-bold text-blue-600">
            {hotel.currency} {totalPrice.toFixed(2)}
          </div>
          
          {/* Total label */}
          <div className="text-sm font-medium text-gray-700">
            Total ({nights} {nights === 1 ? 'night' : 'nights'})
          </div>
        </>
      );
    } else {
      // Fallback if no dates
      return (
        <>
          <div className="text-2xl font-bold text-blue-600">
            {hotel.currency} {parseFloat(hotel.price).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </>
      );
    }
  })()}
</div>
                      </div>

                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{hotel.address}</span>
                      </div>

                      <div className="flex gap-3 mb-4 flex-wrap">
                        {[...new Set(hotel.amenities)].slice(0, 6).map((amenity, index) => {
                          const amenityData = availableAmenities.find(a => a.id === amenity);
                          if (!amenityData) return null;
                          const IconComponent = amenityData.icon;
                          return (
                            <div key={index} className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                              <IconComponent className="w-4 h-4 text-blue-600" />
                              <span className="ml-2 text-sm text-gray-700">{amenityData.name}</span>
                            </div>
                          );
                        })}
                        {[...new Set(hotel.amenities)].length > 6 && (
                          <span className="text-sm text-gray-500 self-center">
                            +{[...new Set(hotel.amenities)].length - 6} more
                          </span>
                        )}
                      </div>
                      {/* Reviews Section - Add right after amenities */}
{/* Reviews Section - Simplified with Modal */}
{loadingReviews[hotel.id] ? (
  <div className="flex items-center gap-2 text-sm text-gray-600 mt-4 pt-4 border-t">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>Loading reviews...</span>
  </div>
) : hotelReviews[hotel.id] && hotelReviews[hotel.id].numReviews > 0 ? (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-3 tet-xs">
        {/* TripAdvisor Logo */}
        {/* <img 
          src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
          alt="TripAdvisor"
          className="h-5"
        /> */}
        
        {/* Rating Circles */}
        <RatingCircles rating={hotelReviews[hotel.id].rating} />
        
        {/* Review Count Button - Opens Modal */}
        <button
          onClick={() => openReviewsModal(hotel)}
          className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
        >
          <MessageSquare className="w-4 h-4" />
          {hotelReviews[hotel.id].numReviews.toLocaleString()} Reviews
        </button>
      </div>
      
      {/* Ranking
      {hotelReviews[hotel.id].rankingData && (
        <span className="text-xs text-gray-600">
          #{hotelReviews[hotel.id].rankingData.ranking_string}
        </span>
      )} */}
    </div>
  </div>
) : null}
{/* END REVIEWS SECTION */}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <div className={`font-medium ${
                          hotel.cancellationPolicy && hotel.cancellationPolicy.length > 0 && 
                          parseFloat(hotel.cancellationPolicy[0]?.amount || 0) === 0 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }`}>
                          {formatCancellationPolicy(hotel.cancellationPolicy)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition duration-300">
                          View Details
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/hotel-details/${hotel.id}?${searchParams.toString()}`
                            )
                          }
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                        >
                          View Rooms
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedHotels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No hotels found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
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