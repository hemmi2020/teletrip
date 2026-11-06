import React, { useState } from 'react';
import { Star, MapPin, Sparkles, Navigation, Layers, Compass, CheckCircle, SlidersHorizontal, X, ExternalLink } from 'lucide-react';
import { mockHotels } from '../fixtures';
import { FilterSidebar } from '../components/FilterSidebar';

export const VariantB = ({ onSelectHotel }) => {
  const [selectedPin, setSelectedPin] = useState(mockHotels[1].id);
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'map' | 'filters'
  const [selectedStars, setSelectedStars] = useState([]);
  const [priceRange, setPriceRange] = useState([200, 3500]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [freeCancelOnly, setFreeCancelOnly] = useState(false);
  const [luxuryOnly, setLuxuryOnly] = useState(false);
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

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

  const activeHotel = mockHotels.find(h => h.id === selectedPin) || mockHotels[0];

  return (
    <div className="space-y-4 text-left">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-emerald-700">Design Thesis:</span>
          <strong>Live Split-Pane Interactive Map.</strong> Real interactive Dubai Google Map with smooth card list synchronization, zero lag, and full filter sidebar.
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[10px] shrink-0">
          Interactive Map Sync
        </span>
      </div>

      {/* Mobile View Switcher */}
      <div className="flex md:hidden bg-gray-100 p-1 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'list' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'
          }`}
        >
          List ({filteredHotels.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'map' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'
          }`}
        >
          Interactive Map
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('filters')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'filters' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'
          }`}
        >
          Filters
        </button>
      </div>

      {/* ── 3-PANE SPLIT CONTAINER: SIDEBAR + CARDS + LIVE MAP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* Left: Filter Sidebar (3 cols on desktop) */}
        <div className={`lg:col-span-3 ${mobileTab === 'filters' ? 'block' : 'hidden lg:block'}`}>
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

        {/* Center: Responsive Hotel Grid (5 cols on desktop) */}
        <div className={`lg:col-span-5 space-y-3.5 ${mobileTab === 'map' || mobileTab === 'filters' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
            <span className="font-bold text-gray-800">{filteredHotels.length} properties in Dubai</span>
            <span className="text-[11px] text-gray-400">Click card to highlight on map</span>
          </div>

          <div className="space-y-3.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredHotels.map((hotel) => {
              const isSelected = selectedPin === hotel.id;
              return (
                <div
                  key={hotel.id}
                  onClick={() => {
                    setSelectedPin(hotel.id);
                  }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all duration-150 cursor-pointer flex flex-col sm:flex-row justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 shadow-2xs'
                  }`}
                >
                  <div className="sm:w-44 h-36 relative overflow-hidden shrink-0">
                    <img src={hotel.thumbnail} alt={hotel.name} className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      ★ {hotel.rating}
                    </span>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{hotel.zone}</div>
                      <h4 className="font-extrabold text-sm text-gray-900 leading-snug line-clamp-1">{hotel.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{hotel.distanceKm} km from center</p>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between border-t border-gray-100">
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Total Stay</span>
                        <span className="text-sm font-black text-blue-600">AED {hotel.priceAED.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-amber-700 font-bold">≈ PKR {hotel.pricePKR.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectHotel) onSelectHotel(hotel);
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Real Interactive Map (4 cols on desktop) */}
        <div className={`lg:col-span-4 rounded-3xl overflow-hidden border border-gray-200 bg-slate-100 relative shadow-sm min-h-[460px] lg:min-h-[720px] ${mobileTab === 'list' || mobileTab === 'filters' ? 'hidden lg:block' : 'block'}`}>
          {/* Live Google Map Embed centered on Dubai */}
          <iframe
            title="Interactive Dubai Hotels Map"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(activeHotel.name + ', ' + activeHotel.address + ', Dubai')}&t=m&z=13&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full border-0 absolute inset-0"
            loading="lazy"
          />

          {/* Map Top Header Badge */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-gray-900 text-[11px] font-black shadow-md border border-gray-200 pointer-events-auto">
              📍 Live Interactive Map: {activeHotel.name}
            </span>
          </div>

          {/* Active Hotel Floating Bottom Card */}
          <div className="absolute bottom-4 left-3 right-3 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-gray-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={activeHotel.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200" />
              <div className="min-w-0">
                <h4 className="font-extrabold text-xs text-gray-900 truncate">{activeHotel.name}</h4>
                <div className="text-[10px] text-gray-500">{activeHotel.zone} · ★ {activeHotel.rating}</div>
                <div className="text-xs font-black text-blue-600">AED {activeHotel.priceAED.toLocaleString()} total</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectHotel && onSelectHotel(activeHotel)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs cursor-pointer"
            >
              Select Hotel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
