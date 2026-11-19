import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  X,
  Building2,
  Navigation,
  ArrowRight
} from "lucide-react";
import { format, addDays } from "date-fns";
import AnimatedIcon from "./common/AnimatedIcon";
import {
  TOP_DESTINATIONS,
  TOP_HOTELS,
  getInstantSuggestions
} from "../utils/instantSearchData";

export default function HeaderSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  // Active Category: 'stays' | 'transfers' | 'experiences'
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

  // Popover States inside modal
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  // Autocomplete suggestions
  const [filteredDestinations, setFilteredDestinations] = useState(TOP_DESTINATIONS.slice(0, 5));
  const [filteredHotels, setFilteredHotels] = useState(TOP_HOTELS.slice(0, 4));

  const modalRef = useRef(null);
  const locationRef = useRef(null);
  const dateRef = useRef(null);
  const guestsRef = useRef(null);

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

  // Autocomplete filtering
  const handleLocationChange = (text) => {
    setLocationQuery(text);
    setIsLocationOpen(true);
    if (!text.trim()) {
      setFilteredDestinations(TOP_DESTINATIONS.slice(0, 5));
      setFilteredHotels(TOP_HOTELS.slice(0, 4));
      return;
    }
    const results = getInstantSuggestions(text, 6);
    setFilteredDestinations(results.destinations);
    setFilteredHotels(results.hotels);
  };

  // Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onClose();

    if (activeTab === "stays") {
      const checkInStr = format(checkInDate, "yyyy-MM-dd");
      const checkOutStr = format(checkOutDate, "yyyy-MM-dd");
      const params = new URLSearchParams({
        destination: locationQuery,
        destinationCode: selectedDestinationCode || "DXB",
        checkIn: checkInStr,
        checkOut: checkOutStr,
        rooms: String(rooms),
        adults: String(adults),
        children: String(children),
      });
      if (selectedHotelCode) {
        params.set("hotelCode", selectedHotelCode);
      }
      navigate(`/hotel-search-results?${params.toString()}`);
    } else if (activeTab === "transfers") {
      const dateStr = format(checkInDate, "yyyy-MM-dd");
      navigate(
        `/transfers?from=${encodeURIComponent(pickupLocation)}&to=${encodeURIComponent(
          dropoffLocation
        )}&date=${dateStr}&passengers=${adults + children}`
      );
    } else if (activeTab === "experiences") {
      const city = locationQuery.split(",")[0].trim() || "Dubai";
      const dateStr = format(checkInDate, "yyyy-MM-dd");
      navigate(
        `/activity-search-results?destination=${encodeURIComponent(city)}&date=${dateStr}&adults=${adults}`
      );
    }
  };

  const tabs = [
    { id: "stays", label: "Stays", icon: "hotel", animation: "pulse" },
    { id: "transfers", label: "Transfers", icon: "car", animation: "glide" },
    { id: "experiences", label: "Experiences", icon: "experiences", animation: "bounce" },
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
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs z-[110]"
          />

          {/* Floating Search Container */}
          <div className="fixed top-20 sm:top-24 left-0 right-0 z-[120] flex justify-center px-3 sm:px-6 pointer-events-none">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -14 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-4xl bg-white rounded-3xl sm:rounded-4xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-slate-100 p-4 sm:p-6 overflow-visible"
            >
              {/* Header inside modal: Tabs & Close */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                {/* Category Tabs */}
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

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
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
                          <AnimatedIcon name="location" animation="bounce" size={15} />
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
                            Destination
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

                        {/* Location Dropdown */}
                        <AnimatePresence>
                          {isLocationOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 z-[150] overflow-hidden divide-y divide-slate-50"
                            >
                              <div className="p-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                <span>Popular Destinations & Hotels</span>
                                <button type="button" onClick={() => setIsLocationOpen(false)} className="hover:text-slate-700">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="max-h-56 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                                {filteredDestinations.map((dest, i) => (
                                  <div
                                    key={i}
                                    onClick={() => {
                                      setLocationQuery(dest.displayName || `${dest.name}, ${dest.country}`);
                                      setSelectedDestinationCode(dest.destinationCode || "DXB");
                                      setSelectedHotelCode(null);
                                      setIsLocationOpen(false);
                                    }}
                                    className="p-2.5 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                                      <div className="truncate">
                                        <div className="font-extrabold text-xs text-slate-900 truncate">{dest.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{dest.country}</div>
                                      </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">City</span>
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
                                    className="p-2.5 hover:bg-amber-50/60 cursor-pointer flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <AnimatedIcon name="crown" animation="pulse" size={14} className="text-amber-500 shrink-0" />
                                      <div className="truncate">
                                        <div className="font-extrabold text-xs text-slate-900 truncate">{hotel.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{hotel.city}</div>
                                      </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">Hotel</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      {/* Dates */}
                      <div ref={dateRef} className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5 cursor-pointer rounded-xl sm:rounded-none hover:bg-white transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-blue-600 flex items-center justify-center shrink-0">
                          <AnimatedIcon name="time" animation="pulse" size={15} />
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
                              className="absolute top-full left-0 sm:-left-8 mt-3 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 p-4 z-[150] space-y-3"
                            >
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                <span className="text-xs font-extrabold text-slate-900">Select Dates</span>
                                <button type="button" onClick={() => setIsDateOpen(false)} className="hover:text-slate-700">
                                  <X className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Check-in</label>
                                <input
                                  type="date"
                                  value={format(checkInDate, "yyyy-MM-dd")}
                                  min={format(new Date(), "yyyy-MM-dd")}
                                  onChange={(e) => {
                                    const d = new Date(e.target.value);
                                    if (!isNaN(d.getTime())) {
                                      setCheckInDate(d);
                                      if (d >= checkOutDate) setCheckOutDate(addDays(d, 3));
                                    }
                                  }}
                                  className="w-full text-xs font-bold text-slate-900 bg-slate-50 p-2 rounded-xl border border-slate-200"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Check-out</label>
                                <input
                                  type="date"
                                  value={format(checkOutDate, "yyyy-MM-dd")}
                                  min={format(addDays(checkInDate, 1), "yyyy-MM-dd")}
                                  onChange={(e) => {
                                    const d = new Date(e.target.value);
                                    if (!isNaN(d.getTime())) setCheckOutDate(d);
                                  }}
                                  className="w-full text-xs font-bold text-slate-900 bg-slate-50 p-2 rounded-xl border border-slate-200"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsDateOpen(false)}
                                className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                              >
                                Confirm
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      {/* Guests */}
                      <div ref={guestsRef} className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5 cursor-pointer rounded-xl sm:rounded-none hover:bg-white transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-blue-600 flex items-center justify-center shrink-0">
                          <AnimatedIcon name="users" animation="pulse" size={15} />
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
                            {rooms} Room{rooms !== 1 ? "s" : ""}
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
                              className="absolute top-full right-0 mt-3 w-68 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 p-3.5 z-[150] space-y-3"
                            >
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                <span className="text-xs font-extrabold text-slate-900">Guests & Rooms</span>
                                <button type="button" onClick={() => setIsGuestsOpen(false)}>
                                  <X className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">Rooms</span>
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-6 h-6 rounded-md border border-slate-200 text-xs font-bold">-</button>
                                  <span className="w-4 text-center font-bold text-xs">{rooms}</span>
                                  <button type="button" onClick={() => setRooms(rooms + 1)} className="w-6 h-6 rounded-md border border-slate-200 text-xs font-bold">+</button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">Adults</span>
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-6 h-6 rounded-md border border-slate-200 text-xs font-bold">-</button>
                                  <span className="w-4 text-center font-bold text-xs">{adults}</span>
                                  <button type="button" onClick={() => setAdults(adults + 1)} className="w-6 h-6 rounded-md border border-slate-200 text-xs font-bold">+</button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">Children</span>
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-6 h-6 rounded-md border border-slate-200 text-xs font-bold">-</button>
                                  <span className="w-4 text-center font-bold text-xs">{children}</span>
                                  <button type="button" onClick={() => setChildren(children + 1)} className="w-6 h-6 rounded-md border border-slate-200 text-xs font-bold">+</button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsGuestsOpen(false)}
                                className="w-full py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                              >
                                Done
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}

                  {/* ── TRANSFERS SEARCH ── */}
                  {activeTab === "transfers" && (
                    <>
                      <div className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-blue-600 flex items-center justify-center shrink-0">
                          <AnimatedIcon name="car" animation="glide" size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">Pickup</span>
                          <input
                            type="text"
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            placeholder="Airport or hotel..."
                            className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate"
                          />
                        </div>
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      <div className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-blue-600 flex items-center justify-center shrink-0">
                          <Navigation className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">Dropoff</span>
                          <input
                            type="text"
                            value={dropoffLocation}
                            onChange={(e) => setDropoffLocation(e.target.value)}
                            placeholder="Destination..."
                            className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate"
                          />
                        </div>
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      <div className="relative px-3 py-1.5 flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">
                          {format(checkInDate, "MMM d")} · {adults} Pax
                        </span>
                      </div>
                    </>
                  )}

                  {/* ── EXPERIENCES SEARCH ── */}
                  {activeTab === "experiences" && (
                    <>
                      <div className="relative flex-1 px-3 py-1.5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white shadow-xs text-purple-600 flex items-center justify-center shrink-0">
                          <AnimatedIcon name="experiences" animation="bounce" size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">Tour / City</span>
                          <input
                            type="text"
                            value={locationQuery}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            placeholder="e.g. Dubai Safari..."
                            className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate"
                          />
                        </div>
                      </div>

                      <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

                      <div className="relative px-3 py-1.5 flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">
                          {format(checkInDate, "MMM d")} · {adults} Travellers
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
                      <Search className="w-4 h-4 text-white" />
                    </button>
                  </div>

                </form>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
