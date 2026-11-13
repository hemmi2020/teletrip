import React, { useState } from 'react';
import { VariantA } from './variants/VariantA';
import { VariantB } from './variants/VariantB';
import { VariantC } from './variants/VariantC';
import { VariantD } from './variants/VariantD';
import { VariantE } from './variants/VariantE';
import { FeedbackOverlay } from './FeedbackOverlay';
import { HotelDetailModal } from '../components/hotels/HotelDetailModal';
import { Sparkles, Monitor, Tablet, Smartphone, Layers, Eye, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DesignLabPage() {
  const [selectedVariant, setSelectedVariant] = useState('A'); // 'A' (Client Selected) | 'ALL' | 'B' | 'C' | 'D' | 'E'
  const [viewportWidth, setViewportWidth] = useState('100%'); // '100%' | '768px' | '375px'
  const [activeModalHotel, setActiveModalHotel] = useState(null);

  const variantsMeta = [
    { id: 'A', name: 'Variant A: Information Hierarchy & Luxury Clarity', tag: 'Client Selected', color: 'blue' },
    { id: 'B', name: 'Variant B: Split-Pane Interactive Map & Card View', tag: 'Spatial', color: 'emerald' },
    { id: 'C', name: 'Variant C: High-Density Power-User Table Matrix', tag: 'Power User', color: 'slate' },
    { id: 'D', name: 'Variant D: Guided Smart Filter & Quick Drawer', tag: 'Contextual', color: 'purple' },
    { id: 'E', name: 'Variant E: Immersive Boutique & Photo Storytelling', tag: 'Editorial', color: 'amber' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
      {/* ── TOP CONTROL BAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Brand & Breadcrumb */}
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
                  Design Lab 01
                </span>
                <h1 className="text-sm sm:text-base font-extrabold text-gray-900">
                  Hotel Search Results & Filter System
                </h1>
              </div>
              <p className="text-[11px] text-gray-500">
                5 distinct exploratory variants for Search Form, Filter System, and Results Cards
              </p>
            </div>
          </div>

          {/* Controls: Viewport + Variant Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Viewport Width Switcher */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewportWidth('100%')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewportWidth === '100%' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
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
                  viewportWidth === '768px' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
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
                  viewportWidth === '390px' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Mobile View (390px - iPhone Pro)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">390px</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportWidth('320px')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewportWidth === '320px' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Small Mobile View (320px - iPhone SE)"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">320px</span>
              </button>
            </div>

            {/* Variant Switcher Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setSelectedVariant('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedVariant === 'ALL'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Compare All
              </button>
              {variantsMeta.map((vm) => (
                <button
                  key={vm.id}
                  onClick={() => setSelectedVariant(vm.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedVariant === vm.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {vm.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CANVAS WITH VIEWPORT CONTAINER ── */}
      <main className="flex-1 py-4 sm:py-8 px-2 sm:px-4 flex justify-center">
        <div
          style={{ width: viewportWidth }}
          className="transition-all duration-300 space-y-8 sm:space-y-12 max-w-7xl w-full"
        >
          {/* VARIANT A */}
          {(selectedVariant === 'ALL' || selectedVariant === 'A') && (
            <section
              data-variant="A"
              className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    A
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-gray-900">
                    Variant A: Information Hierarchy & Luxury Clarity
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Recommended Direction
                </span>
              </div>

              <VariantA onSelectHotel={(hotel) => setActiveModalHotel(hotel)} />
            </section>
          )}

          {/* VARIANT B */}
          {(selectedVariant === 'ALL' || selectedVariant === 'B') && (
            <section
              data-variant="B"
              className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    B
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-gray-900">
                    Variant B: Split-Pane Interactive Map & Card View
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Spatial Discovery
                </span>
              </div>

              <VariantB onSelectHotel={(hotel) => setActiveModalHotel(hotel)} />
            </section>
          )}

          {/* VARIANT C */}
          {(selectedVariant === 'ALL' || selectedVariant === 'C') && (
            <section
              data-variant="C"
              className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                    C
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-gray-900">
                    Variant C: High-Density Power-User Table Matrix
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                  Fast Scanning
                </span>
              </div>

              <VariantC onSelectHotel={(hotel) => setActiveModalHotel(hotel)} />
            </section>
          )}

          {/* VARIANT D */}
          {(selectedVariant === 'ALL' || selectedVariant === 'D') && (
            <section
              data-variant="D"
              className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    D
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-gray-900">
                    Variant D: Guided Smart Filter & Quick Drawer
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Contextual Exploration
                </span>
              </div>

              <VariantD onSelectHotel={(hotel) => setActiveModalHotel(hotel)} />
            </section>
          )}

          {/* VARIANT E */}
          {(selectedVariant === 'ALL' || selectedVariant === 'E') && (
            <section
              data-variant="E"
              className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                    E
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-gray-900">
                    Variant E: Immersive Boutique & Photo Storytelling
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Editorial Photography
                </span>
              </div>

              <VariantE onSelectHotel={(hotel) => setActiveModalHotel(hotel)} />
            </section>
          )}
        </div>
      </main>

      {/* ── TEST HOTEL DETAIL MODAL ── */}
      {activeModalHotel && (
        <HotelDetailModal
          isOpen={!!activeModalHotel}
          onClose={() => setActiveModalHotel(null)}
          hotel={{
            ...activeModalHotel,
            currency: 'AED',
            price: activeModalHotel.priceAED,
            rooms: (activeModalHotel.roomsAvailable || []).map((r) => ({
              ...r,
              rates: [
                {
                  rateKey: `rk-${r.code}-1`,
                  rateClass: 'NOR',
                  net: (r.priceAED / 3).toFixed(2),
                  boardName: activeModalHotel.boardName,
                  allotment: 5,
                  paymentType: 'AT_WEB',
                  cancellationPolicies: [{ amount: '0', from: '2026-11-13' }]
                }
              ]
            }))
          }}
          formatPKR={(amt) => `PKR ${(amt * 75.39 * 1.01).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`}
          applyCommission={(amt) => amt}
          onAddToCart={() => alert('Added to cart in Design Lab!')}
        />
      )}

      {/* ── INTERACTIVE FEEDBACK OVERLAY (CRITICAL REQUIREMENT) ── */}
      <FeedbackOverlay targetName="HotelSearchExperience" />
    </div>
  );
}

