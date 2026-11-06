import React, { useState } from 'react';
import { Star, MapPin, X, CheckCircle, ShieldCheck, Bed, ShoppingCart, Sparkles, SlidersHorizontal, Heart } from 'lucide-react';
import { mockHotels } from '../fixtures';
import { FilterSidebar } from '../components/FilterSidebar';

export const VariantD = ({ onSelectHotel }) => {
  const [activeScenario, setActiveScenario] = useState('romance');
  const [drawerHotel, setDrawerHotel] = useState(null);
  const [selectedStars, setSelectedStars] = useState([]);
  const [priceRange, setPriceRange] = useState([200, 3500]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [freeCancelOnly, setFreeCancelOnly] = useState(false);
  const [luxuryOnly, setLuxuryOnly] = useState(false);
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const scenarios = [
    { id: 'all', label: 'All Trips', icon: '🌍' },
    { id: 'romance', label: '🥂 Luxury Romance', icon: '🥂', highlight: 'SLS & Kempinski' },
    { id: 'family', label: '👨‍👩‍👧 Family Friendly', icon: '👨‍👩‍👧', highlight: 'Tulip Studios' },
    { id: 'business', label: '💼 Business & Metro', icon: '💼', highlight: 'Towers Rotana' },
    { id: 'budget', label: '🏷️ Best Value Deals', icon: '🏷️', highlight: 'Under AED 1,000' }
  ];

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
    <div className="space-y-4 text-left relative">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-purple-50/80 border border-purple-200/80 rounded-xl text-xs text-purple-900 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-purple-700">Design Thesis:</span>
          <strong>Guided Smart Curation & Quick-Peek Drawer with Left Filter Sidebar.</strong> Combines intuitive travel scenarios, deep filters, and an instantaneous side drawer so users never lose search context.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden px-3 py-1 bg-white border border-purple-300 text-purple-800 font-bold text-xs rounded-lg flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white font-bold text-[10px] shrink-0">
            Smart Contextual OTA
          </span>
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT: SIDEBAR + CURATION & CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Filter Sidebar */}
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
          />
        </div>

        {/* Right: Scenarios + Cards */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Scenario Curation Tabs */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              What type of stay are you planning?
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {scenarios.map((sc) => {
                const isActive = activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setActiveScenario(sc.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{sc.icon}</span>
                    <span>{sc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hotel Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={hotel.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ★ {hotel.rating} ({hotel.reviewsCount})
                  </span>
                  {hotel.isLuxuryCollection && (
                    <span className="absolute top-2.5 right-2.5 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      ✨ Luxury
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-purple-600 font-bold uppercase">{hotel.zone}</span>
                    <h4 className="font-extrabold text-sm text-gray-900 leading-snug">{hotel.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{hotel.distanceKm} km from center</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">From</span>
                      <span className="text-base font-black text-purple-600">AED {hotel.priceAED.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-500 block">≈ PKR {hotel.pricePKR.toLocaleString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDrawerHotel(hotel)}
                      className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Quick Peek →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Peek Drawer */}
      {drawerHotel && (
        <div className="fixed inset-0 z-[120] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs font-black uppercase tracking-wider text-purple-600">Quick Property Peek</span>
                <button
                  onClick={() => setDrawerHotel(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-52 rounded-2xl overflow-hidden relative">
                <img src={drawerHotel.thumbnail} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  AED {drawerHotel.priceAED.toLocaleString()} / night
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900">{drawerHotel.name}</h3>
                <p className="text-xs text-gray-500">{drawerHotel.address}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Available Room Options:</span>
                {drawerHotel.roomsAvailable.map((rm, i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-extrabold text-gray-900">{rm.name}</div>
                      <div className="text-[10px] text-gray-400">{rm.ratesCount} rate plans</div>
                    </div>
                    <span className="font-black text-purple-600">AED {rm.priceAED.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const h = drawerHotel;
                setDrawerHotel(null);
                if (onSelectHotel) onSelectHotel(h);
              }}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs shadow-md transition-all"
            >
              Open Full Modal & Book
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
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
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-xs"
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
