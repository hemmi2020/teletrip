import React, { useState, useEffect, useRef } from "react";
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
  Sparkles
} from "lucide-react";
import { format, addDays } from "date-fns";
import AnimatedIcon from "./common/AnimatedIcon";
import {
  TOP_DESTINATIONS,
  TOP_HOTELS,
  getInstantSuggestions
} from "../utils/instantSearchData";

// Curated Category Data: Dynamic Taglines & High-Resolution Sliding Visuals
const TAB_DATA = {
  stays: {
    label: "Stays",
    icon: "hotel",
    animation: "pulse",
    headlinePrimary: "Hotel, resorts,",
    headlineSecondary: "luxury stays",
    subtitle: "Compare 250,000+ handpicked hotels & 5-star resorts with guaranteed direct B2B net rates.",
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

  const currentTab = TAB_DATA[activeTab];

  // Monitor scroll: Collapse search inputs toward the blue button as it approaches and reaches the header pill
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

  // Preload tab images for buttery-smooth transitions
  useEffect(() => {
    currentTab.images.forEach((img) => {
      const pic = new Image();
      pic.src = img.url;
    });
  }, [activeTab, currentTab.images]);

  // Search Fields — Stays & Experiences
  const [locationQuery, setLocationQuery] = useState("Dubai, United Arab Emirates");
  const [selectedDestinationCode, setSelectedDestinationCode] = useState("DXB");
  const [selectedHotelCode, setSelectedHotelCode] = useState(null);

  // Search Fields — Transfers
  const [pickupLocation, setPickupLocation] = useState("Dubai International Airport (DXB)");
  const [dropoffLocation, setDropoffLocation] = useState("Downtown Dubai / Palm Jumeirah");

  // Dates
  const [checkInDate, setCheckInDate] = useState(() => addDays(new Date(), 2));
  const [checkOutDate, setCheckOutDate] = useState(() => addDays(new Date(), 5));

  // Occupancies
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  // Popover States
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  // Autocomplete suggestions
  const [filteredDestinations, setFilteredDestinations] = useState(TOP_DESTINATIONS.slice(0, 5));
  const [filteredHotels, setFilteredHotels] = useState(TOP_HOTELS.slice(0, 4));

  const locationRef = useRef(null);
  const dateRef = useRef(null);
  const guestsRef = useRef(null);
  const searchBarRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setIsLocationOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setIsDateOpen(false);
      }
      if (guestsRef.current && !guestsRef.current.contains(e.target)) {
        setIsGuestsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Location Search Input
  const handleLocationChange = (val) => {
    setLocationQuery(val);
    setSelectedHotelCode(null);
    if (!val || val.trim().length === 0) {
      setFilteredDestinations(TOP_DESTINATIONS.slice(0, 5));
      setFilteredHotels(TOP_HOTELS.slice(0, 4));
      return;
    }
    const res = getInstantSuggestions(val);
    setFilteredDestinations(res.locations || []);
    setFilteredHotels(res.hotels || []);
  };

  // Scroll / focus search capsule when clicking CTA button
  const handleStartSearchClick = () => {
    setIsLocationOpen(true);
    if (searchBarRef.current) {
      searchBarRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Execute Search
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    if (activeTab === "stays") {
      const city = locationQuery.split(",")[0].trim() || "Dubai";
      const checkInStr = format(checkInDate, "yyyy-MM-dd");
      const checkOutStr = format(checkOutDate, "yyyy-MM-dd");
      let url = `/hotel-search-results?city=${encodeURIComponent(city)}&checkIn=${checkInStr}&checkOut=${checkOutStr}&adults=${adults}&children=${children}&rooms=${rooms}`;
      if (selectedHotelCode) {
        url += `&hotelCode=${selectedHotelCode}`;
      }
      navigate(url);
    } else if (activeTab === "transfers") {
      const dateStr = format(checkInDate, "yyyy-MM-dd");
      navigate(`/transfers?from=${encodeURIComponent(pickupLocation)}&to=${encodeURIComponent(dropoffLocation)}&date=${dateStr}&passengers=${adults + children}`);
    } else if (activeTab === "experiences") {
      const city = locationQuery.split(",")[0].trim() || "Dubai";
      const dateStr = format(checkInDate, "yyyy-MM-dd");
      navigate(`/activity-search-results?destination=${encodeURIComponent(city)}&date=${dateStr}&adults=${adults}`);
    }
  };

  const tabs = [
    { id: "stays", ...TAB_DATA.stays },
    { id: "transfers", ...TAB_DATA.transfers },
    { id: "experiences", ...TAB_DATA.experiences },
  ];

  const currentImage = currentTab.images[currentSlide] || currentTab.images[0];

  // Sliding fade transition variants for buttery-smooth cross-slide
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "7%" : "-7%",
      opacity: 0,
      scale: 1.025,
    }),
    center: {
      x: "0%",
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "tween", duration: 1.15, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.95, ease: "easeInOut" },
        scale: { duration: 1.25, ease: [0.16, 1, 0.3, 1] },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-5%" : "5%",
      opacity: 0,
      scale: 0.985,
      transition: {
        x: { type: "tween", duration: 1.05, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.85, ease: "easeInOut" },
        scale: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
      },
    }),
  };

  return (
    <section className="relative z-30 w-full bg-white min-h-[100svh] lg:h-[100svh] lg:max-h-[960px] flex flex-col justify-between pt-20 sm:pt-22 lg:pt-20 pb-4 sm:pb-6 selection:bg-blue-600/10">
      
      {/* ══════════════════════════════════════════════════════════════════════════════
          FULL-WIDTH SLIDING PICTURE WITH LEFT FADE-TO-ZERO GRADIENT (STARTS FROM MID)
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        
        {/* Full-width sliding picture container with smooth mid-to-zero left fade mask */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.02) 10%, rgba(0,0,0,0.08) 18%, rgba(0,0,0,0.22) 26%, rgba(0,0,0,0.45) 34%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.95) 48%, #000000 52%, #000000 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.02) 10%, rgba(0,0,0,0.08) 18%, rgba(0,0,0,0.22) 26%, rgba(0,0,0,0.45) 34%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.95) 48%, #000000 52%, #000000 100%)"
          }}
        >
          {/* True Sliding Fade: Simultaneous crossfade & directional slide without blank gaps */}
          <AnimatePresence initial={false} custom={slideDirection}>
            <motion.div
              key={`${activeTab}-${currentSlide}`}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={currentImage.url}
                alt=""
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Soft Ambient Fade Overlay on Left (Ends at Mid 52%, leaving Right 100% Pure Photo) ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 20%, rgba(255,255,255,0.6) 35%, rgba(255,255,255,0.15) 45%, transparent 52%), " +
              "linear-gradient(to top, rgba(255,255,255,0.7) 0%, transparent 16%)"
          }}
        />

        {/* Minimalist Slide Navigation Dots at bottom right */}
        <div className="hidden lg:flex absolute bottom-8 right-8 z-20 pointer-events-auto items-center gap-1.5 bg-slate-900/35 hover:bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-full transition-all">
          {currentTab.images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSlideDirection(i >= currentSlide ? 1 : -1);
                setCurrentSlide(i);
              }}
              aria-label={`Slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === currentSlide ? "w-6 h-1.5 bg-white shadow-sm" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/80"
              }`}
            />
          ))}
        </div>

      </div>

      {/* ── Main Interactive Content (Guaranteed to Fit on 1 Screen) ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-between my-auto z-20">
        
        {/* ── Top Half: Dynamic Typography & CTA (Changes with Tab) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto pt-2 pb-2">
          
          <div className="lg:col-span-7 flex flex-col items-start text-left z-20 max-w-xl">
            
            {/* Dynamic Headline & Subtext with Smooth Sliding Fade */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[60px] font-extrabold text-slate-900 tracking-[-0.035em] leading-[1.06]">
                  {currentTab.headlinePrimary}<br />
                  <span className="text-slate-900">{currentTab.headlineSecondary}</span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-500 font-normal mt-2.5 sm:mt-3.5 mb-5 sm:mb-6 max-w-md leading-relaxed">
                  {currentTab.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dark Action Pill Button */}
            <motion.button
              type="button"
              onClick={handleStartSearchClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-6 py-2.5 sm:py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer"
            >
              {currentTab.cta}
            </motion.button>

          </div>

        </div>

        {/* ════ BOTTOM BAR: 3 TABS & FLOATING CAPSULE SEARCH BAR (HIGH Z-INDEX) ════ */}
        <div
          ref={searchBarRef}
          className="mt-4 sm:mt-6 mb-2 max-w-5xl relative z-40 w-full search-form-section"
        >
          
          {/* ── 3 Category Tabs (Stays, Transfers, Experiences) ── */}
          <div
            className="flex items-center gap-6 sm:gap-8 mb-2 px-3 sm:px-4 transition-all duration-200"
            style={{
              opacity: Math.max(0, 1 - collapseProgress * 1.5),
              transform: `translateY(${-collapseProgress * 8}px)`,
              pointerEvents: collapseProgress > 0.4 ? "none" : "auto",
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (activeTab !== tab.id) {
                      setSlideDirection(1);
                      setActiveTab(tab.id);
                      setCurrentSlide(0);
                    }
                  }}
                  className={`inline-flex items-center gap-2 py-1.5 text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-slate-900 font-extrabold"
                      : "text-slate-500 hover:text-slate-900 font-medium"
                  }`}
                >
                  {/* Dot indicator matching attached screenshot */}
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                  )}
                  <AnimatedIcon
                    name={tab.icon}
                    animation={tab.animation}
                    size={14}
                    className={isActive ? "text-blue-600" : "text-slate-400"}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Floating Capsule Search Bar (Collapses as it approaches header) ── */}
          <div
            className="rounded-3xl sm:rounded-full p-1.5 sm:p-2 transition-all duration-200 relative z-40"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${Math.max(0, 1 - collapseProgress)})`,
              boxShadow: collapseProgress > 0.8
                ? "none"
                : `0 12px 45px rgba(0,0,0, ${0.09 * (1 - collapseProgress)})`,
              borderColor: `rgba(241, 245, 249, ${Math.max(0, 1 - collapseProgress)})`,
              borderWidth: 1,
            }}
          >
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-0 justify-between">
              
              {/* Input Fields (Slide right and collapse toward the blue search button) */}
              <div
                className="flex flex-col sm:flex-row sm:items-center flex-1 transition-all duration-200"
                style={{
                  opacity: Math.max(0, 1 - collapseProgress * 1.3),
                  transform: `translateX(${collapseProgress * 24}px)`,
                  pointerEvents: collapseProgress > 0.4 ? "none" : "auto",
                }}
              >
              
              {/* ── STAYS SEARCH VIEW ── */}
              {activeTab === "stays" && (
                <>
                  {/* Segment 1: Location */}
                  <div ref={locationRef} className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                      <AnimatedIcon name="location" animation="bounce" size={16} />
                    </div>
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => {
                        setIsLocationOpen(!isLocationOpen);
                        setIsDateOpen(false);
                        setIsGuestsOpen(false);
                      }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                        Location
                      </span>
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => {
                          setIsLocationOpen(true);
                          setIsDateOpen(false);
                          setIsGuestsOpen(false);
                        }}
                        placeholder="Where are you going?"
                        className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                      />
                    </div>

                    {/* Instant Suggestions Dropdown (Opens on top with z-[100]) */}
                    <AnimatePresence>
                      {isLocationOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 z-[100] overflow-hidden divide-y divide-slate-50"
                        >
                          <div className="p-2.5 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>Top Destinations & Hotels</span>
                            <button
                              type="button"
                              onClick={() => setIsLocationOpen(false)}
                              className="hover:text-slate-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                            {filteredDestinations.map((dest, i) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setLocationQuery(dest.displayName || `${dest.name}, ${dest.country}`);
                                  setSelectedDestinationCode(dest.destinationCode || "DXB");
                                  setSelectedHotelCode(null);
                                  setIsLocationOpen(false);
                                }}
                                className="p-2.5 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                                  <div className="truncate">
                                    <div className="font-extrabold text-xs text-slate-900 truncate">{dest.name}</div>
                                    <div className="text-[10px] text-slate-400 truncate">{dest.country}</div>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                                  City
                                </span>
                              </div>
                            ))}

                            {filteredHotels.map((hotel, idx) => (
                              <div
                                key={`h-${idx}`}
                                onClick={() => {
                                  setLocationQuery(hotel.name);
                                  setSelectedDestinationCode(hotel.destinationCode || "DXB");
                                  setSelectedHotelCode(hotel.hotelbedsCode || hotel.code || null);
                                  setIsLocationOpen(false);
                                }}
                                className="p-2.5 hover:bg-amber-50/60 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <AnimatedIcon name="crown" animation="pulse" size={14} className="text-amber-500 shrink-0" />
                                  <div className="truncate">
                                    <div className="font-extrabold text-xs text-slate-900 truncate">{hotel.name}</div>
                                    <div className="text-[10px] text-slate-400 truncate">{hotel.city} · 5 Stars</div>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                                  Hotel
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                  {/* Segment 2: Dates */}
                  <div ref={dateRef} className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                      <AnimatedIcon name="time" animation="pulse" size={16} />
                    </div>
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => {
                        setIsDateOpen(!isDateOpen);
                        setIsLocationOpen(false);
                        setIsGuestsOpen(false);
                      }}
                    >
                      <span className="text-[11px] font-bold text-slate-900 block leading-tight truncate">
                        {format(checkInDate, "MMM d")} - {format(checkOutDate, "MMM d")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal block leading-none mt-0.5">
                        Check in - Check out
                      </span>
                    </div>

                    {/* Dates Popover (z-[100]) */}
                    <AnimatePresence>
                      {isDateOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 sm:-left-12 mt-3 w-76 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 p-4 z-[100]"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                            <span className="text-xs font-extrabold text-slate-900">Select Dates</span>
                            <button
                              type="button"
                              onClick={() => setIsDateOpen(false)}
                              className="hover:text-slate-700"
                            >
                              <X className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                                Check-in Date
                              </label>
                              <input
                                type="date"
                                value={format(checkInDate, "yyyy-MM-dd")}
                                min={format(new Date(), "yyyy-MM-dd")}
                                onChange={(e) => {
                                  const d = new Date(e.target.value);
                                  if (!isNaN(d.getTime())) {
                                    setCheckInDate(d);
                                    if (d >= checkOutDate) {
                                      setCheckOutDate(addDays(d, 3));
                                    }
                                  }
                                }}
                                className="w-full text-xs font-bold text-slate-900 bg-slate-50 p-2 rounded-xl border border-slate-200 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                                Check-out Date
                              </label>
                              <input
                                type="date"
                                value={format(checkOutDate, "yyyy-MM-dd")}
                                min={format(addDays(checkInDate, 1), "yyyy-MM-dd")}
                                onChange={(e) => {
                                  const d = new Date(e.target.value);
                                  if (!isNaN(d.getTime())) setCheckOutDate(d);
                                }}
                                className="w-full text-xs font-bold text-slate-900 bg-slate-50 p-2 rounded-xl border border-slate-200 focus:outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsDateOpen(false)}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                  {/* Segment 3: Guests */}
                  <div ref={guestsRef} className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                      <AnimatedIcon name="users" animation="pulse" size={16} />
                    </div>
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => {
                        setIsGuestsOpen(!isGuestsOpen);
                        setIsLocationOpen(false);
                        setIsDateOpen(false);
                      }}
                    >
                      <span className="text-[11px] font-bold text-slate-900 block leading-tight truncate">
                        {adults + children} Guest{(adults + children) !== 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal block leading-none mt-0.5">
                        Guests · {rooms} Room{rooms !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Guests Popover (z-[100]) */}
                    <AnimatePresence>
                      {isGuestsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 p-3.5 z-[100] space-y-3"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-extrabold text-slate-900">Rooms & Guests</span>
                            <button
                              type="button"
                              onClick={() => setIsGuestsOpen(false)}
                              className="hover:text-slate-700"
                            >
                              <X className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>

                          {/* Rooms Control */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Rooms</div>
                              <div className="text-[10px] text-slate-400">Total units</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setRooms(Math.max(1, rooms - 1))}
                                className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-xs"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-bold text-xs">{rooms}</span>
                              <button
                                type="button"
                                onClick={() => setRooms(rooms + 1)}
                                className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Adults Control */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Adults</div>
                              <div className="text-[10px] text-slate-400">Ages 18+</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setAdults(Math.max(1, adults - 1))}
                                className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-xs"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-bold text-xs">{adults}</span>
                              <button
                                type="button"
                                onClick={() => setAdults(adults + 1)}
                                className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Children Control */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Children</div>
                              <div className="text-[10px] text-slate-400">Ages 0-17</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setChildren(Math.max(0, children - 1))}
                                className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-xs"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-bold text-xs">{children}</span>
                              <button
                                type="button"
                                onClick={() => setChildren(children + 1)}
                                className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsGuestsOpen(false)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Apply
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* ── TRANSFERS SEARCH VIEW ── */}
              {activeTab === "transfers" && (
                <>
                  {/* Pickup */}
                  <div className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 group hover:bg-slate-50/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                      <AnimatedIcon name="car" animation="glide" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                        Pickup Location
                      </span>
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        placeholder="Airport, station or hotel..."
                        className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                      />
                    </div>
                  </div>

                  <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                  {/* Dropoff */}
                  <div className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 group hover:bg-slate-50/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                        Dropoff Location
                      </span>
                      <input
                        type="text"
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        placeholder="Hotel or destination..."
                        className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                      />
                    </div>
                  </div>

                  <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                  {/* Date */}
                  <div className="relative px-4 py-1.5 sm:py-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                      <AnimatedIcon name="time" animation="pulse" size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                        Transfer Date
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {format(checkInDate, "MMM d")} · {adults} Pax
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* ── EXPERIENCES SEARCH VIEW ── */}
              {activeTab === "experiences" && (
                <>
                  {/* Destination */}
                  <div className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 group hover:bg-slate-50/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 flex items-center justify-center shrink-0">
                      <AnimatedIcon name="experiences" animation="bounce" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                        Tour or Destination
                      </span>
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        placeholder="e.g. Dubai Safari, Desert Tour..."
                        className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                      />
                    </div>
                  </div>

                  <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                  {/* Date */}
                  <div className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                      <AnimatedIcon name="time" animation="pulse" size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                        Activity Date
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {format(checkInDate, "MMM d")} · {adults} Travellers
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Circular Search Action Button (Transitions smoothly into header pill on reach) ── */}
            <div className="p-1 sm:p-0 sm:pr-1 flex justify-end shrink-0">
              <button
                type="submit"
                aria-label="Search"
                style={{
                  opacity: reachedHeader ? 0 : 1,
                  transform: reachedHeader ? "scale(0.85) translateY(-6px)" : "scale(1) translateY(0)",
                  transition: "opacity 0.15s ease, transform 0.15s ease",
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
