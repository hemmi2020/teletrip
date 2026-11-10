import React, { useState } from 'react';
import { Star, MapPin, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Quote, Camera, SlidersHorizontal, X } from 'lucide-react';
import { mockHotels } from '../fixtures';
import { FilterSidebar } from '../components/FilterSidebar';

export const VariantE = ({ onSelectHotel }) => {
  const [photoIndexes, setPhotoIndexes] = useState({});
  const [selectedStars, setSelectedStars] = useState([]);
  const [priceRange, setPriceRange] = useState([200, 3500]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [freeCancelOnly, setFreeCancelOnly] = useState(false);
  const [luxuryOnly, setLuxuryOnly] = useState(false);
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
    <div className="space-y-6 text-left">
      {/* ── RATIONALE BANNER ── */}
      <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-950 flex items-center justify-between gap-3">
        <div>
          <span className="font-extrabold uppercase tracking-wide mr-2 text-amber-800">Design Thesis:</span>
          <strong>Immersive Boutique & Visual Storytelling with Left Filter Sidebar.</strong> Prioritizes large in-card gallery previews, neighborhood context, and guest endorsements with editorial sophistication.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden px-3 py-1 bg-white border border-amber-300 text-amber-950 font-bold text-xs rounded-lg flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <span className="px-2 py-0.5 rounded-full bg-amber-900 text-amber-200 font-bold text-[10px] shrink-0">
            Editorial / Tablet Magazine
          </span>
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT: SIDEBAR + EDITORIAL CARDS ── */}
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

        {/* Right: Editorial Hotel Cards */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {filteredHotels.map((hotel) => {
            const imgList = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.thumbnail];
            const currentIdx = photoIndexes[hotel.id] || 0;
            const currentImg = imgList[currentIdx];

            return (
              <div
                key={hotel.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 grid grid-cols-1 md:grid-cols-12 group"
              >
                {/* Visual Carousel */}
                <div className="md:col-span-6 relative h-64 sm:h-80 md:h-full min-h-[260px] overflow-hidden bg-gray-900">
                  <img
                    src={currentImg}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 select-none"
                  />
                  
                  {imgList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handlePrevPhoto(e, hotel.id, imgList.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleNextPhoto(e, hotel.id, imgList.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2.5 right-2.5 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>{currentIdx + 1}/{imgList.length}</span>
                      </div>
                    </>
                  )}

                  {hotel.isLuxuryCollection && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Luxury Collection
                    </span>
                  )}
                </div>

                {/* Editorial Content */}
                <div className="md:col-span-6 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[...Array(hotel.stars || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{hotel.category}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        {hotel.zone}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-gray-900 leading-snug">
                      {hotel.name}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{hotel.address}</span>
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900 italic flex items-start gap-2">
                      <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{hotel.reviewHighlight}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">3 Nights Total</span>
                      <div className="text-xl font-black text-amber-900 leading-none">
                        AED {hotel.priceAED.toLocaleString()}
                      </div>
                      <span className="text-xs font-bold text-amber-700">≈ PKR {hotel.pricePKR.toLocaleString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectHotel && onSelectHotel(hotel)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 min-h-[44px] flex items-center justify-center"
                    >
                      View Suite Options →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
                className="w-full min-h-[44px] py-3 bg-amber-900 text-white rounded-xl font-bold text-xs shadow-md"
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
