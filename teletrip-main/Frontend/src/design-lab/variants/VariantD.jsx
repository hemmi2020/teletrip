import React, { useState } from 'react';
import { Star, MapPin, X, CheckCircle, ShieldCheck, Bed, ShoppingCart, Sparkles, SlidersHorizontal, Heart } from 'lucide-react';
import { mockHotels } from '../fixtures';

export const VariantD = ({ onSelectHotel }) => {
  const [activeScenario, setActiveScenario] = useState('romance');
  const [drawerHotel, setDrawerHotel] = useState(null);

  const scenarios = [
    { id: 'all', label: 'All Trips', icon: '🌍' },
    { id: 'romance', label: '🥂 Luxury Romance', icon: '🥂', highlight: 'SLS & Kempinski' },
    { id: 'family', label: '👨‍👩‍👧 Family Friendly', icon: '👨‍👩‍👧', highlight: 'Tulip Studios' },
    { id: 'business', label: '💼 Business & Metro', icon: '💼', highlight: 'Towers Rotana' },
    { id: 'budget', label: '🏷️ Best Value Deals', icon: '🏷️', highlight: 'Under AED 1,000' }
  ];

  return (
    <div className="space-y-4 text-left relative">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-purple-50/80 border border-purple-200/80 rounded-xl text-xs text-purple-900 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-purple-700">Design Thesis:</span>
          <strong>Guided Smart Curation & Quick-Peek Drawer.</strong> Replaces rigid 20-checkbox forms with intuitive travel scenarios and an instantaneous side drawer so users never lose search context.
        </div>
        <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white font-bold text-[10px] shrink-0">
          Smart Contextual OTA
        </span>
      </div>

      {/* ── SCENARIO CURATION TABS ── */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs space-y-2">
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

      {/* ── HOTEL CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div className="relative h-48 overflow-hidden">
              <img src={hotel.thumbnail} alt="" className="w-full h-full object-cover" />
              <button className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer">
                <Heart className="w-4 h-4" />
              </button>
              {hotel.isLuxuryCollection && (
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/50 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Luxury Collection</span>
                </div>
              )}
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-base text-gray-900 truncate">{hotel.name}</h4>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                    ★ {hotel.rating}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-600" />
                  <span>{hotel.zone}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-lg font-black text-purple-700">AED {hotel.priceAED.toLocaleString()}</div>
                  <div className="text-[11px] font-bold text-gray-500">≈ PKR {hotel.pricePKR.toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrawerHotel(hotel)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Quick Peek
                  </button>
                  <button
                    onClick={() => onSelectHotel && onSelectHotel(hotel)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                  >
                    View Rooms
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK-PEEK SIDE DRAWER ── */}
      {drawerHotel && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white shadow-2xl z-[99990] border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Quick Room Preview</span>
              <h3 className="font-extrabold text-sm text-gray-900 truncate max-w-[320px]">{drawerHotel.name}</h3>
            </div>
            <button onClick={() => setDrawerHotel(null)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <img src={drawerHotel.thumbnail} alt="" className="w-full h-44 rounded-xl object-cover shadow-sm" />

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>TeleTrip Booking Protection Guaranteed</span>
              </div>
              <p className="text-[11px] text-emerald-700">{drawerHotel.freeCancellationDate}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Available Room Options</h4>
              {(drawerHotel.roomsAvailable || []).map((r, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{r.name}</span>
                    <span className="font-black text-sm text-purple-700">AED {r.priceAED}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>{drawerHotel.boardName}</span>
                    <button
                      onClick={() => {
                        setDrawerHotel(null);
                        if (onSelectHotel) onSelectHotel(drawerHotel);
                      }}
                      className="px-2.5 py-1 bg-purple-600 text-white rounded-lg font-bold text-xs"
                    >
                      Book This Rate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

