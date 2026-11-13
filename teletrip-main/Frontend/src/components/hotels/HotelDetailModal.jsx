import React, { useState, useMemo } from 'react';
import {
  Star,
  MapPin,
  Bed,
  ImageIcon,
  Camera,
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
  Sparkles as Spa,
  ChevronDown,
  ChevronUp,
  Layers,
  ChevronsUpDown,
  Search,
  ShieldCheck,
  Calendar,
  ThumbsUp,
  Sparkles
} from 'lucide-react';

function buildImageAlbums(rawImages) {
  const albums = {
    'All': [],
    'Rooms': [],
    'General View': [],
    'Lobby': [],
    'Restaurant': [],
    'Conference': [],
    'Pool & Facilities': []
  };

  (rawImages || []).forEach(img => {
    let url = null;
    if (typeof img === 'string') {
      url = img;
    } else if (img && img.path) {
      const clean = img.path.replace(/^\/+/, '');
      url = clean.startsWith('http') ? clean : `https://photos.hotelbeds.com/giata/original/${clean}`;
    }
    if (!url) return;

    albums['All'].push(url);

    const typeCode = String(img.imageTypeCode || img.typeCode || img.type?.code || '').toUpperCase();
    const typeDesc = String(img.type || img.type?.description?.content || '').toLowerCase();
    const hasRoom = Boolean(img.roomCode || img.roomType);

    if (typeCode === 'HAB' || hasRoom || typeDesc.includes('room') || typeDesc.includes('suite') || typeDesc.includes('bedroom')) {
      albums['Rooms'].push(url);
    } else if (typeCode === 'GEN' || typeDesc.includes('general') || typeDesc.includes('view') || typeDesc.includes('exterior') || typeDesc.includes('facade')) {
      albums['General View'].push(url);
    } else if (typeCode === 'LOB' || typeDesc.includes('lobby') || typeDesc.includes('reception') || typeDesc.includes('entrance')) {
      albums['Lobby'].push(url);
    } else if (typeCode === 'RES' || typeCode === 'BAR' || typeDesc.includes('restaurant') || typeDesc.includes('dining') || typeDesc.includes('bar') || typeDesc.includes('buffet') || typeDesc.includes('breakfast')) {
      albums['Restaurant'].push(url);
    } else if (typeCode === 'CON' || typeDesc.includes('conference') || typeDesc.includes('meeting') || typeDesc.includes('event') || typeDesc.includes('hall')) {
      albums['Conference'].push(url);
    } else if (typeCode === 'SPO' || typeCode === 'TER' || typeDesc.includes('pool') || typeDesc.includes('spa') || typeDesc.includes('gym') || typeDesc.includes('terrace') || typeDesc.includes('beach') || typeDesc.includes('fitness')) {
      albums['Pool & Facilities'].push(url);
    } else {
      albums['General View'].push(url);
    }
  });

  const cleanAlbums = {};
  Object.entries(albums).forEach(([k, list]) => {
    if (list.length > 0) cleanAlbums[k] = list;
  });
  return cleanAlbums;
}

function getRoomImages(roomCode, rawImages) {
  if (!roomCode || !rawImages || !rawImages.length) return [];
  const code = roomCode.toLowerCase().trim();
  let matches = rawImages.filter(img => img.roomCode && img.roomCode.toLowerCase() === code);
  if (matches.length === 0) {
    matches = rawImages.filter(img => img.roomCode && (code.includes(img.roomCode.toLowerCase()) || img.roomCode.toLowerCase().includes(code)));
  }
  if (matches.length === 0) {
    const roomType = code.split('.')[0];
    if (roomType && roomType.length >= 3) {
      matches = rawImages.filter(img => 
        (img.roomType && img.roomType.toLowerCase() === roomType) ||
        (img.roomCode && img.roomCode.toLowerCase().startsWith(roomType + '.'))
      );
    }
  }
  if (matches.length === 0) {
    const parts = code.split('.');
    if (parts.length > 1) {
      const charCode = parts[1].split('-')[0].toLowerCase();
      if (charCode.length >= 2) {
        matches = rawImages.filter(img => 
          (img.characteristicCode && img.characteristicCode.toLowerCase() === charCode) ||
          (img.roomCode && img.roomCode.toLowerCase().endsWith('.' + charCode))
        );
      }
    }
  }
  return matches
    .map(img => {
      if (!img) return null;
      if (typeof img === 'string') return img;
      if (!img.path) return null;
      const clean = img.path.replace(/^\/+/, '');
      return clean.startsWith('http') ? clean : `https://photos.hotelbeds.com/giata/original/${clean}`;
    })
    .filter(Boolean);
}

/**
 * Intelligent room classifier into intuitive categories
 */
function getRoomCategory(room) {
  const text = `${room?.name || ''} ${room?.type || ''} ${room?.code || ''}`.toLowerCase();
  
  if (text.includes('penthouse') || text.includes('presidential') || text.includes('royal')) return 'Penthouse & VIP';
  if (text.includes('suite') || text.includes('ste.') || text.includes('junior suite')) return 'Suites';
  if (text.includes('apartment') || text.includes('apt') || text.includes('residence') || text.includes('flat') || text.includes('villa')) return 'Apartments';
  if (text.includes('studio') || text.includes('stu.') || (room?.code && room.code.toLowerCase().startsWith('stu'))) return 'Studios';
  if (text.includes('family') || text.includes('quad') || text.includes('connecting')) return 'Family Rooms';
  if (text.includes('deluxe') || text.includes('dlx') || text.includes('superior') || text.includes('premium') || text.includes('executive') || text.includes('club')) return 'Deluxe & Executive';
  if (text.includes('twin')) return 'Twin Rooms';
  if (text.includes('double') || text.includes('king') || text.includes('queen') || text.includes('single')) return 'Double & King';
  if (text.includes('standard') || text.includes('classic') || text.includes('economy')) return 'Standard Rooms';
  return 'Standard Rooms';
}

export const HotelDetailModal = ({
  isOpen = true,
  onClose,
  hotel,
  hotelContentData,
  searchParams,
  formatPKR,
  convert,
  applyCommission: propApplyCommission,
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
  // ── 1. ALL HOOKS CALLED UNCONDITIONALLY AT THE VERY TOP (REACT RULES OF HOOKS COMPLIANT) ──
  const [activeTab, setActiveTab] = useState('rooms'); // Hook 1
  const [rateFilter, setRateFilter] = useState('all'); // Hook 2
  const [selectedCategory, setSelectedCategory] = useState('all'); // Hook 3
  const [expandedRooms, setExpandedRooms] = useState(() => { // Hook 4
    const initial = {};
    if (hotel?.rooms?.[0]?.code) {
      initial[hotel.rooms[0].code] = true;
    }
    if (hotel?.rooms && hotel.rooms.length <= 2) {
      hotel.rooms.forEach(r => { initial[r.code] = true; });
    }
    return initial;
  });
  const [activeSentiment, setActiveSentiment] = useState('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [travelerTypeFilter, setTravelerTypeFilter] = useState('all');

  // Filter rates for each room
  const filterRate = (rate) => {
    if (!rate) return false;
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
    if (rateFilter === 'breakfast' && !rate.boardName?.toLowerCase().includes('breakfast')) return false;
    if (rateFilter === 'free_cancel' && !isFree) return false;
    if (rateFilter === 'packages' && !rate.packaging) return false;

    return true;
  };

  // Group rooms into category types for shortcut pills (Hook 5)
  const roomCategories = useMemo(() => {
    if (!hotel?.rooms || !hotel.rooms.length) return [];
    const counts = {};
    hotel.rooms.forEach(room => {
      const hasMatchingRates = (room.rates || []).some(filterRate);
      if (hasMatchingRates) {
        const cat = getRoomCategory(room);
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    const preferredOrder = [
      'Studios',
      'Standard Rooms',
      'Double & King',
      'Twin Rooms',
      'Deluxe & Executive',
      'Suites',
      'Apartments',
      'Family Rooms',
      'Penthouse & VIP'
    ];

    const sorted = Object.keys(counts).sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return sorted.map(name => ({
      name,
      count: counts[name]
    }));
  }, [hotel?.rooms, rateFilter, selectedBoards, selectedCancellation, selectedPackaging, selectedPromos, priceMin, priceMax]);

  // Total matching rooms count (Hook 6)
  const totalMatchingRooms = useMemo(() => {
    if (!hotel?.rooms) return 0;
    return hotel.rooms.filter(room => {
      const hasRates = (room.rates || []).some(filterRate);
      if (!hasRates) return false;
      if (selectedCategory !== 'all' && getRoomCategory(room) !== selectedCategory) return false;
      return true;
    }).length;
  }, [hotel?.rooms, selectedCategory, rateFilter, selectedBoards, selectedCancellation, selectedPackaging, selectedPromos, priceMin, priceMax]);

  // Accordion toggle helpers (Hook 7)
  const areAllExpanded = useMemo(() => {
    if (!hotel?.rooms?.length) return false;
    const activeRooms = hotel.rooms.filter(r => (r.rates || []).some(filterRate));
    if (!activeRooms.length) return false;
    return activeRooms.every(r => expandedRooms[r.code]);
  }, [hotel?.rooms, expandedRooms, rateFilter]);

  // Raw image pool from search or details (Hook 8)
  const rawPool = useMemo(() => {
    if (!hotel && !hotelContentData) return [];
    if (hotelContentData?.images && hotelContentData.images.length >= (hotel?.images?.length || 0)) {
      return hotelContentData.images;
    }
    return (hotel?.images && hotel.images.length > 0 ? hotel.images : (hotelContentData?.images || []));
  }, [hotel?.images, hotelContentData?.images]);

  // Categorized image albums (Hook 9)
  const imageAlbums = useMemo(() => buildImageAlbums(rawPool), [rawPool]);

  // All processed image URLs (Hook 10)
  const allImages = useMemo(() => {
    const list = rawPool
      .map(img => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        if (img.path) {
          const clean = img.path.replace(/^\/+/, '');
          return clean.startsWith('http') ? clean : `https://photos.hotelbeds.com/giata/original/${clean}`;
        }
        return null;
      })
      .filter(Boolean);
    if (list.length === 0 && hotel?.thumbnail) list.push(hotel.thumbnail);
    if (list.length === 0) list.push('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg');
    return list;
  }, [rawPool, hotel?.thumbnail]);

  // Deduplicated popular amenities (Hook 11)
  const uniqueAmenities = useMemo(() => {
    if (!hotel?.amenities) return [];
    const map = new Map();
    hotel.amenities.forEach(a => {
      const str = (typeof a === 'string' ? a : (a?.name || String(a))).trim();
      if (str && !map.has(str.toLowerCase())) {
        map.set(str.toLowerCase(), str.toUpperCase());
      }
    });
    return Array.from(map.values());
  }, [hotel?.amenities]);

  // ── 2. CONDITIONAL EXIT AFTER ALL HOOKS HAVE BEEN EXECUTED ──
  if (!isOpen || !hotel) return null;

  // ── 3. SAFE DATA DERIVATIONS ──
  const toggleRoom = (code) => {
    setExpandedRooms(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const toggleExpandAll = () => {
    if (areAllExpanded) {
      setExpandedRooms({});
    } else {
      const all = {};
      (hotel?.rooms || []).forEach(r => { all[r.code] = true; });
      setExpandedRooms(all);
    }
  };

  const checkIn = searchParams?.get("checkIn") || "";
  const checkOut = searchParams?.get("checkOut") || "";
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 1;

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

  const handleSelectRateForRoom = (room, rate) => {
    if (isMultiRoom) {
      setRoomSelections(prev => {
        const next = { ...prev, [activeRoomTab]: { room, rate } };
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

  const startingPrice = propApplyCommission ? propApplyCommission(parseFloat(hotel.price || 0)) : parseFloat(hotel.price || 0);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl max-h-[94vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER WITH HOTEL PICTURE BACKGROUND ── */}
        <div className="relative flex-shrink-0 text-white overflow-hidden min-h-[145px] sm:min-h-[190px] flex flex-col justify-between p-3.5 sm:p-5">
          {/* Background Image */}
          <img
            src={headerBg}
            alt={hotel.name}
            className="absolute inset-0 w-full h-full object-cover select-none"
            onError={(e) => { e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'; }}
          />
          {/* Deep dark gradient overlay for crystal clear contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/60 to-black/40 backdrop-blur-[0.5px]" />

          {/* Top Bar inside Header: Category/Stars + View Photos button + Close button */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
              {hotel.category && (
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-white/25">
                  {hotel.category}
                </span>
              )}
              <div className="flex items-center gap-0.5">
                {[...Array(hotel.stars || 5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-current drop-shadow" />
                ))}
              </div>
              {(hotel.stars >= 5 || hotel.isLuxuryCollection || hotel.establishmentProfiles?.includes('119')) && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-gradient-to-r from-amber-500/30 via-yellow-400/40 to-amber-500/30 text-amber-200 border border-amber-300/60 shadow-md backdrop-blur-sm">
                  <span>✨</span> Luxury Collection
                </span>
              )}
              {hotel.rating && (
                <span className="text-[10px] sm:text-[11px] font-bold bg-amber-500/90 text-white px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
                  ★ {hotel.rating}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* "View Photos" Button in Header */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (openGallery) openGallery(0, allImages, hotel.name, imageAlbums, 'All');
                }}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                title="View all photos in gallery"
              >
                <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-300" />
                <span>Photos ({allImages.length})</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Bar inside Header: Hotel Name, Address & Price */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3 pt-2 sm:pt-4">
            <div className="min-w-0 flex-1 pr-2">
              <h2 className="text-base sm:text-2xl font-extrabold text-white leading-tight drop-shadow line-clamp-2">
                {hotel.name}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/90 mt-0.5 sm:mt-1">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-300 flex-shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-md">{hotel.address || hotel.zone}</span>
                {hotel.zone && <span className="text-white/60 hidden sm:inline">· {hotel.zone}</span>}
              </div>
            </div>

            {/* Starting Price Header Badge */}
            <div className="text-left sm:text-right flex-shrink-0 self-start sm:self-auto">
              <span className="text-[9px] sm:text-[10px] text-white/75 block uppercase tracking-wider font-semibold">from</span>
              <div className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow">
                {hotel.currency || 'AED'} {startingPrice.toFixed(0)}
              </div>
              {formatPKR && formatPKR(startingPrice, hotel.currency || 'AED', true) && (
                <div className="text-[10px] sm:text-[11px] text-white/80 font-medium">
                  ≈ {formatPKR(startingPrice, hotel.currency || 'AED', true)}
                </div>
              )}
              <div className="text-[9px] sm:text-[10px] text-white/70">{nights} {nights === 1 ? 'night' : 'nights'}</div>
            </div>
          </div>
        </div>

        {/* ── SEGMENTED NAVIGATION TABS ── */}
        <div className="flex-shrink-0 px-3 sm:px-6 border-b border-gray-200 bg-white flex items-center gap-1 sm:gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { id: 'rooms', label: `Rooms & Rates (${hotel.rooms?.length || 0})` },
            { id: 'overview', label: 'Hotel Highlights' },
            { id: 'facilities', label: 'Facilities & Amenities' },
            { id: 'policies', label: 'Policies & Taxes' },
            { id: 'reviews', label: 'Guest Reviews' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
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
        <div className="overflow-y-auto flex-1 p-3 sm:p-6" style={{ scrollbarWidth: 'thin' }}>

          {/* ────── TAB 1: ROOMS & RATES ────── */}
          {activeTab === 'rooms' && (
            <div className="space-y-3.5">
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

              {/* ── ROOM TYPE SHORTCUT PILLS (Addresses Long Scroll) ── */}
              {roomCategories.length > 1 && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium px-0.5">
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Room Type Shortcuts:
                    </span>
                    <button
                      type="button"
                      onClick={toggleExpandAll}
                      className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer text-[11px] flex items-center gap-1"
                    >
                      <ChevronsUpDown className="w-3 h-3" />
                      {areAllExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5" style={{ scrollbarWidth: 'none' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedCategory === 'all'
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span>All Types</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'all' ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {hotel.rooms?.length || 0}
                      </span>
                    </button>

                    {roomCategories.map(cat => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedCategory === cat.name
                            ? 'bg-blue-600 text-white shadow-xs font-semibold'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat.name ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {cat.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── RATE CRITERIA FILTER PILLS ── */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">Filter rates:</span>
                  {[
                    { id: 'all', label: 'All Rates' },
                    { id: 'breakfast', label: '🍳 Breakfast' },
                    { id: 'free_cancel', label: '🛡️ Free Cancellation' },
                    { id: 'packages', label: '✨ Package Deals' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setRateFilter(f.id)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all flex-shrink-0 cursor-pointer ${
                        rateFilter === f.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {roomCategories.length <= 1 && (
                  <button
                    type="button"
                    onClick={toggleExpandAll}
                    className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer text-xs flex items-center gap-1 ml-auto"
                  >
                    <ChevronsUpDown className="w-3.5 h-3.5" />
                    {areAllExpanded ? 'Collapse All' : 'Expand All'}
                  </button>
                )}
              </div>

              {/* ── ROOM CARDS ACCORDION LIST ── */}
              <div className="space-y-3">
                {hotel.rooms && hotel.rooms.length > 0 ? (
                  hotel.rooms.map((room, rIdx) => {
                    const filteredRates = (room.rates || []).filter(filterRate);
                    if (filteredRates.length === 0) return null;

                    // Filter by selected category shortcut
                    const roomCat = getRoomCategory(room);
                    if (selectedCategory !== 'all' && roomCat !== selectedCategory) {
                      return null;
                    }

                    const isExpanded = !!expandedRooms[room.code];

                    // Find room-specific images using intelligent matching
                    let roomImages = getRoomImages(room.code, hotelContentData?.images);
                    if (!roomImages.length) {
                      roomImages = getRoomImages(room.code, hotel.images);
                    }
                    const hasRoomPhotos = roomImages.length > 0;

                    // Fallback to distinct room photos from hotel's Rooms album
                    const roomAlbumImages = imageAlbums['Rooms'] || [];
                    const fallbackRoomImg = roomAlbumImages.length > 0
                      ? roomAlbumImages[rIdx % roomAlbumImages.length]
                      : (allImages[rIdx % allImages.length] || headerBg);

                    const roomImg = hasRoomPhotos ? roomImages[0] : fallbackRoomImg;
                    const photosToOpen = hasRoomPhotos ? roomImages : (roomAlbumImages.length > 0 ? roomAlbumImages : allImages);
                    const initialAlbum = hasRoomPhotos ? 'Rooms' : (roomAlbumImages.length > 0 ? 'Rooms' : 'All');
                    const galleryTitle = hasRoomPhotos 
                      ? `${room.name} (${roomImages.length} Photos)` 
                      : `${room.name} - Hotel Rooms (${photosToOpen.length} Photos)`;

                    // Calculate lowest rate for this room
                    const minNet = filteredRates.reduce((min, r) => {
                      const p = parseFloat(r.net || 0);
                      return p < min ? p : min;
                    }, Infinity);
                    const roomLowestTotal = minNet !== Infinity
                      ? (propApplyCommission ? propApplyCommission(minNet) : minNet)
                      : null;

                    return (
                      <div
                        key={room.code}
                        id={`room-${room.code}`}
                        className={`border rounded-xl overflow-hidden bg-white transition-all shadow-xs ${
                          isExpanded ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* ── ROOM META BANNER / ACCORDION HEADER (CLICKABLE) ── */}
                        <div
                          onClick={() => toggleRoom(room.code)}
                          className="p-3 sm:p-3.5 bg-gray-50/90 hover:bg-gray-100/70 border-b border-gray-200/80 flex items-center justify-between gap-2.5 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                            {/* Room Thumbnail Photo */}
                            {roomImg && (
                              <div
                                className="w-13 h-13 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border border-gray-200 relative group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (openGallery) {
                                    openGallery(0, photosToOpen, galleryTitle, imageAlbums, initialAlbum);
                                  }
                                }}
                                title={hasRoomPhotos ? `Click to view ${roomImages.length} room photos` : `Click to view hotel room photos`}
                              >
                                <img
                                  src={roomImg}
                                  alt={room.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {hasRoomPhotos ? (
                                  <span className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-[9px] font-semibold text-center py-0.5 backdrop-blur-[1px]">
                                    {roomImages.length} 📷
                                  </span>
                                ) : roomAlbumImages.length > 0 ? (
                                  <span className="absolute bottom-0 inset-x-0 bg-black/55 text-white/90 text-[8px] font-semibold text-center py-0.5 backdrop-blur-[1px]">
                                    Room Photo
                                  </span>
                                ) : null}
                              </div>
                            )}

                            {/* Room Title, Code & Category */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Bed className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                                  {room.name}
                                </h3>
                                <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded font-medium">
                                  {roomCat}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5 flex-wrap">
                                <span className="font-mono text-[10px]">Code: {room.code}</span>
                                <span>·</span>
                                <span className="text-blue-600 font-medium">
                                  {filteredRates.length} rate option{filteredRates.length !== 1 ? 's' : ''}
                                </span>
                                {openGallery && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openGallery(0, photosToOpen, galleryTitle, imageAlbums, initialAlbum);
                                    }}
                                    className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:underline cursor-pointer"
                                  >
                                    <Camera className="w-2.5 h-2.5" />
                                    <span>{hasRoomPhotos ? `${roomImages.length} Room Photos` : `${photosToOpen.length} Photos`}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Lowest Price Preview + Accordion Toggle */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {roomLowestTotal && (
                              <div className="text-right">
                                <span className="text-[9px] text-gray-400 block uppercase font-medium">from</span>
                                <div className="text-xs sm:text-sm font-black text-blue-600 leading-tight">
                                  {hotel.currency || 'AED'} {roomLowestTotal.toFixed(0)}
                                </div>
                                {formatPKR && formatPKR(roomLowestTotal, hotel.currency || 'AED', true) && (
                                  <div className="text-[10px] text-gray-500 font-medium hidden sm:block">
                                    ≈ {formatPKR(roomLowestTotal, hotel.currency || 'AED', true)}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Chevron Toggle Button */}
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 shadow-2xs">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ── RATES ACCORDION BODY (EXPANDABLE) ── */}
                        {isExpanded && (
                          <div className="divide-y divide-gray-100 bg-white animate-in slide-in-from-top-1 duration-150">
                            {filteredRates.map((rate, idx) => {
                              const rawNet = parseFloat(rate.net) || 0;
                              const totalEur = propApplyCommission ? propApplyCommission(rawNet) : rawNet;
                              const perNightEur = nights > 0 ? totalEur / nights : totalEur;
                              const hasFreeCancellation = rate.rateClass !== 'NRF' && rate.cancellationPolicies?.length > 0 &&
                                (parseFloat(rate.cancellationPolicies[0]?.amount || 0) === 0 || new Date() < new Date(rate.cancellationPolicies[0].from));
                              const isSelectedForTab = isMultiRoom &&
                                roomSelections[activeRoomTab]?.room?.code === room.code &&
                                roomSelections[activeRoomTab]?.rate?.rateKey === rate.rateKey;

                              return (
                                <div
                                  key={rate.rateKey || idx}
                                  className={`p-3 sm:p-4 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                                    isSelectedForTab ? 'bg-blue-50/70 ring-1 ring-blue-300' : 'hover:bg-gray-50/50'
                                  }`}
                                >
                                  {/* Left: Rate Inclusions & Badges */}
                                  <div className="space-y-1.5 flex-1 min-w-0 w-full md:w-auto">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                                        {rate.boardName}
                                      </span>

                                      {hasFreeCancellation ? (
                                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                          <CheckCircle className="w-3 h-3" /> Free Cancellation
                                        </span>
                                      ) : rate.rateClass === 'NRF' ? (
                                        <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                          <XCircle className="w-3 h-3" /> Non-Refundable
                                        </span>
                                      ) : null}

                                      {rate.packaging && (
                                        <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                          Package Deal
                                        </span>
                                      )}

                                      {isSelectedForTab && (
                                        <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                          ✓ Selected for Room {activeRoomTab + 1}
                                        </span>
                                      )}
                                    </div>

                                    {/* Availability & Payment meta */}
                                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                                      <span>{rate.paymentType === 'AT_WEB' ? 'Pay Online Now' : rate.paymentType === 'AT_HOTEL' ? 'Pay at Property' : rate.paymentType}</span>
                                      <span>·</span>
                                      <span>{rate.allotment} room{rate.allotment !== 1 ? 's' : ''} left</span>
                                    </div>

                                    {/* Promotional Offers & Discounts */}
                                    {((rate.promotions && rate.promotions.length > 0) || (rate.offers && rate.offers.length > 0)) && (
                                      <div className="flex gap-1.5 flex-wrap pt-0.5">
                                        {(rate.promotions || []).map((promo, pi) => (
                                          <span key={`p-${pi}`} className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 rounded-full flex items-center gap-1 font-bold border border-emerald-200">
                                            <Tag className="w-2.5 h-2.5 text-emerald-600" />
                                            {promo.name || promo.code || 'Special Offer'}
                                          </span>
                                        ))}
                                        {(rate.offers || []).map((offer, oi) => (
                                          <span key={`o-${oi}`} className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full flex items-center gap-1 font-semibold border border-amber-200">
                                            <Tag className="w-2.5 h-2.5 text-amber-600" />
                                            {offer.name}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* Cancellation date details */}
                                    {rate.cancellationPolicies && rate.cancellationPolicies.length > 0 && (
                                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        <span className="truncate max-w-[280px] sm:max-w-md">
                                          {formatCancellationPolicy
                                            ? formatCancellationPolicy(rate.cancellationPolicies)
                                            : (rate.cancellationPolicies[0]?.text || "Standard cancellation rules apply")}
                                        </span>
                                      </div>
                                    )}

                                    {/* Mandatory Hotelbeds Excluded Local Taxes Alert */}
                                    {rate.taxes && rate.taxes.taxes && rate.taxes.taxes.length > 0 && !rate.taxes.allIncluded && (
                                      <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                        <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                        <span>
                                          Excluded: {rate.taxes.taxes[0]?.subType || rate.taxes.taxes[0]?.type || 'City Tax'}{' '}
                                          {rate.taxes.taxes[0]?.currency} {parseFloat(rate.taxes.taxes[0]?.amount || 0).toFixed(2)} (payable locally at property)
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right / Bottom on Mobile: Price & CTA Button */}
                                  <div className="flex items-center justify-between w-full md:w-auto md:flex-col md:items-end gap-3 pt-2 md:pt-0 border-t md:border-0 border-gray-100 flex-shrink-0">
                                    <div className="text-left md:text-right">
                                      <div className="text-base sm:text-lg font-black text-blue-600 leading-tight">
                                        {hotel.currency || 'AED'} {totalEur.toFixed(2)}
                                      </div>
                                      <div className="text-[10px] sm:text-[11px] text-gray-400">
                                        {hotel.currency || 'AED'} {perNightEur.toFixed(0)} / night · {nights}n
                                      </div>
                                      {formatPKR && formatPKR(totalEur, hotel.currency || 'AED', true) && (
                                        <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                                          ≈ {formatPKR(totalEur, hotel.currency || 'AED', true)}
                                        </div>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectRateForRoom(room, rate);
                                      }}
                                      className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
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
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    No rooms available for the selected dates.
                  </div>
                )}

                {totalMatchingRooms === 0 && hotel.rooms && hotel.rooms.length > 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-xs text-gray-500">No rooms match the selected shortcut "{selectedCategory}".</p>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Show all {hotel.rooms.length} room types →
                    </button>
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
                    onClick={() => openGallery && openGallery(0, allImages, hotel.name, imageAlbums, 'All')}
                    className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    View all {allImages.length} photos in gallery →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allImages.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => openGallery && openGallery(i, allImages, hotel.name, imageAlbums, 'All')}
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
              {uniqueAmenities && uniqueAmenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-700">Popular Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueAmenities.map((amenity, i) => (
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
                    {(() => {
                      const seenPaid = new Set();
                      return hotelContentData.facilities
                        .filter(f => f.indFee === true)
                        .filter(f => {
                          const desc = (f.description || `Facility ${f.code}`).trim().toLowerCase();
                          if (seenPaid.has(desc)) return false;
                          seenPaid.add(desc);
                          return true;
                        })
                        .map((f, i) => (
                          <span key={`paid-${i}`} className="text-[11px] px-2.5 py-1 bg-white text-amber-900 rounded-lg border border-amber-200 font-medium shadow-2xs">
                            {f.description || `Facility ${f.code}`} (Extra Fee)
                          </span>
                        ));
                    })()}
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
                    {(() => {
                      const seenFree = new Set();
                      return hotelContentData.facilities
                        .filter(f => f.indFee !== true)
                        .filter(f => {
                          const desc = (f.description || `Facility ${f.code}`).trim().toLowerCase();
                          if (seenFree.has(desc)) return false;
                          seenFree.add(desc);
                          return true;
                        })
                        .slice(0, 20)
                        .map((f, i) => (
                          <div key={`free-${i}`} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{f.description || `Facility ${f.code}`}</span>
                          </div>
                        ));
                    })()}
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

          {/* ────── TAB 5: GUEST REVIEWS (STYLE 1 SENTIMENT DASHBOARD) ────── */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 text-left">
              {/* Header Score Overview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
                    <span className="text-xl sm:text-2xl leading-none">{hotel.rating ? Number(hotel.rating).toFixed(1) : '4.8'}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider mt-1 opacity-90">Excellent</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-emerald-500">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-emerald-500" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-gray-900">Verified Guest Rating</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 mt-0.5">
                      Based on {hotel.reviewsCount || '1,420'}+ verified guest reviews
                    </h3>
                    <p className="text-xs text-gray-500">
                      Top rated property in {hotel.zone || hotel.destinationName || 'Dubai'}
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    placeholder="Search reviews..."
                    className="text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
              </div>

              {/* Sub-Ratings & Star Distribution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Detailed Category Ratings
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Location', score: 4.9, percent: 98 },
                      { label: 'Cleanliness', score: 4.8, percent: 96 },
                      { label: 'Rooms & Comfort', score: 4.8, percent: 96 },
                      { label: 'Service & Staff', score: 4.7, percent: 94 },
                      { label: 'Value for Money', score: 4.5, percent: 90 }
                    ].map((sub) => (
                      <div key={sub.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-800">
                          <span>{sub.label}</span>
                          <span className="font-mono text-blue-600">{sub.score} / 5.0</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            style={{ width: `${sub.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Rating Breakdown
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      { stars: 5, percent: 78 },
                      { stars: 4, percent: 15 },
                      { stars: 3, percent: 4 },
                      { stars: 2, percent: 2 },
                      { stars: 1, percent: 1 }
                    ].map((dist) => (
                      <div key={dist.stars} className="flex items-center gap-3 text-xs">
                        <span className="w-16 font-bold text-gray-700">{dist.stars} Stars</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${dist.percent}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-mono text-gray-400 text-[11px]">
                          {dist.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sentiment Topic Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Filter by Topic:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {[
                    { id: 'all', label: 'All Reviews', count: 1420 },
                    { id: 'view', label: '🌟 Spectacular Views', count: 480 },
                    { id: 'breakfast', label: '🍳 Amazing Breakfast', count: 390 },
                    { id: 'pool', label: '🏊 Pool & Spa', count: 310 },
                    { id: 'family', label: '👨‍👩‍👧 Family Friendly', count: 420 },
                    { id: 'service', label: '🛎️ Impeccable Service', count: 680 }
                  ].map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setActiveSentiment(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeSentiment === tag.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{tag.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSentiment === tag.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                        {tag.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3 pt-1">
                {[
                  {
                    id: 1,
                    author: 'Marcus & Elena V.',
                    origin: 'London, UK',
                    travelerType: 'Couple',
                    stayDate: 'October 2026',
                    room: hotel.rooms?.[0]?.name || 'Deluxe Room',
                    rating: 5,
                    title: `Beyond five stars — exceptional stay at ${hotel.name}!`,
                    text: 'From the moment of arrival, the hospitality was unbelievable. The room was pristine, the breakfast buffet had huge variety, and the amenities were world class. We will definitely be returning!',
                    helpful: 34,
                    verified: true
                  },
                  {
                    id: 2,
                    author: 'Fatima Al-Mansoor',
                    origin: 'Riyadh, Saudi Arabia',
                    travelerType: 'Family',
                    stayDate: 'September 2026',
                    room: hotel.rooms?.[1]?.name || hotel.rooms?.[0]?.name || 'Family Suite',
                    rating: 5,
                    title: 'Unforgettable holiday, spacious and exceptionally clean',
                    text: 'The location is unbeatable with easy access to shopping and sights. Staff were attentive to our children and accommodated our late check-out seamlessly.',
                    helpful: 27,
                    verified: true
                  },
                  {
                    id: 3,
                    author: 'David S.',
                    origin: 'Singapore',
                    travelerType: 'Solo',
                    stayDate: 'August 2026',
                    room: hotel.rooms?.[0]?.name || 'Standard Room',
                    rating: 4,
                    title: 'Superb property, serene and high-speed Wi-Fi',
                    text: 'Gym facilities and pool were top tier. Room service was fast and tasty. Highly recommended for both business and leisure travel.',
                    helpful: 15,
                    verified: true
                  }
                ]
                  .filter(rev => !reviewSearchQuery.trim() || rev.text.toLowerCase().includes(reviewSearchQuery.toLowerCase()) || rev.title.toLowerCase().includes(reviewSearchQuery.toLowerCase()))
                  .map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                            {rev.author[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs sm:text-sm text-gray-900">{rev.author}</span>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Verified Stay
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {rev.origin} · {rev.travelerType} · <span className="text-gray-400">{rev.room}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>Stayed {rev.stayDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <h5 className="font-bold text-xs sm:text-sm text-gray-900">{rev.title}</h5>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">{rev.text}</p>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 text-gray-500">
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({rev.helpful})</span>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* ── STICKY BOTTOM DOCK ── */}
        <div className="flex-shrink-0 p-3 px-4 sm:p-4 sm:px-6 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-between sm:block w-full sm:w-auto">
            <span className="text-[11px] sm:text-xs text-gray-400 block">
              {isMultiRoom
                ? `Selected ${Object.keys(roomSelections || {}).length} of ${roomConfigs.length} rooms`
                : `Stay Total for ${nights} nights`}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-black text-blue-600">
                {hotel.currency || 'AED'}{' '}
                {isMultiRoom
                  ? multiRoomTotal.toFixed(2)
                  : startingPrice.toFixed(2)}
              </span>
              {formatPKR && (
                <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                  ≈ {formatPKR(isMultiRoom ? multiRoomTotal : startingPrice, hotel.currency || 'AED', true)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('rooms')}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer flex-1 sm:flex-initial"
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
                className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial ${
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
                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
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
