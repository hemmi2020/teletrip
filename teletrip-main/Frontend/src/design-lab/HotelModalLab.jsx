import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Star,
  MapPin,
  Bed,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Layers,
  Camera,
  Tag,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Utensils,
  Sparkles,
  Wifi,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { FeedbackOverlay } from './FeedbackOverlay';
import { DUBAI_HOTEL_FIXTURES } from './fixtures';

export default function HotelModalLab() {
  const [viewportWidth, setViewportWidth] = useState('100%');
  const [selectedStyle, setSelectedStyle] = useState('category_shortcuts'); // 'category_shortcuts' | 'split_matrix' | 'drawer_sheet'
  const [activeCategory, setActiveCategory] = useState('All');
  const [rateFilter, setRateFilter] = useState('all');
  const [expandedRooms, setExpandedRooms] = useState({ 'DLX.KNG': true });
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const sampleHotel = DUBAI_HOTEL_FIXTURES[0]; // Atlantis The Royal

  // Extended rooms fixture for realistic scroll audit (8 distinct room options)
  const fullRooms = [
    {
      code: 'STD.KG',
      name: 'Royal King Guest Room',
      category: 'Standard Rooms',
      size: '55 sqm / 592 sqft',
      bed: '1 Ultra King Bed',
      view: 'Palm Island View',
      photosCount: 6,
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      rates: [
        {
          key: 'r1',
          board: 'Room Only',
          net: 1450,
          freeCancel: true,
          cancelUntil: 'Free cancellation up to 48h before check-in',
          allotment: 4
        },
        {
          key: 'r2',
          board: 'Buffet Breakfast Included',
          net: 1680,
          freeCancel: true,
          cancelUntil: 'Free cancellation up to 48h before check-in',
          promo: '15% Summer Gourmet Offer',
          allotment: 3
        }
      ]
    },
    {
      code: 'DLX.KNG',
      name: 'Seascape Deluxe King Room with Balcony',
      category: 'Deluxe Rooms',
      size: '68 sqm / 731 sqft',
      bed: '1 King Bed + Lounge Area',
      view: 'Arabian Sea Full View',
      photosCount: 8,
      image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      rates: [
        {
          key: 'r3',
          board: 'Room Only',
          net: 1890,
          freeCancel: true,
          cancelUntil: 'Free cancellation up to 3 days before check-in',
          allotment: 2
        },
        {
          key: 'r4',
          board: 'Gourmet Breakfast Included',
          net: 2120,
          freeCancel: true,
          cancelUntil: 'Free cancellation up to 3 days before check-in',
          promo: 'Exclusive Welcome Amenity',
          allotment: 2
        },
        {
          key: 'r5',
          board: 'Half Board (Breakfast & Dinner)',
          net: 2580,
          freeCancel: false,
          cancelUntil: 'Non-Refundable Special Rate',
          promo: 'Dinner at Michelin-Starred Restaurant',
          allotment: 1
        }
      ]
    },
    {
      code: 'DLX.TWN',
      name: 'Palm Deluxe Twin Room with Balcony',
      category: 'Deluxe Rooms',
      size: '68 sqm / 731 sqft',
      bed: '2 Queen Beds',
      view: 'Palm Jumeirah & Skyline',
      photosCount: 5,
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      rates: [
        {
          key: 'r6',
          board: 'Buffet Breakfast Included',
          net: 2050,
          freeCancel: true,
          cancelUntil: 'Free cancellation up to 48h before check-in',
          allotment: 5
        }
      ]
    },
    {
      code: 'STE.JUN',
      name: 'Skyline Junior Suite with Terrace',
      category: 'Suites',
      size: '95 sqm / 1,022 sqft',
      bed: '1 Grand King + Living Room',
      view: 'Dubai Skyline & Marina View',
      photosCount: 11,
      image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg',
      rates: [
        {
          key: 'r7',
          board: 'Club Lounge Access & Breakfast Included',
          net: 3450,
          freeCancel: true,
          cancelUntil: 'Free cancellation up to 7 days before check-in',
          promo: 'VIP Airport Transfer Included',
          allotment: 2
        }
      ]
    },
    {
      code: 'STE.EXE',
      name: 'Sky Terrace Grand Suite with Private Plunge Pool',
      category: 'Suites',
      size: '140 sqm / 1,506 sqft',
      bed: '1 Master Bedroom + Dining Area',
      view: 'Panoramic Palm View',
      photosCount: 14,
      image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg',
      rates: [
        {
          key: 'r8',
          board: 'All-Inclusive Royal Lounge & Butler Service',
          net: 5900,
          freeCancel: true,
          cancelUntil: 'Free cancellation up to 7 days before check-in',
          promo: 'Luxury Collection Signature Experience',
          allotment: 1
        }
      ]
    },
    {
      code: 'FAM.TWO',
      name: 'Two-Bedroom Family Interconnecting Residence',
      category: 'Family Rooms',
      size: '135 sqm / 1,453 sqft',
      bed: '1 King Bed + 2 Twin Beds',
      view: 'Waterpark & Sea View',
      photosCount: 9,
      image: 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg',
      rates: [
        {
          key: 'r9',
          board: 'Breakfast Included + Unlimited Waterpark Access',
          net: 4200,
          freeCancel: true,
          cancelUntil: 'Free cancellation up to 5 days before check-in',
          promo: 'Kids Stay & Dine Free Promotion',
          allotment: 3
        }
      ]
    }
  ];

  const categories = ['All', 'Standard Rooms', 'Deluxe Rooms', 'Suites', 'Family Rooms'];

  const filteredRooms = fullRooms.filter(r => {
    if (activeCategory !== 'All' && r.category !== activeCategory) return false;
    if (rateFilter === 'breakfast') {
      return r.rates.some(rt => rt.board.toLowerCase().includes('breakfast'));
    }
    if (rateFilter === 'free_cancel') {
      return r.rates.some(rt => rt.freeCancel);
    }
    return true;
  });

  const toggleRoom = (code) => {
    setExpandedRooms(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const expandAll = () => {
    const all = {};
    fullRooms.forEach(r => { all[r.code] = true; });
    setExpandedRooms(all);
  };

  const collapseAll = () => {
    setExpandedRooms({});
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-900 flex flex-col font-sans">
      {/* ── TOP CONTROL BAR ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/design-lab"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="Back to Design Lab Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white tracking-widest uppercase">
                  Design Lab 02
                </span>
                <h1 className="text-sm sm:text-base font-extrabold text-gray-900">
                  Hotel Detail & Room Selection Modal Audit
                </h1>
              </div>
              <p className="text-[11px] text-gray-500">
                Solving lengthy room scrolling, category navigation shortcuts, rate cards, and small mobile responsiveness
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Design Direction Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedStyle('category_shortcuts')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'category_shortcuts' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                Style 1: Category Chips & Accordion
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('split_matrix')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'split_matrix' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                Style 2: Matrix Comparison Table
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('drawer_sheet')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'drawer_sheet' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                Style 3: Visual Luxe Bottom Sheet
              </button>
            </div>

            {/* Viewport Width Switcher */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewportWidth('100%')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewportWidth === '100%' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
                title="Desktop View (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportWidth('768px')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewportWidth === '768px' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportWidth('390px')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewportWidth === '390px' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
                title="Mobile View (390px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile (390px)</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── CANVAS VIEWPORT ── */}
      <main className="flex-1 py-8 px-4 flex justify-center items-start">
        <div
          style={{ width: viewportWidth }}
          className="transition-all duration-300 relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200 max-h-[88vh] flex flex-col"
        >
          {/* ── MODAL HEADER WITH HERO PHOTO ── */}
          <div className="relative flex-shrink-0 text-white min-h-[160px] sm:min-h-[200px] flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
            <img
              src={sampleHotel.thumbnail}
              alt={sampleHotel.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35 backdrop-blur-[0.5px]" />

            {/* Top row inside header */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md border border-white/30 uppercase">
                  5 Stars
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500/30 to-yellow-400/40 text-amber-200 border border-amber-300/60 shadow-xs">
                  <span>✨</span> Luxury Collection
                </span>
                <span className="text-[10px] font-bold bg-emerald-600/90 text-white px-2 py-0.5 rounded-full">
                  ★ 4.9 TripAdvisor (1,840 reviews)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/30"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-300" />
                  <span>34 Photos</span>
                </button>
              </div>
            </div>

            {/* Title & Price Header */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                  {sampleHotel.name}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-white/90 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span className="truncate">{sampleHotel.address}</span>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] text-white/75 block uppercase font-bold">from</span>
                <div className="text-xl sm:text-2xl font-black text-white leading-tight">
                  AED 1,450
                </div>
                <div className="text-xs text-amber-300 font-semibold">
                  ≈ PKR 110,200 <span className="text-[10px] text-white/70">/ night</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── STYLE 1: ROOM CATEGORY SHORTCUTS & ACCORDION ── */}
          {selectedStyle === 'category_shortcuts' && (
            <>
              {/* Category Shortcuts Bar */}
              <div className="flex-shrink-0 bg-slate-50 border-b border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Room Type Shortcuts ({fullRooms.length} available):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={expandAll}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      Expand All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={collapseAll}
                      className="text-[11px] text-gray-500 hover:underline cursor-pointer"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {/* Horizontal Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {categories.map((cat) => {
                    const count = cat === 'All' ? fullRooms.length : fullRooms.filter(r => r.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeCategory === cat
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Inclusions Filter */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  <span className="text-[11px] text-gray-400 font-medium shrink-0">Filter rates:</span>
                  {[
                    { id: 'all', label: 'All Rates' },
                    { id: 'breakfast', label: '🍳 Breakfast Included' },
                    { id: 'free_cancel', label: '🛡️ Free Cancellation' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setRateFilter(f.id)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer shrink-0 ${
                        rateFilter === f.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-200/70 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Room Cards List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/50">
                {filteredRooms.map((room) => {
                  const isExpanded = !!expandedRooms[room.code];
                  const lowestRate = Math.min(...room.rates.map(r => r.net));

                  return (
                    <div
                      key={room.code}
                      className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                        isExpanded ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Room Summary Header (Always Visible) */}
                      <div
                        onClick={() => toggleRoom(room.code)}
                        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-white hover:bg-gray-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Room Thumbnail Photo with photo count badge */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-gray-200 relative">
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5">
                              {room.photosCount} photos
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                {room.category}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono">Code: {room.code}</span>
                            </div>

                            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 mt-1 leading-snug truncate">
                              {room.name}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                              <span>📐 {room.size}</span>
                              <span>·</span>
                              <span>🛏️ {room.bed}</span>
                              <span>·</span>
                              <span className="text-blue-600 font-semibold">{room.view}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Lowest Price & Toggle */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[9px] text-gray-400 uppercase font-bold block">from</span>
                            <div className="text-sm sm:text-base font-black text-blue-600 leading-tight">
                              AED {lowestRate.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">
                              ≈ PKR {(lowestRate * 76).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                              {room.rates.length} rate option{room.rates.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Rates Section */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 divide-y divide-gray-100 bg-slate-50/60">
                          {room.rates.map((rate) => (
                            <div
                              key={rate.key}
                              className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white transition-colors"
                            >
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-2xs">
                                    {rate.board}
                                  </span>

                                  {rate.freeCancel ? (
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                      <CheckCircle className="w-3 h-3" /> Free Cancellation
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <XCircle className="w-3 h-3" /> Non-Refundable
                                    </span>
                                  )}

                                  {rate.promo && (
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                                      <Tag className="w-2.5 h-2.5 text-amber-600" />
                                      {rate.promo}
                                    </span>
                                  )}
                                </div>

                                <div className="text-[11px] text-gray-500 flex items-center gap-2 pt-0.5">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span>{rate.cancelUntil}</span>
                                  <span>·</span>
                                  <span className="text-blue-600 font-semibold">{rate.allotment} rooms left</span>
                                </div>
                              </div>

                              {/* Price & Select Rate CTA */}
                              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                                <div className="text-left sm:text-right">
                                  <div className="text-base sm:text-lg font-black text-blue-600 leading-tight">
                                    AED {rate.net.toLocaleString()}
                                  </div>
                                  <div className="text-[10px] text-gray-500 font-medium">
                                    ≈ PKR {(rate.net * 76).toLocaleString()} / night
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setCartCount(c => c + 1)}
                                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  Select Room
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── STYLE 2: MATRIX COMPARISON TABLE ── */}
          {selectedStyle === 'split_matrix' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Matrix View: Compare all room types directly against board options with zero endless scrolling.</span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase font-black text-[10px] border-b border-gray-200">
                      <th className="p-3">Room Type</th>
                      <th className="p-3">Specs</th>
                      <th className="p-3">Room Only</th>
                      <th className="p-3">Breakfast Included</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fullRooms.map((r) => (
                      <tr key={r.code} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img src={r.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <div className="font-extrabold text-gray-900">{r.name}</div>
                              <span className="text-[10px] text-blue-600 font-semibold">{r.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-500 font-medium text-[11px]">
                          <div>{r.size}</div>
                          <div>{r.bed}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-gray-900">AED 1,450</div>
                          <div className="text-[10px] text-emerald-600 font-medium">Free Cancel</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-blue-600">AED 1,680</div>
                          <div className="text-[10px] text-amber-600 font-semibold">Special Offer</div>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => setCartCount(c => c + 1)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700"
                          >
                            Book
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── STYLE 3: VISUAL LUXE BOTTOM SHEET ── */}
          {selectedStyle === 'drawer_sheet' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fullRooms.map((r) => (
                  <div key={r.code} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                    <div className="h-44 relative">
                      <img src={r.image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {r.category}
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                        from AED 1,450
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-extrabold text-sm text-gray-900">{r.name}</h4>
                      <p className="text-xs text-gray-500">{r.size} · {r.bed}</p>
                      <button
                        type="button"
                        onClick={() => setCartCount(c => c + 1)}
                        className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors"
                      >
                        View Rates & Inclusions →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STICKY BOTTOM BOOKING DOCK ── */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3.5 sm:p-4 px-4 sm:px-6 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Stay Total (3 nights)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-2xl font-black text-blue-600">AED 4,350</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-500">≈ PKR 330,600</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Includes all taxes & resort fees</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCartCount(c => c + 1)}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Reserve Room</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-white text-blue-600 rounded-full text-[10px] font-black">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Feedback Inspector */}
      <FeedbackOverlay targetName="HotelDetailModal_Redesign" />
    </div>
  );
}

