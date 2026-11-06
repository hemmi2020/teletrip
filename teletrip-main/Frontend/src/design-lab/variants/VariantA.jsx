import React, { useState } from 'react';
import { Star, MapPin, Tag, Check, Sparkles, SlidersHorizontal, ChevronRight, Eye, X } from 'lucide-react';
import { mockHotels, mockQuickFilters, mockSearchParams } from '../fixtures';
import { FilterSidebar } from '../components/FilterSidebar';

export const VariantA = ({ onSelectHotel }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedStars, setSelectedStars] = useState([]);
  const [priceRange, setPriceRange] = useState([200, 3500]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [freeCancelOnly, setFreeCancelOnly] = useState(false);
  const [luxuryOnly, setLuxuryOnly] = useState(false);
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const resetFilters = () => {
    setActiveFilter('all');
    setSelectedStars([]);
    setPriceRange([200, 3500]);
    setSelectedBoards([]);
    setFreeCancelOnly(false);
    setLuxuryOnly(false);
    setSelectedZones([]);
    setSelectedAmenities([]);
  };

  const filteredHotels = mockHotels.filter(h => {
    // Top quick chip filter
    if (activeFilter === 'luxury' && (!h.isLuxuryCollection && h.stars < 5)) return false;
    if (activeFilter === 'free_cancel' && !h.hasFreeCancellation) return false;
    if (activeFilter === 'breakfast' && !h.breakfastIncluded) return false;
    if (activeFilter === '5stars' && h.stars !== 5) return false;

    // Sidebar filters
    if (luxuryOnly && (!h.isLuxuryCollection && h.stars < 5)) return false;
    if (freeCancelOnly && !h.hasFreeCancellation) return false;
    if (selectedStars.length > 0 && !selectedStars.includes(h.stars)) return false;
    if (h.priceAED > priceRange[1]) return false;
    if (selectedBoards.length > 0 && !selectedBoards.includes(h.boardName)) return false;
    if (selectedZones.length > 0 && !selectedZones.includes(h.zone)) return false;
    if (selectedAmenities.length > 0 && !selectedAmenities.some(a => (h.amenities || []).includes(a))) return false;

    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-blue-700">Design Thesis:</span>
          <strong>Information Hierarchy & Luxury Clarity.</strong> Full-featured filter sidebar on the left with instant responsive cards on the right.
        </div>
        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] shrink-0">
          Booking / Airbnb Luxe
        </span>
      </div>

      {/* ── MINIMAL LUXURY SEARCH BAR SUMMARY ── */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{mockSearchParams.destination}</div>
            <div className="text-xs text-gray-500">
              Nov 15 – Nov 18 · {mockSearchParams.nights} Nights · 2 Guests · 1 Room
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-blue-200 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer">
            Modify Search
          </button>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT: FILTER SIDEBAR (LEFT) + RESULTS (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filter Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24">
          <FilterSidebar
            selectedStars={selectedStars}
            setSelectedStars={setSelectedStars}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedBoards={selectedBoards}
            setSelectedBoards={setSelectedBoards}
            freeCancelOnly={freeCancelOnly}
            setFreeCancelOnly={setFreeCancelOnly}
            luxuryOnly={luxuryOnly}
            setLuxuryOnly={setLuxuryOnly}
            selectedZones={selectedZones}
            setSelectedZones={setSelectedZones}
            selectedAmenities={selectedAmenities}
            setSelectedAmenities={setSelectedAmenities}
            onReset={resetFilters}
          />
        </div>

        {/* Right Column: Quick Chips + Hotel Cards */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Sticky Horizontal Quick-Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {mockQuickFilters.map((qf) => {
              const isActive = activeFilter === qf.id;
              return (
                <button
                  key={qf.id}
                  onClick={() => setActiveFilter(qf.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{qf.label}</span>
                  {qf.count && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {qf.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Results Count Header */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span className="font-bold text-gray-800">
              Showing {filteredHotels.length} of {mockHotels.length} verified Dubai properties
            </span>
            <span className="text-[11px] text-gray-400">Sorted by: Recommended</span>
          </div>

          {/* Hotel Cards List */}
          <div className="space-y-4">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col md:flex-row group"
              >
                {/* Left: High-Res Image with Luxury Badge */}
                <div className="md:w-72 relative h-48 md:h-auto overflow-hidden shrink-0">
                  <img
                    src={hotel.thumbnail}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                  
                  {/* Badges on Image */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                    {hotel.isLuxuryCollection && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/50 shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Luxury Collection</span>
                      </span>
                    )}
                    {hotel.hasFreeCancellation && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white shadow-sm">
                        Free Cancellation
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md font-semibold md:hidden">
                    ★ {hotel.rating} ({hotel.reviewsCount})
                  </span>
                </div>

                {/* Center: Details & Credentials */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex text-amber-400">
                        {[...Array(hotel.stars || 4)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {hotel.category}
                      </span>
                      <span className="text-gray-300 hidden sm:inline">·</span>
                      <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md hidden sm:inline">
                        {hotel.zone}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {hotel.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{hotel.address}</span>
                      <span className="text-gray-400">({hotel.distanceKm} km from center)</span>
                    </div>

                    <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 italic">
                      "{hotel.reviewHighlight}"
                    </div>

                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {hotel.amenities.slice(0, 4).map((a, i) => (
                        <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          ✓ {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {hotel.boardName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {hotel.roomsAvailable.length} Room Types Available
                    </span>
                  </div>
                </div>

                {/* Right: Transparent Commitment Pricing & Primary CTA */}
                <div className="p-4 sm:p-5 md:w-56 bg-slate-50/70 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-between shrink-0">
                  <div className="text-left md:text-right space-y-1">
                    <div className="flex items-center md:justify-end gap-1.5">
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900">Very Good</span>
                        <div className="text-[10px] text-gray-400">{hotel.reviewsCount} reviews</div>
                      </div>
                      <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                        {hotel.rating}
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                        From Total Stay
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-blue-600 leading-tight">
                        AED {hotel.priceAED.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-amber-700">
                        ≈ PKR {hotel.pricePKR.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        AED {hotel.pricePerNightAED} / night · {mockSearchParams.nights} nights
                      </div>
                      <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">
                        Taxes & fees included
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => onSelectHotel && onSelectHotel(hotel)}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Check Availability</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER (SLIDE-OVER) ── */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-extrabold text-sm text-gray-900">Filters</span>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="pt-3">
                <FilterSidebar
                  selectedStars={selectedStars}
                  setSelectedStars={setSelectedStars}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedBoards={selectedBoards}
                  setSelectedBoards={setSelectedBoards}
                  freeCancelOnly={freeCancelOnly}
                  setFreeCancelOnly={setFreeCancelOnly}
                  luxuryOnly={luxuryOnly}
                  setLuxuryOnly={setLuxuryOnly}
                  selectedZones={selectedZones}
                  setSelectedZones={setSelectedZones}
                  selectedAmenities={selectedAmenities}
                  setSelectedAmenities={setSelectedAmenities}
                  onReset={resetFilters}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs"
              >
                Apply Filters ({filteredHotels.length} Hotels)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
