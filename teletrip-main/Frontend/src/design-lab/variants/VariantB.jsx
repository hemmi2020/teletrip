import React, { useState } from 'react';
import { Star, MapPin, Sparkles, Navigation, Layers, Compass, CheckCircle, SlidersHorizontal, X } from 'lucide-react';
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

  return (
    <div className="space-y-4 text-left">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-emerald-700">Design Thesis:</span>
          <strong>Split-Pane Spatial Discovery with Filter Sidebar.</strong> Synchronizes interactive map pins, cards, and full-fidelity filters.
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[10px] shrink-0">
          Airbnb Luxe / Google Travel
        </span>
      </div>

      {/* Mobile View Switcher */}
      <div className="flex md:hidden bg-gray-100 p-1 rounded-xl gap-1">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mobileTab === 'list' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
        >
          List ({filteredHotels.length})
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mobileTab === 'map' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
        >
          Map View
        </button>
        <button
          onClick={() => setMobileTab('filters')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mobileTab === 'filters' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
        >
          Filters
        </button>
      </div>

      {/* ── 3-PANE SPLIT CONTAINER: SIDEBAR + CARDS + MAP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
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
        <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'map' || mobileTab === 'filters' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
            <span className="font-bold text-gray-800">{filteredHotels.length} properties in Dubai</span>
            <span>Hover card to locate on map</span>
          </div>

          <div className="space-y-3.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredHotels.map((hotel) => {
              const isSelected = selectedPin === hotel.id;
              return (
                <div
                  key={hotel.id}
                  onMouseEnter={() => setSelectedPin(hotel.id)}
                  onClick={() => {
                    setSelectedPin(hotel.id);
                    if (onSelectHotel) onSelectHotel(hotel);
                  }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col sm:flex-row justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-lg scale-[1.01]'
                      : 'border-gray-200 hover:border-gray-300 shadow-2xs'
                  }`}
                >
                  <div className="sm:w-44 h-36 relative overflow-hidden shrink-0">
                    <img src={hotel.thumbnail} alt={hotel.name} className="w-full h-full object-cover" />
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
                      <span className="text-[11px] text-amber-700 font-bold">≈ PKR {hotel.pricePKR.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Synchronized Map (4 cols on desktop) */}
        <div className={`lg:col-span-4 rounded-3xl overflow-hidden border border-gray-200 bg-slate-900 relative shadow-inner min-h-[400px] ${mobileTab === 'list' || mobileTab === 'filters' ? 'hidden lg:block' : 'block'}`}>
          <img
            src="https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg"
            alt="Dubai satellite map background"
            className="w-full h-full object-cover opacity-60 filter contrast-125"
          />
          <div className="absolute inset-0 bg-slate-950/40" />

          {/* Interactive Floating Price Pins */}
          <div className="absolute top-20 left-16 z-20">
            <button
              onClick={() => setSelectedPin("107748")}
              className={`px-2.5 py-1 rounded-full text-xs font-black shadow-lg transition-all cursor-pointer ${
                selectedPin === "107748" ? 'bg-blue-600 text-white scale-110 ring-4 ring-white/60' : 'bg-white text-gray-900 hover:scale-105'
              }`}
            >
              AED 606
            </button>
          </div>

          <div className="absolute top-36 right-20 z-20">
            <button
              onClick={() => setSelectedPin("6807")}
              className={`px-2.5 py-1 rounded-full text-xs font-black shadow-lg transition-all cursor-pointer ${
                selectedPin === "6807" ? 'bg-blue-600 text-white scale-110 ring-4 ring-white/60' : 'bg-white text-gray-900 hover:scale-105'
              }`}
            >
              AED 1,450
            </button>
          </div>

          <div className="absolute bottom-24 left-24 z-20">
            <button
              onClick={() => setSelectedPin("10243")}
              className={`px-2.5 py-1 rounded-full text-xs font-black shadow-lg transition-all cursor-pointer ${
                selectedPin === "10243" ? 'bg-blue-600 text-white scale-110 ring-4 ring-white/60' : 'bg-white text-gray-900 hover:scale-105'
              }`}
            >
              AED 3,150
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
