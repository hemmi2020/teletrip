import React, { useState } from 'react';
import { Star, MapPin, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Quote, Camera } from 'lucide-react';
import { mockHotels } from '../fixtures';

export const VariantE = ({ onSelectHotel }) => {
  const [photoIndexes, setPhotoIndexes] = useState({});

  const handleNextPhoto = (e, hotelId, max) => {
    e.stopPropagation();
    setPhotoIndexes(prev => ({
      ...prev,
      [hotelId]: ((prev[hotelId] || 0) + 1) % max
    }));
  };

  const handlePrevPhoto = (e, hotelId, max) => {
    e.stopPropagation();
    setPhotoIndexes(prev => ({
      ...prev,
      [hotelId]: ((prev[hotelId] || 0) - 1 + max) % max
    }));
  };

  return (
    <div className="space-y-6 text-left">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-950 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-amber-800">Design Thesis:</span>
          <strong>Immersive Boutique & Visual Storytelling.</strong> Luxury travelers buy with their eyes. Prioritizes large in-card gallery previews, neighborhood context, and guest endorsements with editorial sophistication.
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-900 text-amber-200 font-bold text-[10px] shrink-0">
          Editorial / Tablet Magazine
        </span>
      </div>

      {/* ── EDITORIAL HOTEL CARDS ── */}
      <div className="space-y-6">
        {mockHotels.map((hotel) => {
          const imgList = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.thumbnail];
          const currentIdx = photoIndexes[hotel.id] || 0;
          const currentImg = imgList[currentIdx];

          return (
            <div
              key={hotel.id}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group"
            >
              {/* Left: Edge-to-Edge Visual Carousel (7 cols) */}
              <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[260px] overflow-hidden bg-gray-900">
                <img
                  src={currentImg}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 select-none"
                />
                
                {/* Carousel Arrow Controls */}
                {imgList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handlePrevPhoto(e, hotel.id, imgList.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleNextPhoto(e, hotel.id, imgList.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Photo Counter Pill */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1 z-10">
                  <Camera className="w-3 h-3 text-amber-300" />
                  <span>{currentIdx + 1} / {imgList.length}</span>
                </div>

                {/* Luxury Tag overlay */}
                {hotel.isLuxuryCollection && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/50 text-[11px] font-extrabold flex items-center gap-1.5 shadow-lg z-10">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Luxury Collection</span>
                  </div>
                )}
              </div>

              {/* Right: Editorial Narrative & Price (5 cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                      {[...Array(hotel.stars)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight tracking-tight">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{hotel.address}</span>
                    </p>
                  </div>

                  {/* Editorial Guest Quote */}
                  {hotel.reviewHighlight && (
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-700 italic flex items-start gap-2">
                      <Quote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">"{hotel.reviewHighlight}"</p>
                    </div>
                  )}

                  {/* Highlights Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.amenities.slice(0, 4).map((amenity, i) => (
                      <span key={i} className="text-[10px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Commitment */}
                <div className="pt-4 border-t border-gray-100 flex items-end justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      Full Stay Total
                    </span>
                    <div className="text-2xl font-black text-stone-900 leading-tight">
                      AED {hotel.priceAED.toLocaleString()}
                    </div>
                    <div className="text-xs font-bold text-amber-700">
                      ≈ PKR {hotel.pricePKR.toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectHotel && onSelectHotel(hotel)}
                    className="py-2.5 px-5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    Reserve Room
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

