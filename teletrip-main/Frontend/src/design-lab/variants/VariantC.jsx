import React, { useState } from 'react';
import { Star, MapPin, ChevronDown, ChevronUp, Check, ShieldCheck, Sparkles, Bed, ArrowUpRight, SlidersHorizontal, X } from 'lucide-react';
import { mockHotels } from '../fixtures';
import { FilterSidebar } from '../components/FilterSidebar';

export const VariantC = ({ onSelectHotel }) => {
  const [expandedHotel, setExpandedHotel] = useState(mockHotels[0].id);
  const [selectedStars, setSelectedStars] = useState([]);
  const [priceRange, setPriceRange] = useState([200, 3500]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [freeCancelOnly, setFreeCancelOnly] = useState(false);
  const [luxuryOnly, setLuxuryOnly] = useState(false);
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const toggleExpand = (id) => {
    setExpandedHotel(prev => prev === id ? null : id);
  };

  const filteredHotels = mockHotels.filter(h => {
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
    <div className="space-y-4 text-left">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-slate-900">Design Thesis:</span>
          <strong>High-Density Power-User Table Matrix with Left Filter Sidebar.</strong> Designed for speed, travel agents, and multi-option comparison without modal context switching.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden px-3 py-1 bg-white border border-slate-300 text-slate-800 font-bold text-xs rounded-lg flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white font-bold text-[10px] shrink-0">
            Bedsonline / Linear Power Table
          </span>
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT: SIDEBAR + MATRIX ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24">
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
          />
        </div>

        {/* Right: Table Matrix */}
        <div className="lg:col-span-9 space-y-3">
          {/* Table Header Bar */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 bg-gray-100 rounded-xl text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-5">Hotel Property & Location</div>
            <div className="col-span-2 text-center">Category & Rating</div>
            <div className="col-span-2 text-center">Board & Guarantee</div>
            <div className="col-span-3 text-right">Stay Total (AED / PKR)</div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {filteredHotels.map((hotel) => {
              const isExpanded = expandedHotel === hotel.id;

              return (
                <div
                  key={hotel.id}
                  className={`bg-white rounded-xl border transition-all ${
                    isExpanded ? 'border-blue-400 ring-2 ring-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300 shadow-2xs'
                  }`}
                >
                  {/* Row Main Bar */}
                  <div
                    onClick={() => toggleExpand(hotel.id)}
                    className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center cursor-pointer select-none"
                  >
                    {/* Col 1: Thumbnail + Title (5 cols) */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <img src={hotel.thumbnail} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-gray-100" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-gray-900 truncate">{hotel.name}</span>
                          {hotel.isLuxuryCollection && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              ✨ Luxury
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{hotel.address}</span>
                        </div>
                        <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                          {hotel.roomsAvailable.length} room types available
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Category & Rating (2 cols) */}
                    <div className="col-span-2 text-center hidden md:block">
                      <div className="flex justify-center text-amber-400">
                        {[...Array(hotel.stars || 4)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 block mt-0.5">
                        ★ {hotel.rating} ({hotel.reviewsCount})
                      </span>
                    </div>

                    {/* Col 3: Board & Guarantee (2 cols) */}
                    <div className="col-span-2 text-center hidden md:block">
                      <span className="text-xs font-semibold text-gray-800 block">{hotel.boardName}</span>
                      {hotel.hasFreeCancellation ? (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          Free Cancellation
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 block mt-0.5">Standard terms</span>
                      )}
                    </div>

                    {/* Col 4: Price & Toggle (3 cols) */}
                    <div className="col-span-3 flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-0 border-gray-100">
                      <div className="text-left md:text-right">
                        <div className="text-base sm:text-lg font-black text-blue-600 leading-tight">
                          AED {hotel.priceAED.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-amber-700 font-bold">
                          ≈ PKR {hotel.pricePKR.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-gray-400">Total for 3 nights</div>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Inline Expandable Rates Subtable */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50 border-t border-gray-200 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700 flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-blue-600" />
                          Available Room Rates (Bedsonline Guaranteed)
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectHotel && onSelectHotel(hotel)}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Full Hotel Modal</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                        {hotel.roomsAvailable.map((room, ri) => (
                          <div key={ri} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:bg-blue-50/30">
                            <div>
                              <div className="font-extrabold text-gray-900">{room.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">Code: {room.code} · {room.ratesCount} rate plans</div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-1.5 sm:pt-0 border-t sm:border-0 border-gray-100">
                              <div className="text-left sm:text-right">
                                <span className="font-black text-sm text-blue-600 block">AED {room.priceAED.toLocaleString()}</span>
                                <span className="text-[10px] text-gray-400 block">≈ PKR {(room.priceAED * 76).toLocaleString()}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => onSelectHotel && onSelectHotel(hotel)}
                                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 cursor-pointer min-h-[36px]"
                              >
                                Select
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs sm:max-w-sm bg-white h-full overflow-y-auto p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-extrabold text-sm text-gray-900">Filters</span>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
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
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 pb-safe">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full min-h-[44px] py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md"
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
