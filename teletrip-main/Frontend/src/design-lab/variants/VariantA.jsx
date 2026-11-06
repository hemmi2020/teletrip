import React, { useState } from 'react';
import { Star, MapPin, Tag, Check, Sparkles, SlidersHorizontal, ChevronRight, Eye } from 'lucide-react';
import { mockHotels, mockQuickFilters, mockSearchParams } from '../fixtures';

export const VariantA = ({ onSelectHotel }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredHotels = mockHotels.filter(h => {
    if (activeFilter === 'luxury') return h.isLuxuryCollection || h.stars >= 5;
    if (activeFilter === 'free_cancel') return h.hasFreeCancellation;
    if (activeFilter === 'breakfast') return h.breakfastIncluded;
    if (activeFilter === '5stars') return h.stars === 5;
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-blue-700">Design Thesis:</span>
          <strong>Information Hierarchy & Luxury Clarity.</strong> Separates visual inspiration (left), credentials (center), and transparent dual-currency commitment (right) with zero clutter.
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
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer">
          Modify Search
        </button>
      </div>

      {/* ── STICKY HORIZONTAL QUICK-FILTER CHIPS ── */}
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

      {/* ── HOTEL CARDS LIST (LUXURY HIERARCHY) ── */}
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

              {hotel.promos?.[0] && (
                <div className="absolute bottom-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{hotel.promos[0]}</span>
                </div>
              )}
            </div>

            {/* Center: Clean Credentials & Highlights */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{hotel.address}</span>
                  <span>·</span>
                  <span className="text-gray-400 font-medium">{hotel.distanceKm} km from center</span>
                </div>

                {/* TripAdvisor Review Pill */}
                <div className="inline-flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-xs font-black">
                    {hotel.rating}
                  </span>
                  <span className="text-xs font-bold text-gray-800">Excellent</span>
                  <span className="text-xs text-gray-400 font-normal">({hotel.reviewsCount} reviews)</span>
                </div>

                {/* Review Quote Highlight */}
                {hotel.reviewHighlight && (
                  <p className="text-xs text-gray-600 italic line-clamp-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    "{hotel.reviewHighlight}"
                  </p>
                )}
              </div>

              {/* Room availability snapshot */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                <span className="font-semibold text-gray-900">{hotel.boardName}</span>
                <span>·</span>
                <span>{hotel.roomsAvailable?.[0]?.name || "Standard Room"}</span>
                <span>·</span>
                <span className="text-blue-600 font-medium">{hotel.roomsAvailable?.length || 2} room types available</span>
              </div>
            </div>

            {/* Right: Transparent Dual-Pricing & Call to Action */}
            <div className="p-4 sm:p-5 bg-gray-50/70 border-t md:border-t-0 md:border-l border-gray-100 md:w-56 flex flex-row md:flex-col justify-between items-end shrink-0 text-right">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                  3 nights for 2 guests
                </span>
                <div className="text-xl sm:text-2xl font-black text-blue-700 leading-tight">
                  AED {hotel.priceAED.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-gray-600 mt-0.5">
                  ≈ PKR {hotel.pricePKR.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  AED {hotel.pricePerNightAED} / night · Taxes incl.
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectHotel && onSelectHotel(hotel)}
                className="mt-3 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>View Rooms & Rates</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

