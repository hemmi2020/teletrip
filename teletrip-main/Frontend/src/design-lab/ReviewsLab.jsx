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
  Search
} from 'lucide-react';
import { FeedbackOverlay } from './FeedbackOverlay';

export default function ReviewsLab() {
  const [viewportWidth, setViewportWidth] = useState('100%');
  const [selectedStyle, setSelectedStyle] = useState('sentiment_dashboard'); // 'sentiment_dashboard' | 'minimalist' | 'dual_source'
  const [activeSentiment, setActiveSentiment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      travelerType: 'Family with teenagers',
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
      travelerType: 'Solo Business & Leisure',
      stayDate: 'August 2026',
      room: 'Skyline Junior Suite',
      rating: 4,
      title: 'Superb property, can get busy during weekend brunch',
      text: 'The architecture and attention to detail are world class. Gym facilities and the AWAKEN wellness spa were top tier. The only minor point is the lobby gets quite lively on Friday evenings, but our suite was quiet and serene.',
      helpful: 16,
      verified: true
    }
  ];

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
                Official TripAdvisor rating distribution, sentiment filters, sub-ratings, and verified traveler reviews
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Design Direction Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedStyle('sentiment_dashboard')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'sentiment_dashboard' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                Style 1: Sentiment Dashboard
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('minimalist')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'minimalist' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                Style 2: Minimalist Clean Modal
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('dual_source')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'dual_source' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600'
                }`}
              >
                Style 3: Dual Source Comparison
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
                  Rated in the top 1% of luxury beachfront properties in Dubai
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
          </div>

          {/* Sub-Ratings & Star Distribution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-gray-100">
            {/* Sub-Ratings Breakdown */}
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

            {/* Star Distribution */}
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

          {/* Sentiment Filter Pills */}
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
            {reviewsList.map((rev) => (
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

                <p className="text-xs text-gray-600 leading-relaxed">
                  {rev.text}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600">
                    <ThumbsUp className="w-3 h-3" />
                    Helpful review ({rev.helpful})
                  </span>
                  <span className="text-[10px]">Via TripAdvisor Verification</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Persistent Feedback Inspector */}
      <FeedbackOverlay targetName="TripAdvisorReviews_Redesign" />
    </div>
  );
}
