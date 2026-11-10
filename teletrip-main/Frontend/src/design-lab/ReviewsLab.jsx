import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Star,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  Filter,
  Sparkles,
  Calendar,
  User,
  ShieldCheck,
  Search,
  Award,
  TrendingUp,
  Quote
} from 'lucide-react';
import { FeedbackOverlay } from './FeedbackOverlay';

export default function ReviewsLab() {
  const [viewportWidth, setViewportWidth] = useState('100%');
  const [selectedStyle, setSelectedStyle] = useState('sentiment_dashboard'); // 'sentiment_dashboard' | 'minimalist' | 'dual_source'
  const [activeSentiment, setActiveSentiment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [travelerTypeFilter, setTravelerTypeFilter] = useState('all');

  const subRatings = [
    { label: 'Location', score: 4.9, percent: 98 },
    { label: 'Cleanliness', score: 4.8, percent: 96 },
    { label: 'Rooms & Comfort', score: 4.8, percent: 96 },
    { label: 'Service & Staff', score: 4.7, percent: 94 },
    { label: 'Value for Money', score: 4.4, percent: 88 }
  ];

  const ratingDistribution = [
    { stars: 5, label: 'Excellent', count: 1435, percent: 78 },
    { stars: 4, label: 'Very Good', count: 276, percent: 15 },
    { stars: 3, label: 'Average', count: 74, percent: 4 },
    { stars: 2, label: 'Poor', count: 37, percent: 2 },
    { stars: 1, label: 'Terrible', count: 18, percent: 1 }
  ];

  const sentimentTags = [
    { id: 'all', label: 'All Reviews', count: 1840 },
    { id: 'view', label: '🌟 Spectacular Views', count: 620 },
    { id: 'breakfast', label: '🍳 Amazing Breakfast', count: 480 },
    { id: 'pool', label: '🏊 Cloud 22 Infinity Pool', count: 390 },
    { id: 'family', label: '👨‍👩‍👧 Family Friendly', count: 510 },
    { id: 'service', label: '🛎️ Impeccable Service', count: 820 }
  ];

  const reviewsList = [
    {
      id: 1,
      author: 'Marcus & Elena V.',
      origin: 'London, United Kingdom',
      travelerType: 'Couple',
      stayDate: 'October 2026',
      room: 'Seascape Deluxe King Room',
      rating: 5,
      title: 'Beyond five stars — the best resort in Dubai!',
      text: 'From the moment we arrived at Atlantis The Royal, the service was unbelievable. The view of the Arabian Gulf from our balcony was breathtaking, and the breakfast buffet at Gastronomy is in a league of its own. Highly recommend booking the Club Lounge access.',
      helpful: 42,
      verified: true
    },
    {
      id: 2,
      author: 'Fatima Al-Mansoor',
      origin: 'Riyadh, Saudi Arabia',
      travelerType: 'Family',
      stayDate: 'September 2026',
      room: 'Two-Bedroom Family Residence',
      rating: 5,
      title: 'Unforgettable family holiday with unlimited waterpark perks',
      text: 'Having direct access to Aquaventure without waiting in standard ticket queues made the entire trip effortless. The suites are spacious, high-tech, and spotlessly clean. Staff attended to every request within minutes.',
      helpful: 29,
      verified: true
    },
    {
      id: 3,
      author: 'David S.',
      origin: 'Singapore',
      travelerType: 'Solo',
      stayDate: 'August 2026',
      room: 'Skyline Junior Suite',
      rating: 4,
      title: 'Superb property, can get busy during weekend brunch',
      text: 'The architecture and attention to detail are world class. Gym facilities and the AWAKEN wellness spa were top tier. The only minor point is the lobby gets quite lively on Friday evenings, but our suite was quiet and serene.',
      helpful: 16,
      verified: true
    }
  ];

  const filteredReviews = reviewsList.filter(rev => {
    if (travelerTypeFilter !== 'all' && rev.travelerType !== travelerTypeFilter) return false;
    if (searchQuery.trim() && !rev.text.toLowerCase().includes(searchQuery.toLowerCase()) && !rev.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
                  Design Lab 04
                </span>
                <h1 className="text-sm sm:text-base font-extrabold text-gray-900">
                  TripAdvisor Reviews & Traveler Sentiment Audit
                </h1>
              </div>
              <p className="text-[11px] text-gray-500">
                Compare 3 distinct styles: Sentiment Dashboard, Minimalist Luxe Grid, and Dual-Source Verified Comparison
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Design Direction Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedStyle('sentiment_dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'sentiment_dashboard' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style 1: Sentiment Dashboard
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('minimalist')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'minimalist' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style 2: Minimalist Clean Modal
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('dual_source')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'dual_source' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style 3: Dual-Source Verified (TripAdvisor + Google)
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

      {/* ── CANVAS VIEWPORT ── */}
      <main className="flex-1 py-8 px-4 flex justify-center items-start">
        <div
          style={{ width: viewportWidth }}
          className="transition-all duration-300 relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200 p-4 sm:p-8 space-y-6"
        >
          {/* ════════════════════════════════════════════════════════════════════
              STYLE 1: TRIPADVISOR SENTIMENT DASHBOARD & PROGRESS BARS
             ════════════════════════════════════════════════════════════════════ */}
          {selectedStyle === 'sentiment_dashboard' && (
            <div className="space-y-6">
              {/* Header Score Overview */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
                    <span className="text-2xl leading-none">4.9</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-90">Excellent</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-emerald-500">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className="w-4 h-4 fill-emerald-500" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-gray-900">TripAdvisor Traveler Rating</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mt-0.5">
                      Based on 1,840 verified guest reviews
                    </h3>
                    <p className="text-xs text-gray-500">
                      Ranked #1 of 860 luxury hotels in Dubai
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reviews (e.g. pool, breakfast)..."
                    className="text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
              </div>

              {/* Sub-Ratings & Star Distribution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-gray-100">
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Detailed Category Ratings
                  </h4>
                  <div className="space-y-2.5">
                    {subRatings.map((sub) => (
                      <div key={sub.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-800">
                          <span>{sub.label}</span>
                          <span className="font-mono text-blue-600">{sub.score} / 5.0</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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
                  <div className="space-y-2">
                    {ratingDistribution.map((dist) => (
                      <div key={dist.stars} className="flex items-center gap-3 text-xs">
                        <span className="w-16 font-bold text-gray-700">{dist.stars} Stars</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${dist.percent}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-gray-400 text-[11px]">
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
                <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {sentimentTags.map((tag) => (
                    <button
                      key={tag.id}
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
              <div className="space-y-4 pt-2">
                {filteredReviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
                          {rev.author[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-gray-900">{rev.author}</span>
                            {rev.verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Stay
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {rev.origin} · {rev.travelerType}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Stayed {rev.stayDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-800">Room: {rev.room}</span>
                    </div>

                    <h5 className="font-extrabold text-sm text-gray-900 leading-snug">
                      "{rev.title}"
                    </h5>

                    <p className="text-xs text-gray-600 leading-relaxed">{rev.text}</p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100">
                      <span className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600">
                        <ThumbsUp className="w-3 h-3" /> Helpful ({rev.helpful})
                      </span>
                      <span className="text-[10px]">Via TripAdvisor Verification</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STYLE 2: MINIMALIST CLEAN MODAL (AIRBNB LUXE STYLE)
             ════════════════════════════════════════════════════════════════════ */}
          {selectedStyle === 'minimalist' && (
            <div className="space-y-8 max-w-4xl mx-auto text-left">
              {/* Minimalist Top Headline */}
              <div className="text-center space-y-2 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-gray-900">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <span>4.92 · 1,840 reviews</span>
                </div>
                <p className="text-xs text-gray-500">Overall rating from guests who completed a verified stay</p>
                
                {/* Traveler Type Segmented Filter */}
                <div className="flex justify-center gap-2 pt-3">
                  {[
                    { id: 'all', label: 'All Reviews' },
                    { id: 'Couple', label: 'Couples (840)' },
                    { id: 'Family', label: 'Families (620)' },
                    { id: 'Solo', label: 'Solo Travelers (380)' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTravelerTypeFilter(t.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        travelerTypeFilter === t.id
                          ? 'bg-gray-900 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Column Minimalist Review Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gray-900 text-white font-bold text-sm flex items-center justify-center">
                        {rev.author[0]}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-gray-900">{rev.author}</div>
                        <div className="text-[11px] text-gray-500">{rev.origin} · {rev.travelerType}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400">{rev.stayDate}</span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed font-serif italic">
                      "{rev.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STYLE 3: DUAL-SOURCE VERIFIED COMPARISON (TRIPADVISOR + GOOGLE)
             ════════════════════════════════════════════════════════════════════ */}
          {selectedStyle === 'dual_source' && (
            <div className="space-y-6 max-w-4xl mx-auto text-left">
              {/* Dual Benchmark Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TripAdvisor Card */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      TripAdvisor Traveler Choice
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">1,840 reviews</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-700">4.9</span>
                    <span className="text-sm font-bold text-gray-700">/ 5.0 (Excellent)</span>
                  </div>
                  <p className="text-xs text-emerald-900">Ranked #1 luxury beachfront hotel in Palm Jumeirah</p>
                </div>

                {/* Google Reviews Card */}
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-blue-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Google Verified Reviews
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-700">3,420 reviews</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-700">4.8</span>
                    <span className="text-sm font-bold text-gray-700">/ 5.0 (98% Positive)</span>
                  </div>
                  <p className="text-xs text-blue-900">Verified by Google Travel real guest check-ins</p>
                </div>
              </div>

              {/* Side-by-Side Category Rating Comparison */}
              <div className="p-6 bg-slate-50 border border-gray-200 rounded-3xl space-y-4">
                <h4 className="text-sm font-extrabold text-gray-900">
                  Cross-Platform Metric Benchmark
                </h4>
                <div className="space-y-3 text-xs">
                  {[
                    { metric: 'Location & Accessibility', tripAdvisor: '4.9 / 5.0', google: '4.9 / 5.0' },
                    { metric: 'Cleanliness & Hygiene', tripAdvisor: '4.8 / 5.0', google: '4.8 / 5.0' },
                    { metric: 'Service & Hospitality', tripAdvisor: '4.7 / 5.0', google: '4.8 / 5.0' },
                    { metric: 'Dining & Food Quality', tripAdvisor: '4.9 / 5.0', google: '4.7 / 5.0' }
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-2">
                      <span className="col-span-6 font-bold text-gray-800">{row.metric}</span>
                      <span className="col-span-3 text-center text-emerald-700 font-mono font-bold">{row.tripAdvisor} (TA)</span>
                      <span className="col-span-3 text-center text-blue-700 font-mono font-bold">{row.google} (Google)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Guest Quotes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Recent Cross-Platform Guest Endorsements</h4>
                {reviewsList.map(r => (
                  <div key={r.id} className="p-4 bg-white border border-gray-200 rounded-2xl flex items-start gap-3">
                    <Quote className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-xs text-gray-900">{r.title}</div>
                      <p className="text-xs text-gray-600 mt-0.5">{r.text}</p>
                      <span className="text-[10px] text-gray-400 block mt-1">{r.author} · {r.stayDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Persistent Feedback Inspector */}
      <FeedbackOverlay targetName="TripAdvisorReviews_Redesign" />
    </div>
  );
}
