import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Search,
  Calendar,
  Users,
  MapPin,
  Building2,
  ChevronDown,
  Sparkles,
  Plane,
  Car,
  Compass,
  CheckCircle,
  Plus,
  Minus,
  Crown,
  Coffee,
  ShieldCheck,
  Palmtree,
  Sunset,
  ArrowRight
} from 'lucide-react';
import { FeedbackOverlay } from './FeedbackOverlay';

export default function HeroSearchLab() {
  const [viewportWidth, setViewportWidth] = useState('100%');
  const [selectedStyle, setSelectedStyle] = useState('bedsonline_unified'); // 'bedsonline_unified' | 'floating_pill' | 'luxury_bento'
  const [activeTab, setActiveTab] = useState('hotels');
  const [query, setQuery] = useState('Dubai');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [childrenCount, setChildrenCount] = useState(1);
  const [childAges, setChildAges] = useState([6]);

  // Luxury Bento specific state
  const [selectedBentoTheme, setSelectedBentoTheme] = useState('palm'); // 'palm' | 'downtown' | 'desert' | 'marina'
  const [selectedDurationPreset, setSelectedDurationPreset] = useState('3n');

  const suggestions = [
    { type: 'city', name: 'Dubai', subtitle: 'United Arab Emirates', count: '1,420 hotels' },
    { type: 'hotel', name: 'Atlantis The Royal', subtitle: 'Palm Jumeirah, Dubai · 5 Stars', count: 'Direct Property' },
    { type: 'hotel', name: 'Burj Al Arab Jumeirah', subtitle: 'Umm Suqeim 3, Dubai · 5 Stars', count: 'Direct Property' },
    { type: 'city', name: 'Abu Dhabi', subtitle: 'United Arab Emirates', count: '310 hotels' },
    { type: 'hotel', name: 'Address Downtown', subtitle: 'Downtown Dubai · 5 Stars', count: 'Direct Property' }
  ];

  const handleChildrenChange = (newCount) => {
    setChildrenCount(newCount);
    if (newCount > childAges.length) {
      setChildAges(prev => [...prev, 7]);
    } else {
      setChildAges(prev => prev.slice(0, newCount));
    }
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
                  Design Lab 05
                </span>
                <h1 className="text-sm sm:text-base font-extrabold text-gray-900">
                  Landing Page Hero & Combined Search Form Audit
                </h1>
              </div>
              <p className="text-[11px] text-gray-500">
                Compare 3 distinct search console architectures: Bedsonline Unified, Floating Pill Bar, and Luxury Bento Concierge
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Design Direction Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedStyle('bedsonline_unified')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'bedsonline_unified' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style 1: Bedsonline Unified
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('floating_pill')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'floating_pill' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style 2: Floating Pill Bar
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('luxury_bento')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'luxury_bento' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style 3: Luxury Concierge Bento (Redesigned)
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
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO PREVIEW CONTAINER ── */}
      <main className="flex-1 py-12 px-4 flex justify-center items-start">
        <div
          style={{ width: viewportWidth }}
          className="transition-all duration-300 relative rounded-3xl overflow-hidden shadow-2xl min-h-[580px] flex flex-col justify-center items-center p-4 sm:p-10"
        >
          {/* Hero Background Photo */}
          <img
            src="https://images.pexels.com/photos/162031/dubai-tower-arab-khalifa-162031.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/65 to-slate-950/90 backdrop-blur-[1px]" />

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-5xl space-y-6 text-center">
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-blue-600/30 text-blue-200 border border-blue-400/40 inline-flex items-center gap-1.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Official Bedsonline Global Wholesale API
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {selectedStyle === 'luxury_bento'
                  ? 'Curate Your Bespoke Luxury Dubai Escape'
                  : 'Search Over 300,000 Hotels & Resorts'}
              </h2>
              <p className="text-xs sm:text-base text-gray-300 max-w-2xl mx-auto">
                {selectedStyle === 'luxury_bento'
                  ? 'Handpicked 5-star properties, exclusive club lounge privileges, and guaranteed wholesale pricing.'
                  : 'Search seamlessly by destination city or property name with exclusive negotiated B2B net rates.'}
              </p>
            </div>

            {/* ════════════════════════════════════════════════════════════════════
                STYLE 1: BEDSONLINE UNIFIED SINGLE FIELD
               ════════════════════════════════════════════════════════════════════ */}
            {selectedStyle === 'bedsonline_unified' && (
              <div className="bg-white rounded-3xl shadow-2xl p-3 sm:p-4 border border-white/20 text-left">
                {/* Product Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
                  <button
                    onClick={() => setActiveTab('hotels')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'hotels' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hotels & Stays</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('transfers')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'transfers' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Airport Transfers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'activities' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Tours & Safaris</span>
                  </button>
                </div>

                {/* 3-Column Search Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 relative">
                  {/* Field 1: Unified City or Hotel Name (5 cols) */}
                  <div className="md:col-span-5 relative">
                    <label className="text-[10px] font-black uppercase text-gray-400 block px-3 pt-1">
                      Destination or Hotel Name
                    </label>
                    <div
                      onClick={() => setIsSuggestOpen(true)}
                      className="p-2 px-3 flex items-center gap-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                    >
                      <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setIsSuggestOpen(true);
                        }}
                        placeholder="e.g. Dubai or Atlantis The Palm"
                        className="w-full text-xs sm:text-sm font-extrabold text-gray-900 bg-transparent focus:outline-none"
                      />
                    </div>

                    {isSuggestOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in duration-150">
                        <div className="p-2.5 bg-gray-50 text-[10px] font-black uppercase text-gray-400 flex justify-between">
                          <span>Suggestions</span>
                          <button onClick={() => setIsSuggestOpen(false)} className="text-gray-500 hover:text-gray-800">
                            ✕ Close
                          </button>
                        </div>
                        {suggestions.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setQuery(s.name);
                              setIsSuggestOpen(false);
                            }}
                            className="p-3 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {s.type === 'city' ? (
                                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                              )}
                              <div>
                                <div className="font-extrabold text-xs text-gray-900">{s.name}</div>
                                <div className="text-[11px] text-gray-400">{s.subtitle}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 shrink-0">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Field 2: Dates (4 cols) */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 block px-3 pt-1">
                      Dates (Check-in → Check-out)
                    </label>
                    <div className="p-2 px-3 flex items-center justify-between rounded-2xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-gray-900">Nov 15 - Nov 18</div>
                          <div className="text-[10px] text-gray-500 font-semibold">3 nights</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        Flexible
                      </span>
                    </div>
                  </div>

                  {/* Field 3: Guests (3 cols) */}
                  <div className="md:col-span-3 relative">
                    <label className="text-[10px] font-black uppercase text-gray-400 block px-3 pt-1">
                      Rooms & Guests
                    </label>
                    <div
                      onClick={() => setIsGuestPopoverOpen(!isGuestPopoverOpen)}
                      className="p-2 px-3 flex items-center justify-between rounded-2xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-gray-900">
                            {adults} Adults · {rooms} Room
                          </div>
                          <div className="text-[10px] text-gray-500 font-semibold">
                            {childrenCount} child ({childAges[0]}y)
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* Guest Popover */}
                    {isGuestPopoverOpen && (
                      <div className="absolute top-full right-0 w-72 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 space-y-3.5 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-extrabold text-gray-900">Rooms</div>
                            <div className="text-[10px] text-gray-400">Total units</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setRooms(Math.max(1, rooms - 1))}
                              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-xs">{rooms}</span>
                            <button
                              type="button"
                              onClick={() => setRooms(rooms + 1)}
                              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-extrabold text-gray-900">Adults</div>
                            <div className="text-[10px] text-gray-400">Ages 18+</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-xs">{adults}</span>
                            <button
                              type="button"
                              onClick={() => setAdults(adults + 1)}
                              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-extrabold text-gray-900">Children</div>
                            <div className="text-[10px] text-gray-400">Ages 0 to 17</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleChildrenChange(Math.max(0, childrenCount - 1))}
                              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-xs">{childrenCount}</span>
                            <button
                              type="button"
                              onClick={() => handleChildrenChange(childrenCount + 1)}
                              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {childrenCount > 0 && (
                          <div className="pt-2 border-t border-gray-100 space-y-1">
                            <span className="text-[10px] font-bold text-gray-600 block">Child Age at Check-in:</span>
                            <div className="flex gap-2">
                              {childAges.map((age, i) => (
                                <select
                                  key={i}
                                  value={age}
                                  onChange={(e) => {
                                    const next = [...childAges];
                                    next[i] = parseInt(e.target.value);
                                    setChildAges(next);
                                  }}
                                  className="text-xs p-1.5 rounded-lg border border-gray-200 bg-gray-50 font-bold"
                                >
                                  {[...Array(18)].map((_, y) => (
                                    <option key={y} value={y}>{y} yrs</option>
                                  ))}
                                </select>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setIsGuestPopoverOpen(false)}
                          className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Link
                    to="/hotel-search-results?city=Dubai&checkIn=2026-11-15&checkOut=2026-11-18&adults=2&rooms=1"
                    className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Best Rates</span>
                  </Link>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                STYLE 2: FLOATING PILL BAR (AIRBNB LUXE STYLE)
               ════════════════════════════════════════════════════════════════════ */}
            {selectedStyle === 'floating_pill' && (
              <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl p-2 px-4 border border-white/40 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-gray-200 flex-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Where</span>
                    <span className="text-xs font-extrabold text-gray-900">Dubai, United Arab Emirates</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-gray-200 flex-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">When</span>
                    <span className="text-xs font-extrabold text-gray-900">Nov 15 - 18 (3 nights)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 flex-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Who</span>
                    <span className="text-xs font-extrabold text-gray-900">2 Adults · 1 Child</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors shrink-0"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                STYLE 3: LUXURY CONCIERGE BENTO SEARCH EXPERIENCE (REDESIGNED!)
               ════════════════════════════════════════════════════════════════════ */}
            {selectedStyle === 'luxury_bento' && (
              <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-left space-y-6 max-w-4xl mx-auto">
                {/* 1. Curated Destination Inspiration Chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-amber-300 font-bold flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Select an Iconic Dubai Destination:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'palm', label: 'Palm Jumeirah', subtitle: 'Ultra Beachfront', icon: Palmtree },
                      { id: 'downtown', label: 'Downtown / Burj', subtitle: 'Skyline Luxury', icon: Building2 },
                      { id: 'desert', label: 'Desert Reserve', subtitle: 'Private Pool Villas', icon: Sunset },
                      { id: 'marina', label: 'Dubai Marina & JBR', subtitle: 'Waterfront Living', icon: Compass }
                    ].map(t => {
                      const IconC = t.icon;
                      const isSelected = selectedBentoTheme === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedBentoTheme(t.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-400/80 text-white ring-1 ring-amber-400'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                          }`}
                        >
                          <IconC className={`w-4 h-4 mb-1 ${isSelected ? 'text-amber-400' : 'text-gray-400'}`} />
                          <div className="font-extrabold text-xs">{t.label}</div>
                          <div className="text-[10px] text-gray-400">{t.subtitle}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Unified Search Console Input */}
                <div className="bg-white rounded-2xl p-3 border border-white/30 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5 flex items-center gap-2.5 px-2">
                    <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Property / Neighborhood</span>
                      <input
                        type="text"
                        defaultValue={selectedBentoTheme === 'palm' ? 'Palm Jumeirah Luxury Resorts' : 'Downtown Burj Khalifa Stays'}
                        className="w-full text-xs sm:text-sm font-extrabold text-gray-900 bg-transparent focus:outline-none truncate"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-4 flex items-center gap-2.5 px-2 border-t md:border-t-0 md:border-l border-gray-200 pt-2 md:pt-0">
                    <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Stay Dates</span>
                      <div className="text-xs sm:text-sm font-extrabold text-gray-900">Nov 15 – Nov 18 (3 nights)</div>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex items-center gap-2.5 px-2 border-t md:border-t-0 md:border-l border-gray-200 pt-2 md:pt-0">
                    <Users className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Guests</span>
                      <div className="text-xs sm:text-sm font-extrabold text-gray-900">2 Adults · 1 Suite</div>
                    </div>
                  </div>
                </div>

                {/* 3. Included VIP Perks & Inclusions Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-gray-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Free Room Upgrade (upon availability)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-gray-300">
                    <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Complimentary Gourmet Breakfast</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-gray-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100% Guaranteed Bedsonline Rates</span>
                  </div>
                </div>

                {/* 4. Luxury Gradient CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left text-xs text-gray-300">
                    <span className="text-amber-300 font-bold block">Exclusive B2B Rates from AED 1,450 / night</span>
                    <span>≈ PKR 110,200 · All luxury taxes and service fees included</span>
                  </div>

                  <Link
                    to="/hotel-search-results?city=Dubai&checkIn=2026-11-15&checkOut=2026-11-18&adults=2&rooms=1"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-98"
                  >
                    <span>Explore Luxury Resorts</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Persistent Feedback Inspector */}
      <FeedbackOverlay targetName="HeroSearchBar_Redesign" />
    </div>
  );
}
