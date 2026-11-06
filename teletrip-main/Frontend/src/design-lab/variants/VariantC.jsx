import React, { useState } from 'react';
import { Star, MapPin, ChevronDown, ChevronUp, Check, ShieldCheck, Sparkles, Bed, ArrowUpRight } from 'lucide-react';
import { mockHotels } from '../fixtures';

export const VariantC = ({ onSelectHotel }) => {
  const [expandedHotel, setExpandedHotel] = useState(mockHotels[0].id);

  const toggleExpand = (id) => {
    setExpandedHotel(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4 text-left">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-slate-900">Design Thesis:</span>
          <strong>High-Density Power-User Table Matrix.</strong> Designed for speed, travel agents, and multi-option comparison. Minimizes vertical height and lets users expand rates inline without modal context switching.
        </div>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white font-bold text-[10px] shrink-0">
          Bedsonline / Linear Power Table
        </span>
      </div>

      {/* Table Header Bar */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 bg-gray-100 rounded-xl text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-5">Hotel Property & Location</div>
        <div className="col-span-2 text-center">Category & Rating</div>
        <div className="col-span-2 text-center">Board & Guarantee</div>
        <div className="col-span-3 text-right">Stay Total (AED / PKR)</div>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {mockHotels.map((hotel) => {
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
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{hotel.zone}</span>
                      <span>·</span>
                      <span className="text-gray-400">{hotel.distanceKm} km to center</span>
                    </p>
                  </div>
                </div>

                {/* Col 2: Stars & Rating (2 cols) */}
                <div className="col-span-2 flex md:flex-col items-start md:items-center justify-between md:justify-center">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 mt-0.5">★ {hotel.rating} / 5</span>
                </div>

                {/* Col 3: Board & Policy (2 cols) */}
                <div className="col-span-2 flex md:flex-col items-start md:items-center justify-between md:justify-center text-center">
                  <span className="text-xs font-semibold text-gray-800">{hotel.boardName}</span>
                  {hotel.hasFreeCancellation ? (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Free Cancel
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-600 font-medium">Non-refundable</span>
                  )}
                </div>

                {/* Col 4: Price & Expand Toggle (3 cols) */}
                <div className="col-span-3 flex items-center justify-between md:justify-end gap-3 text-right">
                  <div>
                    <div className="text-base font-black text-blue-700 leading-tight">
                      AED {hotel.priceAED.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-bold text-gray-500">
                      ≈ PKR {hotel.pricePKR.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Inline Room Matrix Accordion */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-blue-600" />
                      Available Rates & Room Types ({hotel.roomsAvailable?.length || 2})
                    </span>
                    <button
                      onClick={() => onSelectHotel && onSelectHotel(hotel)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Hotel Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-gray-200 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                    {(hotel.roomsAvailable || []).map((room, rIdx) => (
                      <div key={rIdx} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900">{room.name}</div>
                          <div className="text-[11px] text-gray-400 font-mono">Code: {room.code} · {room.ratesCount} rate options available</div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-blue-700">AED {room.priceAED}</span>
                          <span className="text-[10px] text-gray-400 block font-normal">total for 3 nights</span>
                        </div>
                        <button
                          onClick={() => onSelectHotel && onSelectHotel(hotel)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                        >
                          Select
                        </button>
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
  );
};

