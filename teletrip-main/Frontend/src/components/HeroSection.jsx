import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  Plus,
  Minus,
  X,
  Building2,
  Navigation,
  Sparkles,
  Plane,
  Car,
  Compass,
  Trash2,
  ShieldCheck,
  CheckCircle,
  Crown,
  Loader2,
  Hotel
} from "lucide-react";
import { format, addDays } from "date-fns";
import axios from "axios";
import AnimatedIcon from "./common/AnimatedIcon";
import {
  TOP_DESTINATIONS,
  TOP_HOTELS,
  getInstantSuggestions
} from "../utils/instantSearchData";
import { searchTransfers } from "../services/transfersApi";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// Lazy-load DateRange to avoid TDZ errors with React 19
const LazyDateRange = lazy(() =>
  import("react-date-range").then((mod) => ({ default: mod.DateRange }))
);

const API_BASE = import.meta.env.VITE_BASE_URL || "https://telitrip-backend.onrender.com";

// Curated Category Data: Dynamic Taglines & High-Resolution Sliding Visuals
const TAB_DATA = {
  stays: {
    label: "Stays",
    icon: "hotel",
    animation: "pulse",
    headlinePrimary: "Hotels, resorts,",
    headlineSecondary: "luxury stays",
    subtitle: "Compare 250,000+ handpicked hotels & 5-star resorts with guaranteed best rates.",
    cta: "Start your search",
    images: [
      {
        url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&auto=format&fit=crop&q=85",
        title: "Overwater Villas"
      },
      {
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&auto=format&fit=crop&q=85",
        title: "Tropical Infinity Pool"
      },
      {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&auto=format&fit=crop&q=85",
        title: "Grand Luxury Suites"
      }
    ]
  },
  transfers: {
    label: "Transfers",
    icon: "car",
    animation: "glide",
    headlinePrimary: "Airport, city,",
    headlineSecondary: "private transfers",
    subtitle: "Reliable private airport transfers, premium vans & executive chauffeurs waiting when you land.",
    cta: "Find your ride",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&auto=format&fit=crop&q=85",
        title: "Executive Chauffeur"
      },
      {
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&auto=format&fit=crop&q=85",
        title: "Luxury Transport Fleet"
      },
      {
        url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&auto=format&fit=crop&q=85",
        title: "Scenic Coastal Drive"
      }
    ]
  },
  experiences: {
    label: "Experiences",
    icon: "experiences",
    animation: "bounce",
    headlinePrimary: "Tours, safaris,",
    headlineSecondary: "epic experiences",
    subtitle: "Exclusive desert safaris, private yacht cruises, and bucket-list adventures curated for you.",
    cta: "Explore activities",
    images: [
      {
        url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&auto=format&fit=crop&q=85",
        title: "Red Dunes Safari"
      },
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=85",
        title: "Private Yacht Cruise"
      },
      {
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&auto=format&fit=crop&q=85",
        title: "Sunrise Balloon Flight"
      }
    ]
  }
};

export default function HeroSection() {
  const navigate = useNavigate();

  // Active Category Tab: 'stays' | 'transfers' | 'experiences'
  const [activeTab, setActiveTab] = useState("stays");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [reachedHeader, setReachedHeader] = useState(false);
  const [collapseProgress, setCollapseProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTab = TAB_DATA[activeTab];

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. STAYS SEARCH STATE (Audited from HotelSearchForm.jsx)
  // ═══════════════════════════════════════════════════════════════════════════
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedHotelCode, setSelectedHotelCode] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [hotelSuggestions, setHotelSuggestions] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Stays Dates
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: "selection"
    }
  ]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Stays Multi-Room & Travellers (Bedsonline standard)
  const [roomConfigs, setRoomConfigs] = useState([
    { adults: 2, children: 0, childAges: [] }
  ]);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);
  const [luxuryOnly, setLuxuryOnly] = useState(false);

  const isSelectingRef = useRef(false);

  // Room helper functions
  const addRoom = () => {
    if (roomConfigs.length < 6) {
      setRoomConfigs([...roomConfigs, { adults: 2, children: 0, childAges: [] }]);
    }
  };

  const removeRoom = (index) => {
    if (roomConfigs.length > 1) {
      setRoomConfigs(roomConfigs.filter((_, i) => i !== index));
    }
  };

  const updateRoom = (index, field, value) => {
    setRoomConfigs(
      roomConfigs.map((room, i) => {
        if (i !== index) return room;
        const updated = { ...room, [field]: value };
        if (field === "children") {
          const count = Math.max(0, Math.min(4, value));
          updated.children = count;
          if (count > room.childAges.length) {
            updated.childAges = [
              ...room.childAges,
              ...Array(count - room.childAges.length).fill(5)
            ];
          } else {
            updated.childAges = room.childAges.slice(0, count);
          }
        }
        return updated;
      })
    );
  };

  const updateChildAge = (roomIndex, childIndex, age) => {
    setRoomConfigs(
      roomConfigs.map((room, i) => {
        if (i !== roomIndex) return room;
        const newAges = [...room.childAges];
        newAges[childIndex] = parseInt(age, 10);
        return { ...room, childAges: newAges };
      })
    );
  };

  const getTotalAdults = () => roomConfigs.reduce((sum, r) => sum + r.adults, 0);
  const getTotalChildren = () => roomConfigs.reduce((sum, r) => sum + r.children, 0);
  const getAllChildAges = () => roomConfigs.flatMap((r) => r.childAges);

  const calculateNights = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    return Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
  };

  const getTravellerSummary = () => {
    const totalAdults = getTotalAdults();
    const totalChildren = getTotalChildren();
    let summary = `${totalAdults} Adult${totalAdults > 1 ? "s" : ""}`;
    if (totalChildren > 0) {
      summary += `, ${totalChildren} Child${totalChildren > 1 ? "ren" : ""}`;
    }
    summary += ` · ${roomConfigs.length} Room${roomConfigs.length > 1 ? "s" : ""}`;
    return summary;
  };

  // Debounced Unified Search: Instant Suggestions + Backend API
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }
    const queryTerm = searchQuery.trim();
    if (queryTerm.length < 2) {
      setFilteredLocations([]);
      setHotelSuggestions([]);
      return;
    }

    setIsLoadingLocations(true);
    const timer = setTimeout(async () => {
      try {
        const [locRes, hotelRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/locations/search?q=${encodeURIComponent(queryTerm)}`),
          fetch(`${API_BASE}/api/hotels/search-by-name?q=${encodeURIComponent(queryTerm)}&limit=12`)
        ]);

        let apiLocs = [];
        if (locRes.status === "fulfilled" && locRes.value.ok) {
          const data = await locRes.value.json();
          if (data.success) apiLocs = data.data || [];
        }

        let apiHotels = [];
        if (hotelRes.status === "fulfilled" && hotelRes.value.ok) {
          const hData = await hotelRes.value.json();
          if (hData.success) apiHotels = hData.data || [];
        }

        // Merge instant local suggestions with API results (deduplicate)
        const instant = getInstantSuggestions(queryTerm);

        const seenLocs = new Set();
        const mergedLocs = [];
        for (const loc of [...(instant.locations || []), ...apiLocs]) {
          const key = (loc.destinationCode || loc.code || loc.city || loc.name || "").toLowerCase();
          if (key && !seenLocs.has(key)) {
            seenLocs.add(key);
            mergedLocs.push(loc);
          }
        }

        const seenHotels = new Set();
        const mergedHotels = [];
        for (const hotel of [...(instant.hotels || []), ...apiHotels]) {
          const key = (hotel.code ? `code-${hotel.code}` : hotel.name || "").toLowerCase();
          if (key && !seenHotels.has(key)) {
            seenHotels.add(key);
            mergedHotels.push(hotel);
          }
        }

        if (!isSelectingRef.current) {
          setFilteredLocations(mergedLocs);
          setHotelSuggestions(mergedHotels);
          setShowLocationDropdown(true);
        }
      } catch (err) {
        console.warn("Search error:", err.message);
      } finally {
        setIsLoadingLocations(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLocationSelect = (location) => {
    isSelectingRef.current = true;
    setSelectedLocation(location);
    setSelectedHotelCode(null);
    const label =
      location.displayName ||
      (location.country
        ? `${location.name || location.city}, ${location.country}`
        : location.name || location.city);
    setSearchQuery(label);
    setShowLocationDropdown(false);
  };

  const handleHotelSelect = (hotel) => {
    isSelectingRef.current = true;
    setSelectedHotelCode(hotel.code);
    setSelectedLocation({
      type: "hotel",
      code: hotel.code,
      name: hotel.name,
      city: hotel.zoneName || hotel.destinationName || hotel.city || "",
      destinationCode: hotel.destinationCode || "",
      country: hotel.countryCode || hotel.country || "",
      countryCode: hotel.countryCode || ""
    });
    setSearchQuery(hotel.name);
    setShowLocationDropdown(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. TRANSFERS SEARCH STATE (Audited from TransfersTab in HotelSearchForm.jsx)
  // ═══════════════════════════════════════════════════════════════════════════
  const [tripType, setTripType] = useState("one_way");
  const [pickupQuery, setPickupQuery] = useState("Dubai International Airport (DXB)");
  const [dropoffQuery, setDropoffQuery] = useState("Downtown Dubai / Palm Jumeirah");
  const [selectedPickup, setSelectedPickup] = useState({
    name: "Dubai International Airport (DXB)",
    code: "DXB",
    type: "IATA"
  });
  const [selectedDropoff, setSelectedDropoff] = useState({
    name: "Downtown Dubai / Palm Jumeirah",
    code: "DXB",
    type: "ATLAS"
  });
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [isLoadingPickup, setIsLoadingPickup] = useState(false);
  const [isLoadingDropoff, setIsLoadingDropoff] = useState(false);
  const [filteredPickupLocations, setFilteredPickupLocations] = useState([]);
  const [filteredDropoffLocations, setFilteredDropoffLocations] = useState([]);
  const [groupedPickup, setGroupedPickup] = useState([]);
  const [groupedDropoff, setGroupedDropoff] = useState([]);
  const [transferDateRange, setTransferDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 1),
      key: "selection"
    }
  ]);
  const [showTransferCalendar, setShowTransferCalendar] = useState(false);
  const [transferAdults, setTransferAdults] = useState(1);
  const [transferChildren, setTransferChildren] = useState(0);
  const [transferInfants, setTransferInfants] = useState(0);
  const [showTransferTravellers, setShowTransferTravellers] = useState(false);
  const [transferError, setTransferError] = useState(null);

  // Debounced search for pickup locations via API
  useEffect(() => {
    if (pickupQuery.trim().length < 2) {
      setFilteredPickupLocations([]);
      setGroupedPickup([]);
      return;
    }
    setIsLoadingPickup(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/locations/transfers?search=${encodeURIComponent(pickupQuery.trim())}`
        );
        if (response.data.success) {
          setFilteredPickupLocations(response.data.data || []);
          setGroupedPickup(response.data.grouped || []);
        }
      } catch (err) {
        console.error("Error searching pickup locations:", err);
      } finally {
        setIsLoadingPickup(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pickupQuery]);

  // Debounced search for dropoff locations via API
  useEffect(() => {
    if (dropoffQuery.trim().length < 2) {
      setFilteredDropoffLocations([]);
      setGroupedDropoff([]);
      return;
    }
    setIsLoadingDropoff(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/locations/transfers?search=${encodeURIComponent(dropoffQuery.trim())}`
        );
        if (response.data.success) {
          setFilteredDropoffLocations(response.data.data || []);
          setGroupedDropoff(response.data.grouped || []);
        }
      } catch (err) {
        console.error("Error searching dropoff locations:", err);
      } finally {
        setIsLoadingDropoff(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dropoffQuery]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. EXPERIENCES SEARCH STATE (Audited from ExperiencesTab)
  // ═══════════════════════════════════════════════════════════════════════════
  const [experienceQuery, setExperienceQuery] = useState("Dubai, United Arab Emirates");
  const [selectedExperienceLocation, setSelectedExperienceLocation] = useState({
    city: "Dubai",
    country: "United Arab Emirates",
    displayName: "Dubai, United Arab Emirates"
  });
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [experienceDateRange, setExperienceDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: "selection"
    }
  ]);
  const [showExperienceCalendar, setShowExperienceCalendar] = useState(false);
  const [experienceAdults, setExperienceAdults] = useState(2);
  const [experienceChildren, setExperienceChildren] = useState(0);
  const [showExperienceTravellers, setShowExperienceTravellers] = useState(false);

  useEffect(() => {
    if (!experienceQuery.trim()) {
      setFilteredExperiences(TOP_DESTINATIONS.slice(0, 6));
      return;
    }
    const instant = getInstantSuggestions(experienceQuery);
    setFilteredExperiences(instant.locations.slice(0, 8));
  }, [experienceQuery]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCROLL & HEADER SYNC
  // ═══════════════════════════════════════════════════════════════════════════
  const locationRef = useRef(null);
  const searchBarRef = useRef(null);
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  // Monitor scroll: Collapse search inputs toward the blue button as it approaches header pill
  useEffect(() => {
    const handleScroll = () => {
      if (!searchBarRef.current) return;
      const rect = searchBarRef.current.getBoundingClientRect();
      const isReached = rect.top <= 65;
      setReachedHeader(isReached);

      if (rect.top > 140) {
        setCollapseProgress(0);
      } else if (rect.top <= 65) {
        setCollapseProgress(1);
      } else {
        setCollapseProgress((140 - rect.top) / (140 - 65));
      }

      window.dispatchEvent(
        new CustomEvent("heroSearchReachedHeader", { detail: { reached: isReached } })
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.dispatchEvent(
        new CustomEvent("heroSearchReachedHeader", { detail: { reached: false } })
      );
    };
  }, []);

  // Auto-advance sliding pictures every 5.5s
  useEffect(() => {
    setCurrentSlide(0);
    setSlideDirection(1);
    const interval = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide((prev) => (prev + 1) % currentTab.images.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeTab, currentTab.images.length]);

  // Preload tab images
  useEffect(() => {
    currentTab.images.forEach((img) => {
      const pic = new Image();
      pic.src = img.url;
    });
  }, [activeTab, currentTab.images]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
      if (pickupRef.current && !pickupRef.current.contains(e.target)) {
        setShowPickupDropdown(false);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(e.target)) {
        setShowDropoffDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-fill and scroll to search form when a destination card is clicked anywhere on the page
  useEffect(() => {
    const handleSelectDestination = (e) => {
      const dest = e.detail?.destination;
      if (!dest) return;

      setActiveTab("stays");
      const label = dest.country ? `${dest.name}, ${dest.country}` : dest.name;
      isSelectingRef.current = true;
      setSearchQuery(label);
      setSelectedLocation({
        name: dest.name,
        city: dest.name,
        country: dest.country || "",
        destinationCode: dest.destinationCode || dest.code || "",
        type: "destination"
      });
      setSelectedHotelCode(null);
      setShowLocationDropdown(false);

      if (searchBarRef.current) {
        const rect = searchBarRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = scrollTop + rect.top - 120;
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    window.addEventListener("selectHeroDestination", handleSelectDestination);
    return () => window.removeEventListener("selectHeroDestination", handleSelectDestination);
  }, []);

  // Listen for tab switch events from external components (e.g. WhyTeliTripSlider)
  useEffect(() => {
    const handleSwitchTab = (e) => {
      const targetTab = e.detail?.tab;
      if (targetTab && TAB_DATA[targetTab]) {
        setActiveTab(targetTab);
      }
      setTimeout(() => {
        if (searchBarRef.current) {
          const rect = searchBarRef.current.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetY = scrollTop + rect.top - 120;
          window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    };

    window.addEventListener("switchHeroTab", handleSwitchTab);
    return () => window.removeEventListener("switchHeroTab", handleSwitchTab);
  }, []);

  // Check URL query parameters on mount (e.g. /?tab=transfers)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && TAB_DATA[tabParam]) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleStartSearchClick = () => {
    if (activeTab === "stays") {
      setShowLocationDropdown(true);
    } else if (activeTab === "transfers") {
      setShowPickupDropdown(true);
    } else if (activeTab === "experiences") {
      setShowExperienceDropdown(true);
    }
    if (searchBarRef.current) {
      searchBarRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPREHENSIVE SEARCH SUBMISSION (Audited from HotelSearchForm.jsx)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();

    // ─────────────────────────────────────────────────────────────────────────
    // TAB 1: STAYS SUBMISSION
    // ─────────────────────────────────────────────────────────────────────────
    if (activeTab === "stays") {
      const trimmedQuery = searchQuery.trim();
      if (!selectedLocation && !selectedHotelCode && !trimmedQuery) {
        setShowLocationDropdown(true);
        return;
      }

      const checkIn = format(dateRange[0].startDate, "yyyy-MM-dd");
      const checkOut = format(dateRange[0].endDate, "yyyy-MM-dd");

      let loc = selectedLocation;
      let hCode = selectedHotelCode;
      let hName = "";

      if (loc?.type === "hotel") {
        hCode = loc.code || hCode;
        hName = loc.name;
      } else if (hCode) {
        hName = loc?.name || trimmedQuery;
      } else if (!loc && trimmedQuery) {
        const instant = getInstantSuggestions(trimmedQuery);
        const exactHotel = instant.hotels?.find(
          (h) => h.name.toLowerCase() === trimmedQuery.toLowerCase()
        );
        if (exactHotel) {
          hCode = exactHotel.code;
          hName = exactHotel.name;
          loc = {
            type: "hotel",
            code: exactHotel.code,
            name: exactHotel.name,
            city: exactHotel.destinationName || exactHotel.zoneName || "",
            destinationCode: exactHotel.destinationCode || "",
            country: exactHotel.countryCode || ""
          };
        } else {
          const exactLoc =
            instant.locations?.find(
              (l) =>
                (l.city || l.name).toLowerCase() === trimmedQuery.toLowerCase() ||
                l.displayName?.toLowerCase() === trimmedQuery.toLowerCase()
            ) || (instant.locations && instant.locations.length > 0 ? instant.locations[0] : null);

          if (exactLoc) {
            loc = exactLoc;
          } else {
            const parts = trimmedQuery.split(",").map((s) => s.trim());
            loc = {
              name: parts[0],
              city: parts[0],
              country: parts[1] || "",
              destinationCode: "",
              type: "destination"
            };
          }
        }
      }

      const city =
        loc?.type === "hotel"
          ? loc.city || ""
          : loc?.city || loc?.name || (!hCode ? trimmedQuery : "");
      const country = loc?.country || loc?.countryCode || "";
      const destinationCode = loc?.destinationCode || "";

      const totalAdults = getTotalAdults();
      const totalChildren = getTotalChildren();
      const allChildAges = getAllChildAges();

      const params = new URLSearchParams();
      params.set("checkIn", checkIn);
      params.set("checkOut", checkOut);
      params.set("rooms", String(roomConfigs.length));
      params.set("adults", String(totalAdults));
      params.set("children", String(totalChildren));

      if (city) params.set("city", city);
      if (country) params.set("country", country);
      if (destinationCode) params.set("destinationCode", destinationCode);
      if (hCode) params.set("hotelCode", String(hCode));
      if (hName) params.set("hotelName", hName);

      if (loc?.lat || loc?.latitude) {
        params.set("latitude", String(loc.lat || loc.latitude));
        params.set("longitude", String(loc.lon || loc.longitude));
      }

      if (totalChildren > 0 && allChildAges.length > 0) {
        params.set("childAges", allChildAges.join(","));
      }

      params.set("roomConfigs", JSON.stringify(roomConfigs));

      if (luxuryOnly) {
        params.set("luxury", "true");
      }

      navigate(`/hotel-search-results?${params.toString()}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TAB 2: TRANSFERS SUBMISSION
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeTab === "transfers") {
      setTransferError(null);
      if (!selectedPickup || !selectedDropoff) {
        setTransferError("Please select both pickup and dropoff locations");
        return;
      }
      if (!transferDateRange[0].startDate) {
        setTransferError("Please select a travel date");
        return;
      }
      if (
        tripType === "round_trip" &&
        transferDateRange[0].startDate >= transferDateRange[0].endDate
      ) {
        setTransferError("Return date must be after outbound date");
        return;
      }

      setIsSubmitting(true);
      try {
        const outboundDate = format(transferDateRange[0].startDate, "yyyy-MM-dd");
        const returnDateStr =
          tripType === "round_trip"
            ? format(transferDateRange[0].endDate, "yyyy-MM-dd")
            : null;

        const searchParams = {
          language: "en",
          fromType: selectedPickup.type || "ATLAS",
          fromCode: selectedPickup.code || "DXB",
          toType: selectedDropoff.type || "IATA",
          toCode: selectedDropoff.code || "DXB",
          outbound: `${outboundDate}T10:00:00`,
          adults: transferAdults,
          children: transferChildren,
          infants: transferInfants,
          tripType,
          ...(returnDateStr ? { inbound: `${returnDateStr}T10:00:00` } : {})
        };

        // Store search params for display on results page
        sessionStorage.setItem(
          "transferSearch",
          JSON.stringify({
            ...searchParams,
            pickupName: selectedPickup.name,
            dropoffName: selectedDropoff.name
          })
        );
        sessionStorage.removeItem("transferError");

        const results = await searchTransfers(searchParams);

        const params = new URLSearchParams({
          from: selectedPickup.name,
          to: selectedDropoff.name,
          fromCode: selectedPickup.code || "DXB",
          toCode: selectedDropoff.code || "DXB",
          fromType: selectedPickup.type || "ATLAS",
          toType: selectedDropoff.type || "IATA",
          date: outboundDate,
          ...(returnDateStr ? { returnDate: returnDateStr } : {}),
          tripType,
          adults: String(transferAdults),
          ...(transferChildren > 0 ? { children: String(transferChildren) } : {}),
          ...(transferInfants > 0 ? { infants: String(transferInfants) } : {})
        });

        if (results?.success) {
          sessionStorage.setItem("transferResults", JSON.stringify(results.data));
        } else {
          sessionStorage.setItem(
            "transferError",
            JSON.stringify({ message: results?.message || "No transfers found for this route." })
          );
        }
        navigate(`/transfers?${params.toString()}`);
      } catch (err) {
        console.error("Transfer search error:", err);
        const apiResponse = err.response?.data;
        const errorMessage =
          apiResponse?.message || err.message || "Transfer search failed. Please try again.";
        sessionStorage.setItem("transferResults", JSON.stringify({ transfers: [] }));
        sessionStorage.setItem(
          "transferError",
          JSON.stringify({ message: errorMessage, error: apiResponse?.error })
        );
        navigate("/transfers");
      } finally {
        setIsSubmitting(false);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TAB 3: EXPERIENCES SUBMISSION
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeTab === "experiences") {
      const city =
        selectedExperienceLocation?.city ||
        experienceQuery.split(",")[0].trim() ||
        "Dubai";
      const country =
        selectedExperienceLocation?.country ||
        experienceQuery.split(",")[1]?.trim() ||
        "United Arab Emirates";
      const from = format(experienceDateRange[0].startDate, "yyyy-MM-dd");
      const to = format(experienceDateRange[0].endDate, "yyyy-MM-dd");

      const url = `/activity-search-results?destination=${encodeURIComponent(
        city
      )}&country=${encodeURIComponent(
        country
      )}&from=${from}&to=${to}&adults=${experienceAdults}&children=${experienceChildren}`;

      navigate(url);
    }
  };

  const tabs = [
    { id: "stays", ...TAB_DATA.stays },
    { id: "transfers", ...TAB_DATA.transfers },
    { id: "experiences", ...TAB_DATA.experiences }
  ];

  const currentImage = currentTab.images[currentSlide] || currentTab.images[0];

  return (
    <section className="relative w-full min-h-0 sm:min-h-[540px] lg:min-h-[580px] overflow-visible bg-white flex flex-col justify-center pt-20 sm:pt-24 lg:pt-28 pb-6 sm:pb-8 lg:pb-10 select-none">

      {/* ════ BACKGROUND SLIDING IMAGES (Mid-to-Left Fade-to-Zero) ════ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence initial={false} custom={slideDirection}>
          <motion.div
            key={`${activeTab}-${currentSlide}`}
            custom={slideDirection}
            initial={{ opacity: 0, x: slideDirection > 0 ? "7%" : "-7%", scale: 1.025 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: slideDirection > 0 ? "-7%" : "7%", scale: 0.985 }}
            transition={{
              opacity: { duration: 1.1, ease: [0.25, 0.1, 0.25, 1] },
              x: { duration: 1.35, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 1.35, ease: [0.16, 1, 0.3, 1] }
            }}
            className="absolute inset-0 w-full h-full"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 18%, rgba(0,0,0,0.45) 36%, rgba(0,0,0,0.92) 52%, black 65%, black 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 18%, rgba(0,0,0,0.45) 36%, rgba(0,0,0,0.92) 52%, black 65%, black 100%)"
            }}
          >
            <img
              src={currentImage.url}
              alt={currentImage.title}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* Soft vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/40 sm:to-transparent w-full sm:w-[58%] z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40 pointer-events-none z-10" />
      </div>

      {/* ════ MAIN CONTAINER ════ */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center py-2 sm:py-3">

        {/* ── TOP SECTION: Dynamic Headline & Subtitle (Centrally aligned with search bar) ── */}
        <div className="max-w-3xl mx-auto text-center mb-5 sm:mb-7 lg:mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              {/* Dynamic Tagline (Always 2 Balanced Lines) */}
              <h1 className="text-2xl min-[360px]:text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-2 sm:mb-3 lg:mb-4">
                <span className="block">{currentTab.headlinePrimary}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
                  {currentTab.headlineSecondary}
                </span>
              </h1>

              {/* Dynamic Subtext */}
              <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
                {currentTab.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ════ 3 TABS & FLOATING CAPSULE SEARCH BAR (Centrally aligned) ════ */}
        <div
          ref={searchBarRef}
          className="max-w-5xl mx-auto relative z-50 w-full search-form-section mb-6 sm:mb-2 pb-2 sm:pb-0"
        >
          {/* Transfer Error Alert */}
          {activeTab === "transfers" && transferError && (
            <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
              <span>{transferError}</span>
              <button
                type="button"
                onClick={() => setTransferError(null)}
                className="text-red-500 hover:text-red-700 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── 3 Category Tabs (Stays, Transfers, Experiences) + Trip Type Toggle ── */}
          <div
            className="flex items-center justify-between mb-2.5 sm:mb-3.5 px-2 sm:px-4 transition-all duration-200"
            style={{
              opacity: Math.max(0, 1 - collapseProgress * 1.5),
              transform: `translateY(${-collapseProgress * 8}px)`,
              pointerEvents: collapseProgress > 0.4 ? "none" : "auto"
            }}
          >
            <div className="flex items-center gap-4 min-[360px]:gap-6 sm:gap-8">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-1.5 text-xs sm:text-sm font-black transition-all cursor-pointer relative ${isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    <AnimatedIcon
                      name={tab.icon}
                      animation={tab.animation}
                      size={14}
                      className={isActive ? "text-blue-600" : "text-slate-400"}
                    />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* If Transfers active: One Way / Round Trip pill toggle */}
            {activeTab === "transfers" && (
              <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTripType("one_way")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${tripType === "one_way"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("round_trip")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${tripType === "round_trip"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  Round Trip
                </button>
              </div>
            )}
          </div>

          {/* ── Floating Capsule Search Bar (Collapses as it approaches header) ── */}
          <div
            className="rounded-3xl sm:rounded-full p-1.5 sm:p-2 transition-all duration-200 relative z-50 bg-white"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${Math.max(0, 1 - collapseProgress)})`,
              boxShadow:
                collapseProgress > 0.8
                  ? "none"
                  : `0 12px 45px rgba(0,0,0, ${0.09 * (1 - collapseProgress)})`,
              borderColor: `rgba(241, 245, 249, ${Math.max(0, 1 - collapseProgress)})`,
              borderWidth: 1
            }}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-0 justify-between"
            >
              {/* Input Fields (Slide right and collapse toward the blue search button) */}
              <div
                className="flex flex-col sm:flex-row sm:items-center flex-1 transition-all duration-200"
                style={{
                  opacity: Math.max(0, 1 - collapseProgress * 1.3),
                  transform: `translateX(${collapseProgress * 24}px)`,
                  pointerEvents: collapseProgress > 0.4 ? "none" : "auto"
                }}
              >
                {/* ═══════════════════════════════════════════════════════════
                    TAB 1: STAYS INPUT VIEW
                ═══════════════════════════════════════════════════════════ */}
                {activeTab === "stays" && (
                  <>
                    {/* Segment 1: Location & Hotel */}
                    <div
                      ref={locationRef}
                      className={`relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors ${showLocationDropdown ? 'z-[60]' : 'z-20'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                        {selectedHotelCode ? (
                          <AnimatedIcon name="hotel" animation="pulse" size={16} className="text-emerald-600" />
                        ) : (
                          <AnimatedIcon name="location" animation="bounce" size={16} />
                        )}
                      </div>
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => setShowLocationDropdown(true)}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                            Location
                          </span>
                          {selectedHotelCode && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                              Hotel
                            </span>
                          )}
                          {!selectedHotelCode && selectedLocation && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full">
                              City
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            isSelectingRef.current = false;
                            setSearchQuery(e.target.value);
                            setSelectedLocation(null);
                            setSelectedHotelCode(null);
                            setShowLocationDropdown(true);
                          }}
                          onFocus={() => setShowLocationDropdown(true)}
                          placeholder="Where are you going? e.g. Dubai, Atlantis..."
                          className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                        />
                      </div>

                      {searchQuery && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            isSelectingRef.current = false;
                            setSearchQuery("");
                            setSelectedLocation(null);
                            setSelectedHotelCode(null);
                            setFilteredLocations([]);
                            setHotelSuggestions([]);
                            setShowLocationDropdown(false);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      )}

                      {/* Dropdown with Grouped Autocomplete Results */}
                      {showLocationDropdown && (
                        <div
                          className="absolute top-full left-0 mt-2 sm:mt-3 w-full sm:w-96 max-w-[calc(100vw-3rem)] sm:max-w-none bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-slate-200 z-[200] overflow-hidden divide-y divide-slate-100"
                          style={{ scrollbarWidth: "thin" }}
                        >
                          <div className="p-2.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                            <span>Top Destinations & Hotels</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowLocationDropdown(false);
                              }}
                              className="hover:text-slate-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="max-h-64 overflow-y-auto">
                            {isLoadingLocations && filteredLocations.length === 0 && hotelSuggestions.length === 0 ? (
                              <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span>Searching destinations and hotels...</span>
                              </div>
                            ) : searchQuery.trim().length < 2 ? (
                              <div className="p-4 text-center text-slate-400 text-xs">
                                Please type at least 2 characters to search destinations or hotels.
                              </div>
                            ) : filteredLocations.length === 0 && hotelSuggestions.length === 0 ? (
                              <div className="p-4 text-center text-slate-400 text-xs">
                                No destinations or hotels found for "{searchQuery}".
                              </div>
                            ) : (
                              <>
                                {/* Section 1: Destinations */}
                                {(() => {
                                  const dests = filteredLocations.filter((l) => l.type !== "hotel");
                                  if (dests.length === 0) return null;
                                  return (
                                    <div>
                                      <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <MapPin size={12} className="text-blue-600" />
                                          <span>Destinations & Cities</span>
                                        </div>
                                      </div>
                                      {dests.map((loc, i) => (
                                        <div
                                          key={`loc-${i}`}
                                          onClick={() => handleLocationSelect(loc)}
                                          className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-2 transition-colors border-b border-slate-50 last:border-0"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                                            <div className="truncate">
                                              <div className="font-extrabold text-xs text-slate-900 truncate">
                                                {loc.city || loc.name}
                                              </div>
                                              <div className="text-[10px] text-slate-400 truncate">
                                                {loc.country}
                                                {loc.destinationCode ? ` · ${loc.destinationCode}` : ""}
                                              </div>
                                            </div>
                                          </div>
                                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                                            City
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}

                                {/* Section 2: Hotels */}
                                {(() => {
                                  if (hotelSuggestions.length === 0) return null;
                                  return (
                                    <div>
                                      <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <Building2 size={12} className="text-emerald-600" />
                                          <span>Hotels & Properties</span>
                                        </div>
                                      </div>
                                      {hotelSuggestions.map((hotel, idx) => (
                                        <div
                                          key={`h-${idx}`}
                                          onClick={() => handleHotelSelect(hotel)}
                                          className="px-3 py-2 hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between gap-2 transition-colors border-b border-slate-50 last:border-0"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                            <div className="truncate">
                                              <div className="font-extrabold text-xs text-slate-900 truncate">
                                                {hotel.name}
                                              </div>
                                              <div className="text-[10px] text-slate-400 truncate">
                                                {hotel.zoneName || hotel.destinationName || hotel.city || ""}
                                              </div>
                                            </div>
                                          </div>
                                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                                            Hotel
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vertical Divider */}
                    <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />
                    <div className="sm:hidden h-px w-full bg-slate-100/90 my-0.5" />

                    {/* Segment 2: Dates */}
                    <div
                      onClick={() => setShowCalendar(true)}
                      className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                        <AnimatedIcon name="time" animation="pulse" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                            Dates
                          </span>
                          <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full">
                            {calculateNights()}n
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                          {format(dateRange[0].startDate, "MMM d")} - {format(dateRange[0].endDate, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />
                    <div className="sm:hidden h-px w-full bg-slate-100/90 my-0.5" />

                    {/* Segment 3: Guests & Multi-Rooms */}
                    <div
                      onClick={() => setShowTravellerDropdown(true)}
                      className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                        <AnimatedIcon name="users" animation="pulse" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                          Guests & Rooms
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                          {getTravellerSummary()}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    TAB 2: TRANSFERS INPUT VIEW
                ═══════════════════════════════════════════════════════════ */}
                {activeTab === "transfers" && (
                  <>
                    {/* Pickup */}
                    <div
                      ref={pickupRef}
                      className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                        <AnimatedIcon name="car" animation="glide" size={16} />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => setShowPickupDropdown(true)}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                          Pickup Location
                        </span>
                        <input
                          type="text"
                          value={pickupQuery}
                          onChange={(e) => {
                            setPickupQuery(e.target.value);
                            setSelectedPickup(null);
                            setShowPickupDropdown(true);
                          }}
                          onFocus={() => setShowPickupDropdown(true)}
                          placeholder="Airport, station or hotel..."
                          className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                        />
                      </div>

                      {showPickupDropdown && (filteredPickupLocations.length > 0 || groupedPickup.length > 0 || isLoadingPickup) && (
                        <div
                          className="absolute top-full left-0 mt-2 sm:mt-3 w-full sm:w-96 max-w-[calc(100vw-3rem)] sm:max-w-none bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-slate-200 z-[200] overflow-hidden divide-y divide-slate-100"
                          style={{ scrollbarWidth: "thin" }}
                        >
                          <div className="p-2.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                            <span>Pickup Points</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPickupDropdown(false);
                              }}
                              className="hover:text-slate-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="max-h-60 overflow-y-auto">
                            {isLoadingPickup ? (
                              <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span>Finding pickup locations...</span>
                              </div>
                            ) : (
                              filteredPickupLocations.map((loc, i) => (
                                <div
                                  key={`pick-${i}`}
                                  onClick={() => {
                                    setSelectedPickup(loc);
                                    setPickupQuery(loc.name);
                                    setShowPickupDropdown(false);
                                  }}
                                  className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50 last:border-0"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Plane className="w-4 h-4 text-blue-600 shrink-0" />
                                    <div className="truncate">
                                      <div className="font-extrabold text-xs text-slate-900 truncate">{loc.name}</div>
                                      <div className="text-[10px] text-slate-400 truncate">{loc.type || "Airport"}</div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                    {/* Dropoff */}
                    <div
                      ref={dropoffRef}
                      className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => setShowDropoffDropdown(true)}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                          Dropoff Location
                        </span>
                        <input
                          type="text"
                          value={dropoffQuery}
                          onChange={(e) => {
                            setDropoffQuery(e.target.value);
                            setSelectedDropoff(null);
                            setShowDropoffDropdown(true);
                          }}
                          onFocus={() => setShowDropoffDropdown(true)}
                          placeholder="Hotel, resort or district..."
                          className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                        />
                      </div>

                      {showDropoffDropdown && (filteredDropoffLocations.length > 0 || groupedDropoff.length > 0 || isLoadingDropoff) && (
                        <div
                          className="absolute top-full left-0 sm:-left-20 mt-2 sm:mt-3 w-full sm:w-96 max-w-[calc(100vw-3rem)] sm:max-w-none bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-slate-200 z-[200] overflow-hidden divide-y divide-slate-100"
                          style={{ scrollbarWidth: "thin" }}
                        >
                          <div className="p-2.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                            <span>Dropoff Points</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDropoffDropdown(false);
                              }}
                              className="hover:text-slate-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="max-h-60 overflow-y-auto">
                            {isLoadingDropoff ? (
                              <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span>Finding dropoff locations...</span>
                              </div>
                            ) : (
                              filteredDropoffLocations.map((loc, i) => (
                                <div
                                  key={`drop-${i}`}
                                  onClick={() => {
                                    setSelectedDropoff(loc);
                                    setDropoffQuery(loc.name);
                                    setShowDropoffDropdown(false);
                                  }}
                                  className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50 last:border-0"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <div className="truncate">
                                      <div className="font-extrabold text-xs text-slate-900 truncate">{loc.name}</div>
                                      <div className="text-[10px] text-slate-400 truncate">{loc.type || "Hotel"}</div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                    {/* Date */}
                    <div
                      onClick={() => setShowTransferCalendar(true)}
                      className="relative px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                        <AnimatedIcon name="time" animation="pulse" size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                          {tripType === "round_trip" ? "Dates" : "Travel Date"}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate block">
                          {tripType === "round_trip"
                            ? `${format(transferDateRange[0].startDate, "MMM d")} - ${format(transferDateRange[0].endDate, "MMM d")}`
                            : format(transferDateRange[0].startDate, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                    {/* Passengers */}
                    <div
                      onClick={() => setShowTransferTravellers(true)}
                      className="relative px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                        <AnimatedIcon name="users" animation="pulse" size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                          Passengers
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate block">
                          {transferAdults + transferChildren + transferInfants} Pax
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    TAB 3: EXPERIENCES INPUT VIEW
                ═══════════════════════════════════════════════════════════ */}
                {activeTab === "experiences" && (
                  <>
                    {/* Destination */}
                    <div className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 flex items-center justify-center shrink-0">
                        <AnimatedIcon name="experiences" animation="bounce" size={16} />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => setShowExperienceDropdown(true)}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                          Destination or Activity
                        </span>
                        <input
                          type="text"
                          value={experienceQuery}
                          onChange={(e) => {
                            setExperienceQuery(e.target.value);
                            setSelectedExperienceLocation(null);
                            setShowExperienceDropdown(true);
                          }}
                          onFocus={() => setShowExperienceDropdown(true)}
                          placeholder="Where are you going? e.g. Dubai, Paris..."
                          className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                        />
                      </div>

                      {showExperienceDropdown && (
                        <div
                          className="absolute top-full left-0 mt-2 sm:mt-3 w-full sm:w-96 max-w-[calc(100vw-3rem)] sm:max-w-none bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-slate-200 z-[200] overflow-hidden divide-y divide-slate-100"
                          style={{ scrollbarWidth: "thin" }}
                        >
                          <div className="p-2.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                            <span>Popular Destinations</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowExperienceDropdown(false);
                              }}
                              className="hover:text-slate-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredExperiences.map((dest, i) => (
                              <div
                                key={`exp-${i}`}
                                onClick={() => {
                                  setSelectedExperienceLocation(dest);
                                  setExperienceQuery(dest.displayName || `${dest.name}, ${dest.country}`);
                                  setShowExperienceDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-purple-50/70 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50 last:border-0"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Compass className="w-4 h-4 text-purple-600 shrink-0" />
                                  <div className="truncate">
                                    <div className="font-extrabold text-xs text-slate-900 truncate">{dest.name}</div>
                                    <div className="text-[10px] text-slate-400 truncate">{dest.country}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                    {/* Date */}
                    <div
                      onClick={() => setShowExperienceCalendar(true)}
                      className="relative px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 flex items-center justify-center shrink-0">
                        <AnimatedIcon name="time" animation="pulse" size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                          Dates
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate block">
                          {format(experienceDateRange[0].startDate, "MMM d")} - {format(experienceDateRange[0].endDate, "MMM d")}
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />
                    <div className="sm:hidden h-px w-full bg-slate-100/90 my-0.5" />

                    {/* Travellers */}
                    <div
                      onClick={() => setShowExperienceTravellers(true)}
                      className="relative px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 flex items-center justify-center shrink-0">
                        <AnimatedIcon name="users" animation="pulse" size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                          Travellers
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate block">
                          {experienceAdults + experienceChildren} Pax
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ── Search Action Button: Full-width tap target on mobile, circular on desktop ── */}
              <div className="p-1 sm:p-0 sm:pr-1 flex w-full sm:w-auto justify-end shrink-0 mt-1 sm:mt-0 relative z-10">
                <button
                  type="submit"
                  aria-label="Search"
                  style={{
                    opacity: reachedHeader ? 0 : 1,
                    transform: reachedHeader ? "scale(0.85) translateY(-6px)" : "scale(1) translateY(0)",
                    transition: "opacity 0.15s ease, transform 0.15s ease"
                  }}
                  className="w-full sm:w-12 h-11 sm:h-12 rounded-xl sm:rounded-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="sm:hidden text-xs font-black uppercase tracking-wider">
                        {activeTab === "stays" ? "Search Stays" : activeTab === "transfers" ? "Search Transfers" : "Search Experiences"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          CALENDAR & TRAVELLER PORTALS (Full functionality from HotelSearchForm)
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* 1. Stays Calendar Modal Portal */}
      {showCalendar &&
        createPortal(
          <div
            data-calendar-portal
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCalendar(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6 w-[calc(100vw-24px)] sm:w-[680px] md:w-[720px] max-w-[720px] mx-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Select Travel Dates</h3>
                  <p className="text-xs text-slate-500">{calculateNights()} night stay</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading calendar...</div>}>
                <LazyDateRange
                  ranges={dateRange}
                  onChange={(item) => {
                    const sel = item.selection;
                    if (sel.startDate.getTime() === sel.endDate.getTime()) {
                      setDateRange([{ ...sel, endDate: addDays(sel.startDate, 1) }]);
                    } else {
                      setDateRange([sel]);
                    }
                  }}
                  minDate={new Date()}
                  moveRangeOnFirstSelection={false}
                  preventSnapRefocus={true}
                  months={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2}
                  direction="horizontal"
                  rangeColors={["#2563eb"]}
                  showDateDisplay={false}
                />
              </Suspense>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {format(dateRange[0].startDate, "MMM d, yyyy")} - {format(dateRange[0].endDate, "MMM d, yyyy")}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-xs cursor-pointer shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 2. Stays Multi-Room & Guests Modal Portal */}
      {showTravellerDropdown &&
        createPortal(
          <div
            data-traveller-portal
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTravellerDropdown(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto w-full"
              style={{ maxWidth: 430, margin: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Rooms & Travellers</h3>
                  <p className="text-xs text-slate-500">Configure guests per room</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTravellerDropdown(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {roomConfigs.map((room, roomIdx) => (
                <div key={roomIdx} className={`${roomIdx > 0 ? "mt-4 pt-4 border-t border-gray-100" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Room {roomIdx + 1}
                    </span>
                    {roomConfigs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoom(roomIdx)}
                        className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>

                  {/* Adults */}
                  <div className="flex items-center justify-between py-1.5">
                    <div>
                      <span className="text-xs font-bold text-slate-800">Adults</span>
                      <span className="text-[10px] text-slate-400 block">Ages 18+</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateRoom(roomIdx, "adults", Math.max(1, room.adults - 1))}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold text-xs"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-black text-xs text-slate-900">{room.adults}</span>
                      <button
                        type="button"
                        onClick={() => updateRoom(roomIdx, "adults", Math.min(6, room.adults + 1))}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold text-xs"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between py-1.5">
                    <div>
                      <span className="text-xs font-bold text-slate-800">Children</span>
                      <span className="text-[10px] text-slate-400 block">Ages 0 - 17</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateRoom(roomIdx, "children", room.children - 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold text-xs"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-black text-xs text-slate-900">{room.children}</span>
                      <button
                        type="button"
                        onClick={() => updateRoom(roomIdx, "children", room.children + 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold text-xs"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Child Ages */}
                  {room.children > 0 && (
                    <div className="mt-2 pt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Ages of children at check-out
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {room.childAges.map((age, childIdx) => (
                          <div key={childIdx} className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 mb-0.5">Child {childIdx + 1}</span>
                            <select
                              value={age}
                              onChange={(e) => updateChildAge(roomIdx, childIdx, e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500"
                            >
                              <option value={0}>Under 1</option>
                              {[...Array(17)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1} year{i + 1 > 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Room button */}
              {roomConfigs.length < 6 && (
                <button
                  type="button"
                  onClick={addRoom}
                  className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-extrabold transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add another room
                </button>
              )}

              {/* Luxury Filter Checkbox */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <label className="flex items-center gap-2 p-2 bg-amber-50/70 border border-amber-200/50 rounded-xl cursor-pointer hover:bg-amber-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={luxuryOnly}
                    onChange={(e) => setLuxuryOnly(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <AnimatedIcon name="crown" animation="pulse" size={14} className="text-amber-600 shrink-0" />
                  <span className="text-xs font-extrabold text-amber-900">Luxury Collection 5-Star Only</span>
                </label>
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={() => setShowTravellerDropdown(false)}
                className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-black text-xs cursor-pointer shadow-md"
              >
                Apply Guests
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 3. Transfers Calendar Modal Portal */}
      {showTransferCalendar &&
        createPortal(
          <div
            data-calendar-portal
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTransferCalendar(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-x-hidden overflow-y-auto max-h-[92vh] p-3 sm:p-6 w-[calc(100vw-20px)] sm:w-auto max-w-sm sm:max-w-2xl lg:max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {tripType === "round_trip" ? "Select Outbound & Return Dates" : "Select Transfer Date"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTransferCalendar(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading calendar...</div>}>
                <LazyDateRange
                  ranges={transferDateRange}
                  onChange={(item) => {
                    const sel = item.selection;
                    if (tripType === "one_way") {
                      setTransferDateRange([{ startDate: sel.startDate, endDate: sel.startDate, key: "selection" }]);
                    } else {
                      setTransferDateRange([sel]);
                    }
                  }}
                  minDate={new Date()}
                  moveRangeOnFirstSelection={false}
                  preventSnapRefocus={true}
                  months={window.innerWidth < 640 ? 1 : 2}
                  direction="horizontal"
                  rangeColors={["#2563eb"]}
                  showDateDisplay={false}
                />
              </Suspense>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {tripType === "round_trip"
                    ? `${format(transferDateRange[0].startDate, "MMM d")} - ${format(transferDateRange[0].endDate, "MMM d, yyyy")}`
                    : format(transferDateRange[0].startDate, "MMM d, yyyy")}
                </span>
                <button
                  type="button"
                  onClick={() => setShowTransferCalendar(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-xs cursor-pointer shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 4. Transfers Passengers Modal Portal */}
      {showTransferTravellers &&
        createPortal(
          <div
            data-traveller-portal
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTransferTravellers(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-5 w-full"
              style={{ maxWidth: 380, margin: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Transfer Passengers</h3>
                <button
                  type="button"
                  onClick={() => setShowTransferTravellers(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Adults */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <span className="text-xs font-bold text-slate-800">Adults</span>
                  <span className="text-[10px] text-slate-400 block">Ages 12+</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferAdults(Math.max(1, transferAdults - 1))}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-black text-xs text-slate-900">{transferAdults}</span>
                  <button
                    type="button"
                    onClick={() => setTransferAdults(transferAdults + 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <span className="text-xs font-bold text-slate-800">Children</span>
                  <span className="text-[10px] text-slate-400 block">Ages 2-11</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferChildren(Math.max(0, transferChildren - 1))}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-black text-xs text-slate-900">{transferChildren}</span>
                  <button
                    type="button"
                    onClick={() => setTransferChildren(transferChildren + 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-xs font-bold text-slate-800">Infants</span>
                  <span className="text-[10px] text-slate-400 block">Under 2</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferInfants(Math.max(0, transferInfants - 1))}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-black text-xs text-slate-900">{transferInfants}</span>
                  <button
                    type="button"
                    onClick={() => setTransferInfants(transferInfants + 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTransferTravellers(false)}
                className="w-full mt-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-black text-xs cursor-pointer shadow-md"
              >
                Apply Passengers
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 5. Experiences Calendar Modal Portal */}
      {showExperienceCalendar &&
        createPortal(
          <div
            data-calendar-portal
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowExperienceCalendar(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-x-hidden overflow-y-auto max-h-[92vh] p-3 sm:p-6 w-[calc(100vw-20px)] sm:w-auto max-w-sm sm:max-w-2xl lg:max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-slate-900">Select Activity Dates</h3>
                <button
                  type="button"
                  onClick={() => setShowExperienceCalendar(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading calendar...</div>}>
                <LazyDateRange
                  ranges={experienceDateRange}
                  onChange={(item) => setExperienceDateRange([item.selection])}
                  minDate={new Date()}
                  moveRangeOnFirstSelection={false}
                  preventSnapRefocus={true}
                  months={window.innerWidth < 640 ? 1 : 2}
                  direction="horizontal"
                  rangeColors={["#2563eb"]}
                  showDateDisplay={false}
                />
              </Suspense>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {format(experienceDateRange[0].startDate, "MMM d, yyyy")} - {format(experienceDateRange[0].endDate, "MMM d, yyyy")}
                </span>
                <button
                  type="button"
                  onClick={() => setShowExperienceCalendar(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-xs cursor-pointer shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 6. Experiences Travellers Modal Portal */}
      {showExperienceTravellers &&
        createPortal(
          <div
            data-traveller-portal
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowExperienceTravellers(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-5 w-full"
              style={{ maxWidth: 380, margin: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Activity Travellers</h3>
                <button
                  type="button"
                  onClick={() => setShowExperienceTravellers(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Adults */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <span className="text-xs font-bold text-slate-800">Adults</span>
                  <span className="text-[10px] text-slate-400 block">Ages 13+</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExperienceAdults(Math.max(1, experienceAdults - 1))}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-black text-xs text-slate-900">{experienceAdults}</span>
                  <button
                    type="button"
                    onClick={() => setExperienceAdults(experienceAdults + 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-xs font-bold text-slate-800">Children</span>
                  <span className="text-[10px] text-slate-400 block">Ages 0 - 12</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExperienceChildren(Math.max(0, experienceChildren - 1))}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-black text-xs text-slate-900">{experienceChildren}</span>
                  <button
                    type="button"
                    onClick={() => setExperienceChildren(experienceChildren + 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs hover:bg-gray-100"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExperienceTravellers(false)}
                className="w-full mt-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-black text-xs cursor-pointer shadow-md"
              >
                Apply Travellers
              </button>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
