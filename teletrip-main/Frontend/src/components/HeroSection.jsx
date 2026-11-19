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

// Subtle floating animations for travel collage
const heroFloatStyles = `
@keyframes heroFloat1 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes heroFloat2 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(6px); }
}
@keyframes heroFloat3 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}
.animate-hero-float-1 {
  animation: heroFloat1 6s ease-in-out infinite;
}
.animate-hero-float-2 {
  animation: heroFloat2 7s ease-in-out infinite 1s;
}
.animate-hero-float-3 {
  animation: heroFloat3 8s ease-in-out infinite 0.5s;
}
`;

export default function HeroSection() {
  const navigate = useNavigate();

  // ONLY 3 CATEGORIES: 'stays' | 'transfers' | 'experiences'
  const [activeTab, setActiveTab] = useState("stays");

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

  // Scroll smoothly to search capsule when clicking "Start your search"
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

  // Exactly 3 Tabs as requested by user
  const tabs = [
    { id: "stays", label: "Stays", icon: "hotel", animation: "pulse" },
    { id: "transfers", label: "Transfers", icon: "car", animation: "glide" },
    { id: "experiences", label: "Experiences", icon: "experiences", animation: "bounce" },
  ];

  return (
    <section className="relative w-full bg-white overflow-hidden min-h-[100svh] lg:h-[100svh] lg:max-h-[960px] flex flex-col justify-between pt-20 sm:pt-24 lg:pt-22 pb-4 sm:pb-6 selection:bg-blue-600/10">
      <style>{heroFloatStyles}</style>

      {/* ── Soft Ambient Glow Mesh in Background ── */}
      <div className="absolute top-0 left-0 w-[480px] h-[480px] bg-gradient-to-br from-rose-100/50 via-pink-50/30 to-transparent rounded-full blur-3xl pointer-events-none -translate-x-1/4 -translate-y-1/4" />
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-4 right-10 w-[450px] h-[450px] bg-gradient-to-tl from-cyan-100/30 via-sky-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-between my-auto">
        
        {/* ── Top Half: Typography & Mosaic Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto pt-2 pb-4">
          
          {/* ════ LEFT COLUMN: Typography & CTA ════ */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-20">
            {/* Main Headline as per attached design */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[60px] font-extrabold text-slate-900 tracking-[-0.035em] leading-[1.06]"
            >
              Hotel, car,<br />
              <span className="text-slate-900">experiences</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base text-slate-500 font-normal mt-2.5 sm:mt-3.5 mb-5 sm:mb-6 max-w-md leading-relaxed"
            >
              With us, your trip is filled with amazing experiences.
            </motion.p>

            {/* Dark "Start your search" pill button */}
            <motion.button
              type="button"
              onClick={handleStartSearchClick}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-6 py-2.5 sm:py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer"
            >
              Start your search
            </motion.button>
          </div>

          {/* ════ RIGHT COLUMN: Asymmetric 3-Image Travel Mosaic ════ */}
          <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end z-10">
            <div className="grid grid-cols-12 gap-3 sm:gap-3.5 w-full max-w-[480px] lg:max-w-none items-center">
              
              {/* Left Sub-column: 2 Stacked Landscape Cards */}
              <div className="col-span-7 flex flex-col gap-3 sm:gap-3.5">
                {/* Top Image: Couple on pier over turquoise water towards water villas */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 h-32 sm:h-40 lg:h-44 animate-hero-float-1 bg-slate-100"
                >
                  <img
                    src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80"
                    alt="Couple on pier over turquoise water"
                    className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Maldives · Overwater Villas</span>
                  </div>
                </motion.div>

                {/* Bottom Image: Tropical Luxury Resort Swimming Pool */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.22 }}
                  className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 h-32 sm:h-40 lg:h-44 animate-hero-float-2 bg-slate-100"
                >
                  <img
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80"
                    alt="Tropical resort pool with sun umbrellas"
                    className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>Bali · Luxury Pool Resorts</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Sub-column: 1 Tall Portrait Card */}
              <div className="col-span-5 h-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 h-[268px] sm:h-[334px] lg:h-[370px] animate-hero-float-3 bg-slate-100"
                >
                  <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80"
                    alt="Mountain landscape with resort villas"
                    className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
                    <span className="truncate">Alpine Cabins & Peaks</span>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </div>

        {/* ════ BOTTOM BAR: 3 TABS & FLOATING CAPSULE SEARCH BAR (FITS ON 1 SCREEN) ════ */}
        <div ref={searchBarRef} className="mt-4 sm:mt-6 mb-2 max-w-5xl relative z-30 w-full">
          
          {/* ── 3 Category Tabs (Stays, Transfers, Experiences) ── */}
          <div className="flex items-center gap-6 sm:gap-8 mb-2 px-3 sm:px-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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

          {/* ── Floating Capsule Search Bar ── */}
          <div className="bg-white rounded-3xl sm:rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-1.5 sm:p-2 transition-all">
            
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-0">
              
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

                    {/* Instant Suggestions Dropdown */}
                    <AnimatePresence>
                      {isLocationOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full sm:bottom-auto sm:top-full left-0 mb-3 sm:mb-0 sm:mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden divide-y divide-slate-50"
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

                    {/* Dates Popover */}
                    <AnimatePresence>
                      {isDateOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full sm:bottom-auto sm:top-full left-0 sm:-left-12 mb-3 sm:mb-0 sm:mt-2 w-76 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50"
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

                    {/* Guests Popover */}
                    <AnimatePresence>
                      {isGuestsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full sm:bottom-auto sm:top-full right-0 mb-3 sm:mb-0 sm:mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3.5 z-50 space-y-3"
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

              {/* ── Circular Search Action Button ── */}
              <div className="p-1 sm:p-0 sm:pr-1 flex justify-end shrink-0">
                <button
                  type="submit"
                  aria-label="Search"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
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
