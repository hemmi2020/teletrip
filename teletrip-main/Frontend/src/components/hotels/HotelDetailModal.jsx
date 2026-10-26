import React, { useState } from 'react';
import {
  Star,
  MapPin,
  Bed,
  ImageIcon,
  Info,
  CheckCircle,
  XCircle,
  ShoppingCart,
  AlertCircle,
  X,
  Clock,
  Tag,
  Wifi,
  Coffee,
  Car,
  Waves as Pool,
  Dumbbell as Gym,
  Utensils as Restaurant,
  Sparkles as Spa
} from 'lucide-react';

export const HotelDetailModal = ({
  isOpen = true,
  onClose,
  hotel,
  hotelContentData,
  searchParams,
  formatPKR,
  convert,
  onAddToCart,
  onMultiRoomAddToCart,
  openGallery,
  onSelectRoomDetail,
  activeRoomTab,
  setActiveRoomTab,
  roomSelections,
  setRoomSelections,
  formatCancellationPolicy,
  // Optional search result filters
  selectedBoards = [],
  selectedCancellation = "",
  selectedPackaging = "",
  selectedPromos = [],
  priceMin = "",
  priceMax = ""
}) => {
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms', 'overview', 'facilities', 'policies'
  const [rateFilter, setRateFilter] = useState('all'); // 'all', 'breakfast', 'free_cancel', 'packages'

  if (!isOpen || !hotel) return null;

  const checkIn = searchParams?.get("checkIn") || "";
  const checkOut = searchParams?.get("checkOut") || "";
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 1;

  // Images processing
  const allImages = (hotel.images || [])
    .map(img => img.path ? `https://photos.hotelbeds.com/giata/original/${img.path}` : null)
    .filter(Boolean);
  if (allImages.length === 0 && hotel.thumbnail) allImages.push(hotel.thumbnail);
  if (allImages.length === 0) allImages.push('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg');

  const headerBg = allImages[0] || hotel.thumbnail || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg';

  // Multi-room config
  const roomConfigsParam = searchParams?.get("roomConfigs");
  const roomConfigs = roomConfigsParam
    ? (() => {
        try { return JSON.parse(roomConfigsParam); }
        catch (e) { return [{ adults: parseInt(searchParams?.get("adults") || "2"), children: 0 }]; }
      })()
    : [{ adults: parseInt(searchParams?.get("adults") || "2"), children: 0 }];
  const isMultiRoom = roomConfigs.length > 1;

  // Filter rates for each room
  const filterRate = (rate) => {
    const isFree = rate.rateClass !== 'NRF' && rate.cancellationPolicies?.length > 0 &&
      (parseFloat(rate.cancellationPolicies[0]?.amount || 0) === 0 || new Date() < new Date(rate.cancellationPolicies[0].from));

    // Search results filters
    if (selectedBoards.length > 0 && !selectedBoards.includes(rate.boardName)) return false;
    if (selectedCancellation === "free" && !isFree) return false;
    if (selectedCancellation === "nonrefundable" && (rate.rateClass !== 'NRF' && isFree)) return false;
    if (selectedCancellation === "partial" && !(!isFree && rate.rateClass !== 'NRF')) return false;
    if (selectedPackaging === "with" && !rate.packaging) return false;
    if (selectedPackaging === "without" && rate.packaging) return false;
    if (selectedPromos.length > 0) {
      const ratePromos = (rate.promotions || rate.offers || []).map(p => p.name || p.code).filter(Boolean);
      if (!selectedPromos.some(p => ratePromos.includes(p))) return false;
    }
    const ratePrice = parseFloat(rate.net);
    const ratePkr = convert ? (convert(ratePrice) || ratePrice) : ratePrice;
    if (priceMin && ratePkr < parseFloat(priceMin)) return false;
    if (priceMax && ratePkr > parseFloat(priceMax)) return false;

    // Modal quick rate filter pills
    if (rateFilter === 'breakfast' && !rate.boardName.toLowerCase().includes('breakfast')) return false;
    if (rateFilter === 'free_cancel' && !isFree) return false;
    if (rateFilter === 'packages' && !rate.packaging) return false;

    return true;
  };

  const handleSelectRateForRoom = (room, rate) => {
    if (isMultiRoom) {
      setRoomSelections(prev => {
        const next = { ...prev, [activeRoomTab]: { room, rate } };
        // Auto-advance to next unselected tab
        const nextUnselected = roomConfigs.findIndex((_, i) => i > activeRoomTab && !next[i]);
        if (nextUnselected !== -1) setActiveRoomTab(nextUnselected);
        return next;
      });
    } else {
      if (onAddToCart) onAddToCart(hotel, room, rate);
    }
  };

  const multiRoomTotal = Object.values(roomSelections || {}).reduce(
    (sum, sel) => sum + parseFloat(sel?.rate?.net || 0),
    0
  );
  const allRoomsSelected = isMultiRoom && Object.keys(roomSelections || {}).length >= roomConfigs.length;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER WITH HOTEL PICTURE BACKGROUND ── */}
        <div className="relative flex-shrink-0 text-white overflow-hidden min-h-[170px] sm:min-h-[190px] flex flex-col justify-between p-4 sm:p-5">
          {/* Background Image */}
          <img
            src={headerBg}
            alt={hotel.name}
            className="absolute inset-0 w-full h-full object-cover select-none"
            onError={(e) => { e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'; }}
          />
          {/* Deep dark gradient overlay for crystal clear contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35 backdrop-blur-[0.5px]" />

          {/* Top Bar inside Header: Category/Stars + View Photos button + Close button */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {hotel.category && (
                <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md text-white rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/25">
                  {hotel.category}
                </span>
              )}
              <div className="flex items-center gap-0.5">
                {[...Array(hotel.stars || 5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current drop-shadow" />
                ))}
              </div>
              {hotel.rating && (
                <span className="text-[11px] font-bold bg-amber-500/90 text-white px-2 py-0.5 rounded-full shadow-sm">
                  ★ {hotel.rating}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* "View Photos" Button in Header */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (openGallery) openGallery(0);
                }}
                className="px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                title="View all photos in gallery"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-300" />
                <span>View Photos ({allImages.length})</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Bar inside Header: Hotel Name, Address & Price */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-4">
            <div className="min-w-0 flex-1 pr-2">
              <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight drop-shadow line-clamp-2">
                {hotel.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-white/90 mt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
                <span className="truncate">{hotel.address || hotel.zone}</span>
                {hotel.zone && <span className="text-white/60 hidden sm:inline">· {hotel.zone}</span>}
              </div>
            </div>

            {/* Starting Price Header Badge */}
            <div className="text-left sm:text-right flex-shrink-0">
              <span className="text-[10px] text-white/70 block uppercase tracking-wider font-semibold">from</span>
              <div className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow">
                {hotel.currency || 'EUR'} {parseFloat(hotel.price || 0).toFixed(0)}
              </div>
              {formatPKR && formatPKR(parseFloat(hotel.price || 0)) && (
                <div className="text-[11px] text-white/80 font-medium">
                  ≈ {formatPKR(parseFloat(hotel.price || 0))}
                </div>
              )}
              <div className="text-[10px] text-white/70">{nights} {nights === 1 ? 'night' : 'nights'}</div>
            </div>
          </div>
        </div>

        {/* ── OPTION A: SEGMENTED NAVIGATION TABS ── */}
        <div className="flex-shrink-0 px-4 sm:px-6 border-b border-gray-200 bg-white flex items-center gap-1 sm:gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { id: 'rooms', label: `Rooms & Rates (${hotel.rooms?.length || 0})` },
            { id: 'overview', label: 'Hotel Highlights' },
            { id: 'facilities', label: 'Facilities & Amenities' },
            { id: 'policies', label: 'Policies & Taxes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SCROLLABLE TAB BODY ── */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6" style={{ scrollbarWidth: 'thin' }}>

          {/* ────── TAB 1: ROOMS & RATES ────── */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              {/* Multi-Room Stepper Banner */}
              {isMultiRoom && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-900">Configuring:</span>
                    <div className="flex gap-1.5 overflow-x-auto">
                      {roomConfigs.map((cfg, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveRoomTab(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeRoomTab === idx
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          Room {idx + 1}
                          <span className="text-[10px] ml-1 opacity-80">({cfg.adults}A{cfg.children > 0 ? `+${cfg.children}C` : ''})</span>
                          {roomSelections[idx] && <CheckCircle className="w-3 h-3 ml-1 inline text-green-300" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-blue-700 font-medium">
                    {roomSelections[activeRoomTab]
                      ? `Selected: ${roomSelections[activeRoomTab].room.name}`
                      : `Select a rate for Room ${activeRoomTab + 1}`}
                  </span>
                </div>
              )}

              {/* Quick Rate Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <span className="text-xs text-gray-400 font-medium flex-shrink-0">Filter rates:</span>
                {[
                  { id: 'all', label: 'All Rates' },
                  { id: 'breakfast', label: '🍳 Breakfast Included' },
                  { id: 'free_cancel', label: '🛡️ Free Cancellation' },
                  { id: 'packages', label: '✨ Package Deals' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setRateFilter(f.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex-shrink-0 cursor-pointer ${
                      rateFilter === f.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Room Cards List */}
              <div className="space-y-4">
                {hotel.rooms && hotel.rooms.length > 0 ? (
                  hotel.rooms.map(room => {
                    const filteredRates = (room.rates || []).filter(filterRate);
                    if (filteredRates.length === 0) return null;

                    // Find room image if available
                    const roomImages = (hotel.images || [])
                      .filter(img => img.roomCode === room.code)
                      .map(img => img.path ? `https://photos.hotelbeds.com/giata/original/${img.path}` : null)
                      .filter(Boolean);
                    const roomImg = roomImages[0] || headerBg;

                    return (
                      <div key={room.code} id={`room-${room.code}`} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow transition-shadow">
                        {/* Room Meta Banner */}
                        <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {roomImg && (
                              <div
                                className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border border-gray-200"
                                onClick={() => openGallery && openGallery(0)}
                                title="Click to view room photos"
                              >
                                <img src={roomImg} alt={room.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Bed className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <h3 className="text-sm font-bold text-gray-900 truncate">{room.name}</h3>
                                {onSelectRoomDetail && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onSelectRoomDetail(room); }}
                                    className="p-1 hover:bg-blue-50 text-blue-500 rounded transition-colors"
                                    title="View room specifications & facilities"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-500 block truncate">
                                Code: {room.code} · {filteredRates.length} rate option{filteredRates.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rates under this Room */}
                        <div className="divide-y divide-gray-100">
                          {filteredRates.map((rate, idx) => {
                            const totalEur = parseFloat(rate.net);
                            const perNightEur = nights > 0 ? totalEur / nights : totalEur;
                            const hasFreeCancellation = rate.rateClass !== 'NRF' && rate.cancellationPolicies?.length > 0 &&
                              (parseFloat(rate.cancellationPolicies[0]?.amount || 0) === 0 || new Date() < new Date(rate.cancellationPolicies[0].from));
                            const isSelectedForTab = isMultiRoom &&
                              roomSelections[activeRoomTab]?.room?.code === room.code &&
                              roomSelections[activeRoomTab]?.rate?.rateKey === rate.rateKey;

                            return (
                              <div
                                key={rate.rateKey || idx}
                                className={`p-4 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                                  isSelectedForTab ? 'bg-blue-50/80 ring-1 ring-blue-300' : 'hover:bg-gray-50/50'
                                }`}
                              >
                                {/* Left: Rate Inclusions & Badges */}
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                                      {rate.boardName}
                                    </span>

                                    {hasFreeCancellation ? (
                                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                        <CheckCircle className="w-3 h-3" /> Free Cancellation
                                      </span>
                                    ) : rate.rateClass === 'NRF' ? (
                                      <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> Non-Refundable
                                      </span>
                                    ) : null}

                                    {rate.packaging && (
                                      <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                        Package Deal
                                      </span>
                                    )}

                                    {isSelectedForTab && (
                                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                        ✓ Selected for Room {activeRoomTab + 1}
                                      </span>
                                    )}
                                  </div>

                                  {/* Availability & Payment meta */}
                                  <div className="text-[11px] text-gray-500 flex items-center gap-2 flex-wrap">
                                    <span>{rate.paymentType === 'AT_WEB' ? 'Pay Online Now' : rate.paymentType === 'AT_HOTEL' ? 'Pay at Hotel Property' : rate.paymentType}</span>
                                    <span>·</span>
                                    <span>{rate.allotment} room{rate.allotment !== 1 ? 's' : ''} left at this rate</span>
                                  </div>

                                  {/* Promotional Offers */}
                                  {rate.offers && rate.offers.length > 0 && (
                                    <div className="flex gap-1 flex-wrap pt-0.5">
                                      {rate.offers.map((offer, oi) => (
                                        <span key={oi} className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full flex items-center gap-1 font-semibold border border-amber-200">
                                          <Tag className="w-2.5 h-2.5" />
                                          {offer.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Cancellation date details */}
                                  {rate.cancellationPolicies && rate.cancellationPolicies.length > 0 && (
                                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                      <span>
                                        {formatCancellationPolicy
                                          ? formatCancellationPolicy(rate.cancellationPolicies)
                                          : (rate.cancellationPolicies[0]?.text || "Standard cancellation rules apply")}
                                      </span>
                                    </div>
                                  )}

                                  {/* Mandatory Hotelbeds Excluded Local Taxes Alert */}
                                  {rate.taxes && rate.taxes.taxes && rate.taxes.taxes.length > 0 && !rate.taxes.allIncluded && (
                                    <div className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                      <span>
                                        Excluded: {rate.taxes.taxes[0]?.subType || rate.taxes.taxes[0]?.type || 'City Tax'}{' '}
                                        {rate.taxes.taxes[0]?.currency} {parseFloat(rate.taxes.taxes[0]?.amount || 0).toFixed(2)} (payable locally at property)
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Right: Price & CTA Button */}
                                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-3 pt-2 md:pt-0 border-t md:border-0 border-gray-100 flex-shrink-0">
                                  <div>
                                    <div className="text-lg font-extrabold text-blue-600">
                                      {hotel.currency || 'EUR'} {totalEur.toFixed(2)}
                                    </div>
                                    <div className="text-[11px] text-gray-400">
                                      {hotel.currency || 'EUR'} {perNightEur.toFixed(0)} / night · {nights}n
                                    </div>
                                    {formatPKR && formatPKR(totalEur) && (
                                      <div className="text-[11px] text-gray-500 font-medium">
                                        ≈ {formatPKR(totalEur)}
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectRateForRoom(room, rate);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                                      isSelectedForTab
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                  >
                                    {isMultiRoom ? (
                                      isSelectedForTab ? (
                                        <><CheckCircle className="w-3.5 h-3.5" /> Selected</>
                                      ) : (
                                        `Select for Room ${activeRoomTab + 1}`
                                      )
                                    ) : (
                                      <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    No rooms available for the selected dates.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────── TAB 2: OVERVIEW & HIGHLIGHTS ────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Hotel Description */}
              {hotelContentData?.description && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase text-gray-700">About the Property</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{hotelContentData.description}</p>
                </div>
              )}

              {/* Photo Preview Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-gray-700">Photo Gallery Preview</h4>
                  <button
                    onClick={() => openGallery && openGallery(0)}
                    className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    View all {allImages.length} photos in gallery →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allImages.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => openGallery && openGallery(i)}
                      className="aspect-video rounded-xl overflow-hidden cursor-pointer bg-gray-100 relative group"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      {i === 3 && allImages.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                          +{allImages.length - 4} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* General Amenities Chips */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-700">Popular Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────── TAB 3: FACILITIES & AMENITIES (HOTELBEDS COMPLIANT) ────── */}
          {activeTab === 'facilities' && (
            <div className="space-y-5">
              {/* Hotelbeds Mandatory: Paid Facilities with indFee === true */}
              {hotelContentData?.facilities && hotelContentData.facilities.filter(f => f.indFee === true).length > 0 && (
                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    Facilities with Additional Charges (Payable at Property)
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Hotelbeds Transparency Notice: The following services are optional and incur additional fees payable directly to the property upon use.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hotelContentData.facilities.filter(f => f.indFee === true).map((f, i) => (
                      <span key={`paid-${i}`} className="text-[11px] px-2.5 py-1 bg-white text-amber-900 rounded-lg border border-amber-200 font-medium shadow-2xs">
                        {f.description || `Facility ${f.code}`} (Extra Fee)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Complimentary Hotel Facilities */}
              {hotelContentData?.facilities && hotelContentData.facilities.filter(f => f.indFee !== true).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    Complimentary Inclusions (No Extra Fee)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {hotelContentData.facilities.filter(f => f.indFee !== true).slice(0, 20).map((f, i) => (
                      <div key={`free-${i}`} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{f.description || `Facility ${f.code}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────── TAB 4: POLICIES & TAXES ────── */}
          {activeTab === 'policies' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <h5 className="text-xs font-bold text-gray-900 uppercase">Check-in & Check-out</h5>
                  <p className="text-xs text-gray-600">Check-in: 15:00 · Check-out: 12:00 PM</p>
                  <p className="text-[11px] text-gray-400">Front desk operates 24 hours.</p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <h5 className="text-xs font-bold text-amber-900 uppercase">Local Tourist Taxes</h5>
                  <p className="text-xs text-amber-800">
                    City or municipal tourist taxes are excluded from the initial online payment and must be settled upon arrival at the property.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <h5 className="text-xs font-bold text-blue-900 uppercase">Instant Booking Guarantee</h5>
                <p className="text-xs text-blue-800">
                  Direct Hotelbeds confirmed booking voucher is generated immediately upon successful transaction.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── STICKY BOTTOM DOCK (OPTION A) ── */}
        <div className="flex-shrink-0 p-4 px-6 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-400 block">
              {isMultiRoom
                ? `Selected ${Object.keys(roomSelections || {}).length} of ${roomConfigs.length} rooms`
                : `Stay Total for ${nights} nights`}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">
                {hotel.currency || 'EUR'}{' '}
                {isMultiRoom
                  ? multiRoomTotal.toFixed(2)
                  : (parseFloat(hotel.price || 0) * nights).toFixed(2)}
              </span>
              {formatPKR && (
                <span className="text-xs font-semibold text-gray-500">
                  ≈ {formatPKR(isMultiRoom ? multiRoomTotal : parseFloat(hotel.price || 0) * nights)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('rooms')}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Browse Rooms
            </button>

            {isMultiRoom ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMultiRoomAddToCart) {
                    onMultiRoomAddToCart(hotel, roomSelections, roomConfigs);
                  }
                }}
                disabled={!allRoomsSelected}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  allRoomsSelected
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Add All {roomConfigs.length} Rooms
                {!allRoomsSelected && (
                  <span className="text-[10px] opacity-75">
                    ({Object.keys(roomSelections || {}).length}/{roomConfigs.length})
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Select first available rate or scroll to rooms
                  if (hotel.rooms?.[0]?.rates?.[0] && onAddToCart) {
                    onAddToCart(hotel, hotel.rooms[0], hotel.rooms[0].rates[0]);
                  } else {
                    setActiveTab('rooms');
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailModal;
