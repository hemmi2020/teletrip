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
import { format, addDays, parseISO, isValid } from "date-fns";
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

export default function HeaderSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  // Active Category Tab: 'stays' | 'transfers' | 'experiences'
  const [activeTab, setActiveTab] = useState("stays");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. STAYS SEARCH STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [searchQuery, setSearchQuery] = useState("Dubai, United Arab Emirates");
  const [selectedLocation, setSelectedLocation] = useState({
    name: "Dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    destinationCode: "DXB",
    type: "destination"
  });
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
  const locationRef = useRef(null);
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

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
  // 2. TRANSFERS SEARCH STATE
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
  // 3. EXPERIENCES SEARCH STATE
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

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Sync state with current URL params when opened
  useEffect(() => {
    if (!isOpen) return;
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    if (path.includes("/transfers") || params.get("from")) {
      setActiveTab("transfers");
      const fromParam = params.get("from");
      const toParam = params.get("to");
      if (fromParam) {
        setPickupQuery(fromParam);
        setSelectedPickup({ name: fromParam, code: params.get("fromCode"), type: params.get("fromType") || "ATLAS" });
      }
      if (toParam) {
        setDropoffQuery(toParam);
        setSelectedDropoff({ name: toParam, code: params.get("toCode"), type: params.get("toType") || "IATA" });
      }
      const tripTypeParam = params.get("tripType");
      if (tripTypeParam) setTripType(tripTypeParam);
    } else if (path.includes("/activities") || params.get("destination")) {
      setActiveTab("experiences");
      const destParam = params.get("destination");
      if (destParam) {
        setExperienceQuery(destParam);
        setSelectedExperienceLocation({ city: destParam, country: "", displayName: destParam });
      }
    } else {
      setActiveTab("stays");
      const city = params.get("city");
      const country = params.get("country");
      const hotelName = params.get("hotelName");
      const hotelCode = params.get("hotelCode");
      const destCode = params.get("destinationCode");

      if (hotelName) {
        setSearchQuery(hotelName);
        setSelectedHotelCode(hotelCode || null);
        setSelectedLocation({
          name: hotelName,
          city: city || "",
          country: country || "",
          destinationCode: destCode || "",
          type: "hotel"
        });
      } else if (city) {
        setSearchQuery(country ? `${city}, ${country}` : city);
        setSelectedHotelCode(null);
        setSelectedLocation({
          name: city,
          city: city,
          country: country || "",
          destinationCode: destCode || "",
          type: "destination"
        });
      }

      const checkInStr = params.get("checkIn");
      const checkOutStr = params.get("checkOut");
      if (checkInStr && checkOutStr) {
        try {
          const s = parseISO(checkInStr);
          const e = parseISO(checkOutStr);
          if (isValid(s) && isValid(e)) {
            setDateRange([{ startDate: s, endDate: e, key: "selection" }]);
          }
        } catch (err) {}
      }

      const roomConfigsStr = params.get("roomConfigs");
      if (roomConfigsStr) {
        try {
          const parsed = JSON.parse(decodeURIComponent(roomConfigsStr));
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRoomConfigs(parsed);
          }
        } catch (err) {}
      } else {
        const adultsParam = parseInt(params.get("adults"), 10);
        const childrenParam = parseInt(params.get("children"), 10);
        if (adultsParam) {
          const childAgesStr = params.get("childAges");
          const childAges = childAgesStr ? childAgesStr.split(",").map((a) => parseInt(a, 10)) : [];
          setRoomConfigs([{ adults: adultsParam, children: childrenParam || 0, childAges }]);
        }
      }
    }
  }, [isOpen]);

  // Outside click listener
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

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPREHENSIVE SEARCH SUBMISSION
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    onClose();

    // ─────────────────────────────────────────────────────────────────────────
    // TAB 1: STAYS SUBMISSION
    // ─────────────────────────────────────────────────────────────────────────
    if (activeTab === "stays") {
      const trimmedQuery = searchQuery.trim();
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
    { id: "stays", label: "Stays", icon: "hotel", animation: "pulse" },
    { id: "transfers", label: "Transfers", icon: "car", animation: "glide" },
    { id: "experiences", label: "Experiences", icon: "experiences", animation: "bounce" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[110]"
          />

          {/* Floating Search Container */}
          <div className="fixed top-20 sm:top-24 left-0 right-0 z-[120] flex justify-center px-3 sm:px-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -14 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-4xl bg-white rounded-3xl sm:rounded-4xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-slate-100 p-4 sm:p-6 overflow-visible"
            >
              {/* Header inside modal: Tabs & Close */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3 sm:gap-6">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-slate-900 text-white font-extrabold shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                        }`}
                      >
                        <AnimatedIcon
                          name={tab.icon}
                          animation={tab.animation}
                          size={14}
                          className={isActive ? "text-white" : "text-slate-400"}
                        />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  {/* Trip Type toggle if transfers */}
                  {activeTab === "transfers" && (
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-bold mr-2">
                      <button
                        type="button"
                        onClick={() => setTripType("one_way")}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all cursor-pointer ${
                          tripType === "one_way"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        One Way
                      </button>
                      <button
                        type="button"
                        onClick={() => setTripType("round_trip")}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all cursor-pointer ${
                          tripType === "round_trip"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Round Trip
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Capsule Search Form */}
              <div className="bg-slate-50/80 rounded-2xl sm:rounded-full border border-slate-200/80 p-1.5 sm:p-2 transition-all relative">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-0">
                  
                  {/* ── STAYS SEARCH ── */}
                  {activeTab === "stays" && (
                    <>
                      {/* Location */}
                      <div ref={locationRef} className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5 cursor-pointer rounded-xl sm:rounded-none hover:bg-white transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-blue-600 flex items-center justify-center shrink-0">
                          {selectedHotelCode ? (
                            <AnimatedIcon name="hotel" animation="pulse" size={15} className="text-emerald-600" />
                          ) : (
                            <AnimatedIcon name="location" animation="bounce" size={15} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0" onClick={() => setShowLocationDropdown(true)}>
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
                            placeholder="Where are you going?"
                            className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                          />
                        </div>

                        {showLocationDropdown && (
                          <div
                            className="absolute top-full left-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 z-[150] overflow-hidden divide-y divide-slate-100"
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
                            <div className="max-h-60 overflow-y-auto">
                              {isLoadingLocations && filteredLocations.length === 0 && hotelSuggestions.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                  <span>Searching destinations...</span>
                                </div>
                              ) : (
                                <>
                                  {filteredLocations.filter((l) => l.type !== "hotel").map((loc, i) => (
                                    <div
                                      key={`m-loc-${i}`}
                                      onClick={() => handleLocationSelect(loc)}
                                      className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50 last:border-0"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                                        <div className="truncate">
                                          <div className="font-extrabold text-xs text-slate-900 truncate">{loc.city || loc.name}</div>
                                          <div className="text-[10px] text-slate-400 truncate">{loc.country}</div>
                                        </div>
                                      </div>
                                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">City</span>
                                    </div>
                                  ))}
                                  {hotelSuggestions.map((hotel, idx) => (
                                    <div
                                      key={`m-h-${idx}`}
                                      onClick={() => handleHotelSelect(hotel)}
                                      className="px-3 py-2 hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50 last:border-0"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <div className="truncate">
                                          <div className="font-extrabold text-xs text-slate-900 truncate">{hotel.name}</div>
                                          <div className="text-[10px] text-slate-400 truncate">{hotel.zoneName || hotel.destinationName || ""}</div>
                                        </div>
                                      </div>
                                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">Hotel</span>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      {/* Dates */}
                      <div
                        onClick={() => setShowCalendar(true)}
                        className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5 cursor-pointer rounded-xl sm:rounded-none hover:bg-white transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-blue-600 flex items-center justify-center shrink-0">
                          <AnimatedIcon name="time" animation="pulse" size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                            {calculateNights()} Nights
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                            {format(dateRange[0].startDate, "MMM d")} - {format(dateRange[0].endDate, "MMM d")}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      {/* Guests */}
                      <div
                        onClick={() => setShowTravellerDropdown(true)}
                        className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5 cursor-pointer rounded-xl sm:rounded-none hover:bg-white transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-blue-600 flex items-center justify-center shrink-0">
                          <AnimatedIcon name="users" animation="pulse" size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                            Guests
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                            {getTravellerSummary()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── TRANSFERS SEARCH ── */}
                  {activeTab === "transfers" && (
                    <>
                      {/* Pickup */}
                      <div ref={pickupRef} className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5 rounded-xl sm:rounded-none hover:bg-white transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-blue-600 flex items-center justify-center shrink-0">
                          <AnimatedIcon name="car" animation="glide" size={15} />
                        </div>
                        <div className="flex-1 min-w-0" onClick={() => setShowPickupDropdown(true)}>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">Pickup</span>
                          <input
                            type="text"
                            value={pickupQuery}
                            onChange={(e) => {
                              setPickupQuery(e.target.value);
                              setSelectedPickup(null);
                              setShowPickupDropdown(true);
                            }}
                            onFocus={() => setShowPickupDropdown(true)}
                            placeholder="Airport or hotel..."
                            className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                          />
                        </div>

                        {showPickupDropdown && filteredPickupLocations.length > 0 && (
                          <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-[150] max-h-56 overflow-y-auto">
                            {filteredPickupLocations.map((loc, i) => (
                              <div
                                key={`mpick-${i}`}
                                onClick={() => {
                                  setSelectedPickup(loc);
                                  setPickupQuery(loc.name);
                                  setShowPickupDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center gap-2 border-b border-slate-50 last:border-0"
                              >
                                <Plane className="w-4 h-4 text-blue-600 shrink-0" />
                                <div className="truncate">
                                  <div className="font-extrabold text-xs text-slate-900 truncate">{loc.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{loc.type || "Airport"}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      {/* Dropoff */}
                      <div ref={dropoffRef} className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5 rounded-xl sm:rounded-none hover:bg-white transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-blue-600 flex items-center justify-center shrink-0">
                          <Navigation className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0" onClick={() => setShowDropoffDropdown(true)}>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">Dropoff</span>
                          <input
                            type="text"
                            value={dropoffQuery}
                            onChange={(e) => {
                              setDropoffQuery(e.target.value);
                              setSelectedDropoff(null);
                              setShowDropoffDropdown(true);
                            }}
                            onFocus={() => setShowDropoffDropdown(true)}
                            placeholder="Destination or hotel..."
                            className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                          />
                        </div>

                        {showDropoffDropdown && filteredDropoffLocations.length > 0 && (
                          <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-[150] max-h-56 overflow-y-auto">
                            {filteredDropoffLocations.map((loc, i) => (
                              <div
                                key={`mdrop-${i}`}
                                onClick={() => {
                                  setSelectedDropoff(loc);
                                  setDropoffQuery(loc.name);
                                  setShowDropoffDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center gap-2 border-b border-slate-50 last:border-0"
                              >
                                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                                <div className="truncate">
                                  <div className="font-extrabold text-xs text-slate-900 truncate">{loc.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{loc.type || "Hotel"}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      {/* Date & Pax */}
                      <div
                        onClick={() => setShowTransferCalendar(true)}
                        className="relative px-3 py-1.5 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-xs font-extrabold text-slate-900">
                          {format(transferDateRange[0].startDate, "MMM d")} · {transferAdults + transferChildren + transferInfants} Pax
                        </span>
                      </div>
                    </>
                  )}

                  {/* ── EXPERIENCES SEARCH ── */}
                  {activeTab === "experiences" && (
                    <>
                      <div className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5 rounded-xl sm:rounded-none hover:bg-white transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-purple-600 flex items-center justify-center shrink-0">
                          <AnimatedIcon name="experiences" animation="bounce" size={15} />
                        </div>
                        <div className="flex-1 min-w-0" onClick={() => setShowExperienceDropdown(true)}>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">Tour / City</span>
                          <input
                            type="text"
                            value={experienceQuery}
                            onChange={(e) => {
                              setExperienceQuery(e.target.value);
                              setSelectedExperienceLocation(null);
                              setShowExperienceDropdown(true);
                            }}
                            onFocus={() => setShowExperienceDropdown(true)}
                            placeholder="e.g. Dubai Safari, Desert Tour..."
                            className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                          />
                        </div>

                        {showExperienceDropdown && filteredExperiences.length > 0 && (
                          <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-[150] max-h-56 overflow-y-auto">
                            {filteredExperiences.map((dest, i) => (
                              <div
                                key={`mexp-${i}`}
                                onClick={() => {
                                  setSelectedExperienceLocation(dest);
                                  setExperienceQuery(dest.displayName || `${dest.name}, ${dest.country}`);
                                  setShowExperienceDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-purple-50/70 cursor-pointer flex items-center gap-2 border-b border-slate-50 last:border-0"
                              >
                                <Compass className="w-4 h-4 text-purple-600 shrink-0" />
                                <div className="truncate">
                                  <div className="font-extrabold text-xs text-slate-900 truncate">{dest.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{dest.country}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      <div
                        onClick={() => setShowExperienceCalendar(true)}
                        className="relative px-3 py-1.5 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-xs font-extrabold text-slate-900">
                          {format(experienceDateRange[0].startDate, "MMM d")} · {experienceAdults + experienceChildren} Pax
                        </span>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="p-1 sm:p-0 sm:pr-1 flex justify-end shrink-0">
                    <button
                      type="submit"
                      aria-label="Search"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              PORTALS INSIDE MODAL
          ═════════════════════════════════════════════════════════════════ */}

          {/* Stays Calendar Portal */}
          {showCalendar &&
            createPortal(
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.4)"
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowCalendar(false);
                }}
              >
                <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[85vh] w-[calc(100vw-24px)] sm:w-[680px] md:w-[720px] max-w-[720px] mx-auto">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                    <h3 className="text-sm font-extrabold text-slate-900">Select Travel Dates ({calculateNights()}n)</h3>
                    <button type="button" onClick={() => setShowCalendar(false)}>
                      <X size={18} className="text-slate-400" />
                    </button>
                  </div>
                  <Suspense fallback={<div className="p-6 text-center text-xs text-slate-400">Loading calendar...</div>}>
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
                      months={window.innerWidth < 640 ? 1 : 2}
                      direction="horizontal"
                      rangeColors={["#2563eb"]}
                      showDateDisplay={false}
                    />
                  </Suspense>
                  <div className="pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* Stays Multi-Room Portal */}
          {showTravellerDropdown &&
            createPortal(
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.4)"
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowTravellerDropdown(false);
                }}
              >
                <div
                  className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-5 w-full max-h-[85vh] overflow-y-auto"
                  style={{ maxWidth: 420, margin: 16 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Rooms & Guests</h3>
                    <button type="button" onClick={() => setShowTravellerDropdown(false)}>
                      <X size={18} className="text-slate-400" />
                    </button>
                  </div>

                  {roomConfigs.map((room, roomIdx) => (
                    <div key={roomIdx} className={`${roomIdx > 0 ? "mt-4 pt-4 border-t border-gray-100" : ""}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-900 uppercase">Room {roomIdx + 1}</span>
                        {roomConfigs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoom(roomIdx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Adults */}
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-xs font-bold text-slate-800">Adults (18+)</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateRoom(roomIdx, "adults", Math.max(1, room.adults - 1))}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-black text-xs">{room.adults}</span>
                          <button
                            type="button"
                            onClick={() => updateRoom(roomIdx, "adults", Math.min(6, room.adults + 1))}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-xs font-bold text-slate-800">Children (0-17)</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateRoom(roomIdx, "children", room.children - 1)}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-black text-xs">{room.children}</span>
                          <button
                            type="button"
                            onClick={() => updateRoom(roomIdx, "children", room.children + 1)}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Child Ages */}
                      {room.children > 0 && (
                        <div className="mt-2 pt-2 bg-slate-50 p-2 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ages at check-out</p>
                          <div className="grid grid-cols-2 gap-2">
                            {room.childAges.map((age, childIdx) => (
                              <select
                                key={childIdx}
                                value={age}
                                onChange={(e) => updateChildAge(roomIdx, childIdx, e.target.value)}
                                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              >
                                <option value={0}>Under 1</option>
                                {[...Array(17)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>
                                    {i + 1} year{i + 1 > 1 ? "s" : ""}
                                  </option>
                                ))}
                              </select>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {roomConfigs.length < 6 && (
                    <button
                      type="button"
                      onClick={addRoom}
                      className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-bold"
                    >
                      <Plus size={14} /> Add another room
                    </button>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <label className="flex items-center gap-2 p-2 bg-amber-50/70 border border-amber-200/50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={luxuryOnly}
                        onChange={(e) => setLuxuryOnly(e.target.checked)}
                        className="rounded text-amber-600 w-4 h-4 cursor-pointer"
                      />
                      <Crown size={14} className="text-amber-600 shrink-0" />
                      <span className="text-xs font-extrabold text-amber-900">Luxury Collection 5-Star Only</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTravellerDropdown(false)}
                    className="w-full mt-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs"
                  >
                    Apply Guests
                  </button>
                </div>
              </div>,
              document.body
            )}

          {/* Transfers Calendar Portal */}
          {showTransferCalendar &&
            createPortal(
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.4)"
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowTransferCalendar(false);
                }}
              >
                <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[85vh] w-[calc(100vw-24px)] sm:w-[680px] md:w-[720px] max-w-[720px] mx-auto">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                    <h3 className="text-sm font-extrabold text-slate-900">Select Transfer Date</h3>
                    <button type="button" onClick={() => setShowTransferCalendar(false)}>
                      <X size={18} className="text-slate-400" />
                    </button>
                  </div>
                  <Suspense fallback={<div className="p-6 text-center text-xs text-slate-400">Loading calendar...</div>}>
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
                  <div className="pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowTransferCalendar(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* Experiences Calendar Portal */}
          {showExperienceCalendar &&
            createPortal(
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.4)"
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowExperienceCalendar(false);
                }}
              >
                <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[85vh] w-[calc(100vw-24px)] sm:w-[680px] md:w-[720px] max-w-[720px] mx-auto">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                    <h3 className="text-sm font-extrabold text-slate-900">Select Activity Dates</h3>
                    <button type="button" onClick={() => setShowExperienceCalendar(false)}>
                      <X size={18} className="text-slate-400" />
                    </button>
                  </div>
                  <Suspense fallback={<div className="p-6 text-center text-xs text-slate-400">Loading calendar...</div>}>
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
                  <div className="pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowExperienceCalendar(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
        </>
      )}
    </AnimatePresence>
  );
}
