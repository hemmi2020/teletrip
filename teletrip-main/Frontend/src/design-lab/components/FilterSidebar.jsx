import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Star,
  Check,
  Sparkles,
  MapPin,
  Coffee,
  Waves,
  Dumbbell,
  Wifi,
  Car,
  UtensilsCrossed,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const FilterSidebar = ({
  selectedStars = [],
  setSelectedStars,
  priceRange = [200, 3500],
  setPriceRange,
  selectedBoards = [],
  setSelectedBoards,
  freeCancelOnly = false,
  setFreeCancelOnly,
  luxuryOnly = false,
  setLuxuryOnly,
  selectedZones = [],
  setSelectedZones,
  selectedAmenities = [],
  setSelectedAmenities,
  onReset
}) => {
  const [openSections, setOpenSections] = useState({
    price: true,
    stars: true,
    boards: true,
    zones: true,
    amenities: true
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStarToggle = (star) => {
    if (!setSelectedStars) return;
    setSelectedStars(prev => 
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    );
  };

  const handleBoardToggle = (board) => {
    if (!setSelectedBoards) return;
    setSelectedBoards(prev =>
      prev.includes(board) ? prev.filter(b => b !== board) : [...prev, board]
    );
  };

  const handleZoneToggle = (zone) => {
    if (!setSelectedZones) return;
    setSelectedZones(prev =>
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  const handleAmenityToggle = (amenity) => {
    if (!setSelectedAmenities) return;
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <aside className="w-full bg-white rounded-2xl border border-gray-200 p-4 space-y-5 shadow-xs text-left">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-extrabold text-gray-900">Filters</h3>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* ── 1. LUXURY & QUICK TOGGLES ── */}
      <div className="space-y-2">
        <label
          onClick={() => setLuxuryOnly && setLuxuryOnly(!luxuryOnly)}
          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
            luxuryOnly
              ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-bold'
              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Luxury Collection Only</span>
          </div>
          <input
            type="checkbox"
            checked={luxuryOnly}
            onChange={() => {}}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </label>

        <label
          onClick={() => setFreeCancelOnly && setFreeCancelOnly(!freeCancelOnly)}
          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
            freeCancelOnly
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-600 font-bold">🛡️</span>
            <span>Free Cancellation Only</span>
          </div>
          <input
            type="checkbox"
            checked={freeCancelOnly}
            onChange={() => {}}
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* ── 2. PRICE PER NIGHT SLIDER ── */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <div
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider">
            Price Per Night (AED)
          </h4>
          {openSections.price ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </div>

        {openSections.price && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-800">
              <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">
                AED {priceRange[0]}
              </span>
              <span className="text-gray-400">to</span>
              <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">
                AED {priceRange[1]}+
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="50"
              value={priceRange[1]}
              onChange={(e) => setPriceRange && setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="text-[10px] text-gray-400 text-center">
              ≈ PKR {(priceRange[0] * 76).toLocaleString()} – PKR {(priceRange[1] * 76).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. STAR RATINGS ── */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <div
          onClick={() => toggleSection('stars')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider">
            Star Rating
          </h4>
          {openSections.stars ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </div>

        {openSections.stars && (
          <div className="space-y-1.5">
            {[5, 4, 3].map((star) => {
              const isChecked = selectedStars.includes(star);
              return (
                <label
                  key={star}
                  onClick={() => handleStarToggle(star)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                    isChecked ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex text-amber-400">
                      {[...Array(star)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs">{star} Stars</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    {star === 5 ? '18' : star === 4 ? '34' : '22'}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. MEAL PLANS & BOARD ── */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <div
          onClick={() => toggleSection('boards')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider">
            Meal Plan & Board
          </h4>
          {openSections.boards ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </div>

        {openSections.boards && (
          <div className="space-y-1.5">
            {[
              { id: 'Room Only', label: 'Room Only', count: 48 },
              { id: 'Breakfast Included', label: 'Breakfast Included 🍳', count: 35 },
              { id: 'Half Board', label: 'Half Board (Dinner) 🍽️', count: 12 },
              { id: 'All Inclusive', label: 'All Inclusive 🍹', count: 6 }
            ].map((board) => {
              const isChecked = selectedBoards.includes(board.id);
              return (
                <label
                  key={board.id}
                  onClick={() => handleBoardToggle(board.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                    isChecked ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span>{board.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{board.count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. NEIGHBORHOODS & ZONES ── */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <div
          onClick={() => toggleSection('zones')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider">
            Popular Neighborhoods
          </h4>
          {openSections.zones ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </div>

        {openSections.zones && (
          <div className="space-y-1.5">
            {[
              { id: 'Palm Jumeirah', label: 'Palm Jumeirah', count: 24 },
              { id: 'Downtown Dubai', label: 'Downtown / Burj Khalifa', count: 31 },
              { id: 'Dubai Marina', label: 'Dubai Marina', count: 42 },
              { id: 'Bur Dubai', label: 'Bur Dubai', count: 19 },
              { id: 'Jumeirah Beach', label: 'Jumeirah Beach (JBR)', count: 28 }
            ].map((zone) => {
              const isChecked = selectedZones.includes(zone.id);
              return (
                <label
                  key={zone.id}
                  onClick={() => handleZoneToggle(zone.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                    isChecked ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span>{zone.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{zone.count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 6. AMENITIES ── */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <div
          onClick={() => toggleSection('amenities')}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider">
            Amenities
          </h4>
          {openSections.amenities ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </div>

        {openSections.amenities && (
          <div className="space-y-1.5">
            {[
              { id: 'POOL', label: 'Swimming Pool', icon: Waves },
              { id: 'GYM', label: 'Fitness Center / Gym', icon: Dumbbell },
              { id: 'WIFI', label: 'Free High-Speed WiFi', icon: Wifi },
              { id: 'SPA', label: 'Luxury Spa', icon: Sparkles },
              { id: 'PARKING', label: 'Free Parking / Valet', icon: Car }
            ].map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity.id);
              const IconComp = amenity.icon;
              return (
                <label
                  key={amenity.id}
                  onClick={() => handleAmenityToggle(amenity.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                    isChecked ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <IconComp className="w-3.5 h-3.5 text-gray-500" />
                    <span>{amenity.label}</span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default FilterSidebar;

