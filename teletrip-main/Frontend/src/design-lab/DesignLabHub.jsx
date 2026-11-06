import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Bed,
  ShoppingCart,
  Star,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  MessageSquare,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { FeedbackOverlay } from './FeedbackOverlay';

export default function DesignLabHub() {
  const labSections = [
    {
      id: '01',
      title: 'Hotel Search Results & Filter System',
      path: '/design-lab/search',
      badge: '5 Full Variants',
      badgeColor: 'bg-blue-600',
      description: 'Audit card layouts, split-pane interactive map view, quick filters, and mobile drawer responsiveness.',
      features: ['Dual Currency (AED + PKR)', 'Luxury Collection Badges', 'Sticky Scenario Filters', 'Map Pins Sync'],
      icon: Search,
      bgGradient: 'from-blue-600/10 via-indigo-600/5 to-transparent'
    },
    {
      id: '02',
      title: 'Hotel Detail & Room Selection Modal',
      path: '/design-lab/hotel-modal',
      badge: 'Solves Room Scroll',
      badgeColor: 'bg-emerald-600',
      description: 'Room Type category shortcuts (Studios, Deluxe, Suites), compact accordion rate cards, and sticky booking dock.',
      features: ['Room Category Shortcuts', 'Expand / Collapse All', 'Direct Room Photo Gallery', 'Mobile Sticky Dock'],
      icon: Bed,
      bgGradient: 'from-emerald-600/10 via-teal-600/5 to-transparent'
    },
    {
      id: '03',
      title: 'Cart & Booking Checkout Flow',
      path: '/design-lab/cart',
      badge: 'Inventory Hold Timer',
      badgeColor: 'bg-amber-600',
      description: '15-minute live inventory hold timer, line-item tax breakdown, Hotelbeds local tourist tax notice, and promo engine.',
      features: ['Live Hold Countdown', 'Hotelbeds City Tax Transparency', 'Promo Code Engine', 'Multi-Room Summary'],
      icon: ShoppingCart,
      bgGradient: 'from-amber-600/10 via-orange-600/5 to-transparent'
    },
    {
      id: '04',
      title: 'TripAdvisor Reviews & Sentiment Deep-Dive',
      path: '/design-lab/reviews',
      badge: 'Verified Reviews',
      badgeColor: 'bg-purple-600',
      description: 'TripAdvisor score breakdown, visual sub-rating progress bars (cleanliness, location, service), and sentiment topic filters.',
      features: ['Sub-Rating Metric Bars', 'Topic Sentiment Chips', 'Verified Stay Badges', 'Rating Distribution Curve'],
      icon: Star,
      bgGradient: 'from-purple-600/10 via-pink-600/5 to-transparent'
    },
    {
      id: '05',
      title: 'Landing Page Hero & Combined Search Bar',
      path: '/design-lab/hero-search',
      badge: 'Bedsonline Unified',
      badgeColor: 'bg-cyan-600',
      description: 'Unified single search field for City or Hotel name, interactive date range selector, and passenger popover with child ages.',
      features: ['Single City/Hotel Field', 'Categorized Autosuggest', 'Room & Passenger Popover', 'Child Age Dropdowns'],
      icon: Compass,
      bgGradient: 'from-cyan-600/10 via-blue-600/5 to-transparent'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* ── HEADER ── */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
              T
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white tracking-tight">TeleTrip</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                  Client Design Lab
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Interactive UI/UX Review Suite for Stakeholder Feedback</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline text-gray-400">Reviewing for:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Deployed Preview
            </span>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section className="py-12 px-6 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Complete End-to-End Hotel Booking Experience
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Client Design Review Hub
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore and test each section with realistic Dubai hotel data. Use the interactive 
            feedback drawer to select your favorite options and submit notes directly to the development team.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Desktop, Tablet & Mobile Audit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Point & Click Element Notes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Server-Side Submission
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION LAB CARDS GRID ── */}
      <main className="max-w-6xl mx-auto py-12 px-6 flex-1 w-full space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Select a Lab to Audit & Review:
          </h2>
          <span className="text-xs text-gray-400">5 Distinct Sections Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {labSections.map((section) => (
            <Link
              key={section.id}
              to={section.path}
              className={`group relative p-6 rounded-3xl bg-slate-900/90 border border-white/10 hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br ${section.bgGradient}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 group-hover:bg-blue-600 transition-colors flex items-center justify-center text-white">
                      <section.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                      Lab {section.id}
                    </span>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full text-white shadow-xs ${section.badgeColor}`}>
                    {section.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-white group-hover:text-blue-300 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-2">
                  {section.features.map((feat, fi) => (
                    <span key={fi} className="text-[11px] text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                <span>Open Interactive Audit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Client Instructions Box */}
        <div className="p-6 rounded-3xl bg-blue-950/40 border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white">
                How to Submit Your Choices & Feedback
              </h4>
              <p className="text-xs text-blue-200/90 leading-relaxed">
                Open any lab above, try the Desktop/Mobile views, and click the floating 
                <strong> "Review Lab"</strong> button at bottom-right. Pick your winning variant, leave notes, and hit Submit. 
                Our team receives your feedback instantly!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Feedback Inspector */}
      <FeedbackOverlay targetName="MasterDesignLabHub" />
    </div>
  );
}

