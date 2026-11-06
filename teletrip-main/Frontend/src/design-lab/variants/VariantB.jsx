import React, { useState } from 'react';
import { Star, MapPin, Sparkles, Navigation, Layers, Compass, CheckCircle } from 'lucide-react';
import { mockHotels } from '../fixtures';

export const VariantB = ({ onSelectHotel }) => {
  const [selectedPin, setSelectedPin] = useState(mockHotels[1].id);
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'map'

  return (
    <div className="space-y-4 text-left">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-emerald-700">Design Thesis:</span>
          <strong>Split-Pane Spatial Discovery.</strong> Travel decisions are fundamentally geographic. Synchronizes a reactive interactive map with hotel cards so users immediately see neighborhood and proximity value.
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[10px] shrink-0">
          Airbnb Luxe / Google Travel
        </span>
      </div>

      {/* Mobile View Switcher */}
      <div className="flex md:hidden bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mobileTab === 'list' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
        >
          Card List ({mockHotels.length})
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mobileTab === 'map' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
        >
          Interactive Map
        </button>
      </div>

      {/* ── SPLIT CONTAINER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
        {/* Left: Responsive Hotel Grid (7 cols) */}
        <div className={`lg:col-span-7 space-y-4 ${mobileTab === 'map' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
            <span className="font-bold text-gray-800">{mockHotels.length} properties in Dubai</span>
            <span>Sorted by Recommended</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockHotels.map((hotel) => {
              const isSelected = selectedPin === hotel.id;
              return (
                <div
                  key={hotel.id}
                  onMouseEnter={() => setSelectedPin(hotel.id)}
                  onClick={() => {
                    setSelectedPin(hotel.id);
                    if (onSelectHotel) onSelectHotel(hotel);
                  }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-lg scale-[1.01]'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Card Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img src={hotel.thumbnail} alt={hotel.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      {hotel.isLuxuryCollection && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/80 text-amber-300 backdrop-blur-sm border border-amber-400/40">
                          ✨ Luxury
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white">
                      ★ {hotel.rating}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1">{hotel.name}</h4>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate">{hotel.zone}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase">from</span>
                        <div className="text-base font-black text-blue-700 leading-tight">
                          AED {hotel.priceAED.toLocaleString()}
                        </div>
                        <div className="text-[10px] font-semibold text-gray-500">
                          ≈ PKR {hotel.pricePKR.toLocaleString()}
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-lg text-xs font-bold transition-all">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Simulated Interactive Map (5 cols) */}
        <div className={`lg:col-span-5 h-[500px] lg:h-auto rounded-2xl overflow-hidden border border-gray-200 relative bg-slate-100 shadow-inner ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          {/* Simulated Map Canvas Texture */}
          <div
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(#cbd5e1 1px, #f1f5f9 1px)`,
              backgroundSize: `24px 24px`,
              backgroundPosition: `0 0, 12px 12px`
            }}
          />

          {/* Map Top Bar Controls */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
            <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md text-xs font-bold text-gray-800 flex items-center gap-1.5 pointer-events-auto">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Dubai, UAE</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md text-xs font-bold text-gray-700 pointer-events-auto flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span>Landmarks Active</span>
            </div>
          </div>

          {/* Landmarks */}
          <div className="absolute top-[42%] left-[45%] text-[10px] font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-md shadow-xs pointer-events-none">
            🏙️ Burj Khalifa / Downtown
          </div>
          <div className="absolute top-[20%] left-[30%] text-[10px] font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-md shadow-xs pointer-events-none">
            🌊 Dubai Creek
          </div>

          {/* Interactive Price Marker Pins */}
          {mockHotels.map((h, i) => {
            const isSelected = selectedPin === h.id;
            // Spread mock pins realistically across the canvas
            const topPositions = ['28%', '46%', '62%', '40%'];
            const leftPositions = ['35%', '48%', '58%', '38%'];

            return (
              <div
                key={h.id}
                onClick={() => setSelectedPin(h.id)}
                style={{ top: topPositions[i], left: leftPositions[i] }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20 ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`px-3 py-1.5 rounded-full font-black text-xs shadow-xl flex items-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white ring-4 ring-blue-300'
                      : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>AED {h.priceAED}</span>
                </div>
              </div>
            );
          })}

          {/* Active Pin Mini-Card Overlay at Bottom */}
          {(() => {
            const activeHotel = mockHotels.find(h => h.id === selectedPin) || mockHotels[0];
            return (
              <div className="absolute bottom-3 inset-x-3 bg-white p-3 rounded-xl shadow-xl border border-gray-200 flex items-center gap-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <img src={activeHotel.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-xs text-gray-900 truncate">{activeHotel.name}</span>
                    <span className="text-[10px] text-amber-500 font-bold shrink-0">★ {activeHotel.rating}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{activeHotel.zone}</p>
                  <div className="text-xs font-black text-blue-600 mt-0.5">
                    AED {activeHotel.priceAED} <span className="text-[10px] text-gray-400 font-normal">/ stay</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectHotel && onSelectHotel(activeHotel)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
                >
                  Details
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

