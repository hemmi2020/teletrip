import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Clock,
  ShieldCheck,
  Tag,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  Plane,
  Sparkles,
  Lock,
  Trash2,
  Sliders,
  Download,
  Printer,
  FileText,
  BadgePercent
} from 'lucide-react';
import { FeedbackOverlay } from './FeedbackOverlay';

export default function CartCheckoutLab() {
  const [viewportWidth, setViewportWidth] = useState('100%');
  const [selectedStyle, setSelectedStyle] = useState('split_timer'); // 'split_timer' | 'stepped_flow' | 'b2b_quote'
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 58); // 14 mins 58 secs
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'bank' | 'hotel'
  
  // Style 2 state (stepped flow)
  const [activeStep, setActiveStep] = useState(2); // 1: Itinerary, 2: Guest Details, 3: Payment
  
  // Style 3 state (b2b quote)
  const [agencyMarkup, setAgencyMarkup] = useState(10); // 10% markup
  const [priceMode, setPriceMode] = useState('client'); // 'client' | 'net'

  // Hold Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const basePrice = 4350;
  const discountAmount = discountApplied ? basePrice * 0.1 : 0;
  const vat = (basePrice - discountAmount) * 0.05;
  const serviceCharge = (basePrice - discountAmount) * 0.05;
  const grandTotal = basePrice - discountAmount + vat + serviceCharge;
  const localCityTax = 60; // AED 20 per night * 3 nights (Hotelbeds excluded local tax)

  // B2B Pricing
  const agencyCommission = (basePrice * agencyMarkup) / 100;
  const clientFacingTotal = grandTotal + agencyCommission;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'TELETRIP10' || promoCode.trim().length >= 3) {
      setDiscountApplied(true);
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
                  Design Lab 03
                </span>
                <h1 className="text-sm sm:text-base font-extrabold text-gray-900">
                  Cart & Booking Checkout Flow Audit
                </h1>
              </div>
              <p className="text-[11px] text-gray-500">
                Compare 3 distinct checkout designs: Split Hold Timer, Stepped Flow, and B2B Agent Quote
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Design Direction Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedStyle('split_timer')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'split_timer' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style 1: Split-Screen & Hold Timer
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('stepped_flow')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'stepped_flow' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style 2: 3-Step Guided Accordion
              </button>
              <button
                type="button"
                onClick={() => setSelectedStyle('b2b_quote')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedStyle === 'b2b_quote' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Style 3: Travel Agency Client Invoice
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
          className="transition-all duration-300 relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200 p-4 sm:p-8"
        >
          {/* ════════════════════════════════════════════════════════════════════
              STYLE 1: SPLIT-SCREEN & HOLD TIMER (EXPEDIA / BOOKING STYLE)
             ════════════════════════════════════════════════════════════════════ */}
          {selectedStyle === 'split_timer' && (
            <div className="space-y-6">
              {/* Inventory Hold Banner */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-2">
                      <span>Room & Guaranteed Rate Held</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-black">
                        {formatTimer(timeLeft)}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      This rate is reserved exclusively for you. Complete booking before timer expires to avoid repricing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Confirmation</span>
                </div>
              </div>

              {/* Grid 7/5 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-5">
                  {/* Selected Room Card */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg"
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-200"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Selected Property
                        </span>
                        <h3 className="text-base font-extrabold text-gray-900 mt-1">
                          Atlantis The Royal, Palm Jumeirah
                        </h3>
                        <p className="text-xs text-gray-500">Crescent Rd, The Palm Jumeirah, Dubai</p>
                        <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold mt-1">
                          <span>Nov 15 - Nov 18 (3 nights)</span>
                          <span>·</span>
                          <span className="text-blue-600">Seascape Deluxe King Room</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Free Cancellation until Nov 12, 2026
                      </span>
                      <span className="font-semibold text-gray-800">2 Adults · 1 Room</span>
                    </div>
                  </div>

                  {/* Primary Guest Info */}
                  <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-4">
                    <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Primary Guest Information
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">First Name *</label>
                        <input
                          type="text"
                          defaultValue="Ahmed"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Last Name *</label>
                        <input
                          type="text"
                          defaultValue="Khan"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Email Address *</label>
                        <input
                          type="email"
                          defaultValue="ahmed.khan@example.com"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Mobile Phone (WhatsApp) *</label>
                        <input
                          type="tel"
                          defaultValue="+971 50 123 4567"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                    <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Payment Options
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                        <span className="text-xs font-bold block text-gray-900">Credit / Debit</span>
                        <span className="text-[10px] text-gray-500">Visa / Mastercard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'bank'
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Building2 className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                        <span className="text-xs font-bold block text-gray-900">HBL Pay / Bank</span>
                        <span className="text-[10px] text-gray-500">Direct Transfer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('hotel')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'hotel'
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Sparkles className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                        <span className="text-xs font-bold block text-gray-900">Pay at Hotel</span>
                        <span className="text-[10px] text-gray-500">Upon Arrival</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Sticky Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 rounded-2xl border border-gray-200 bg-slate-50/80 sticky top-20 space-y-4 shadow-sm">
                    <h4 className="text-sm font-extrabold text-gray-900 pb-2 border-b border-gray-200">
                      Fare Breakdown & Taxes
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Room Rate (3 nights)</span>
                        <span className="font-semibold text-gray-900">AED {basePrice.toLocaleString()}</span>
                      </div>

                      {discountApplied && (
                        <div className="flex items-center justify-between text-emerald-700 font-bold">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" /> Promo Discount (10%)
                          </span>
                          <span>- AED {discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-gray-600">
                        <span>VAT & Municipal Taxes (5%)</span>
                        <span>AED {vat.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span>Service Charges (5%)</span>
                        <span>AED {serviceCharge.toFixed(2)}</span>
                      </div>

                      <div className="pt-2 border-t border-gray-200 flex items-baseline justify-between">
                        <div>
                          <span className="text-sm font-extrabold text-gray-900 block">Total Due Online</span>
                          <span className="text-[10px] text-gray-500 font-medium">All taxes & fees included</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-blue-600 block">
                            AED {grandTotal.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-gray-600">
                            ≈ PKR {(grandTotal * 76).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Excluded Local City Tax Alert */}
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Payable Locally at Hotel: AED {localCityTax}</span>
                      </div>
                      <p className="text-[10px] text-amber-800 leading-tight">
                        Dubai Tourism Dirham fee (AED 20/room/night) is payable directly to hotel reception at check-out.
                      </p>
                    </div>

                    {/* Promo Code Input */}
                    <div className="pt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Promo Code (try: TELETRIP10)"
                          className="text-xs p-2.5 rounded-xl border border-gray-300 flex-1 uppercase font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Confirm & Complete Reservation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STYLE 2: 3-STEP GUIDED ACCORDION FLOW (PROGRESSIVE DISCLOSURE)
             ════════════════════════════════════════════════════════════════════ */}
          {selectedStyle === 'stepped_flow' && (
            <div className="space-y-6 max-w-4xl mx-auto text-left">
              {/* Stepper Progress Bar */}
              <div className="flex flex-wrap sm:grid sm:grid-cols-3 gap-2 pb-4 border-b border-gray-200">
                {[
                  { step: 1, title: '1. Itinerary Review', desc: 'Hotel & Dates' },
                  { step: 2, title: '2. Guest Details', desc: 'Contact & Names' },
                  { step: 3, title: '3. Payment & Voucher', desc: 'Secure Checkout' }
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStep(s.step)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      activeStep === s.step
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-100'
                        : activeStep > s.step
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">{s.title}</span>
                      {activeStep > s.step && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <span className="text-[10px] text-gray-500 block mt-0.5">{s.desc}</span>
                  </button>
                ))}
              </div>

              {/* Step 1 Accordion Content */}
              {activeStep === 1 && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-gray-200 space-y-4">
                  <h3 className="text-base font-extrabold text-gray-900">Step 1: Verify Reservation Details</h3>
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">Atlantis The Royal · Seascape Deluxe King</h4>
                      <p className="text-xs text-gray-500">Check-in: Nov 15, 2026 · Check-out: Nov 18, 2026 (3 nights)</p>
                      <span className="text-emerald-700 text-xs font-bold mt-1 inline-block">✓ Free Cancellation Included</span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-blue-600">AED 4,350</div>
                      <span className="text-xs text-gray-500">2 Adults · 1 Room</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs"
                  >
                    Continue to Guest Details →
                  </button>
                </div>
              )}

              {/* Step 2 Accordion Content */}
              {activeStep === 2 && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-gray-200 space-y-5">
                  <h3 className="text-base font-extrabold text-gray-900">Step 2: Guest Details & Special Preferences</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-gray-200">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Full Legal Name (as per Passport) *</label>
                      <input type="text" defaultValue="Ahmed Khan" className="w-full text-xs p-2.5 rounded-xl border border-gray-300" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Nationality / Country *</label>
                      <input type="text" defaultValue="United Arab Emirates" className="w-full text-xs p-2.5 rounded-xl border border-gray-300" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Email Address *</label>
                      <input type="email" defaultValue="ahmed.khan@example.com" className="w-full text-xs p-2.5 rounded-xl border border-gray-300" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">WhatsApp Mobile *</label>
                      <input type="tel" defaultValue="+971 50 123 4567" className="w-full text-xs p-2.5 rounded-xl border border-gray-300" />
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                    <span className="text-xs font-bold text-gray-800 block">Special Room Requests (Complimentary):</span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {['High Floor', 'Quiet Room', 'Late Check-in (after 8 PM)', 'Honeymoon / Anniversary setup', 'Airport Shuttle Inquiry'].map((req, i) => (
                        <label key={i} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                          <input type="checkbox" className="accent-blue-600 rounded" />
                          <span>{req}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold text-xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs"
                    >
                      Proceed to Final Payment (AED {grandTotal.toFixed(2)}) →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 Accordion Content */}
              {activeStep === 3 && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-gray-200 space-y-5">
                  <h3 className="text-base font-extrabold text-gray-900">Step 3: Secure Final Payment</h3>
                  <div className="p-5 bg-white rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <span className="font-extrabold text-sm text-gray-900">Final Balance Due</span>
                        <div className="text-xs text-gray-500">Includes VAT, taxes, and service charges</div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-blue-600">AED {grandTotal.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 block">≈ PKR {(grandTotal * 76).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Instant voucher issued immediately upon transaction. Certified Bedsonline partner.</span>
                      </div>
                      <button
                        type="button"
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all"
                      >
                        Authorize & Pay AED {grandTotal.toFixed(2)}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              STYLE 3: TRAVEL AGENCY B2B INVOICE & MARKUP CALCULATOR
             ════════════════════════════════════════════════════════════════════ */}
          {selectedStyle === 'b2b_quote' && (
            <div className="space-y-6 max-w-4xl mx-auto text-left">
              {/* Agency Partner Header */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                    B2B Agency Portal · Account #PK-DXB-9024
                  </span>
                  <h3 className="text-lg font-black text-white">Client Proposal & Booking Invoice</h3>
                  <p className="text-xs text-gray-300">Adjust agency markup, toggle net rates, and generate client vouchers</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-300" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-300" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Agency Markup Control Widget */}
              <div className="p-5 bg-slate-50 border border-gray-200 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                      <BadgePercent className="w-4 h-4 text-blue-600" />
                      Agency Markup & Commission Controller
                    </h4>
                    <p className="text-xs text-gray-500">Live price recalculation for client quote</p>
                  </div>

                  <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPriceMode('client')}
                      className={`px-3 py-1 rounded-lg transition-all ${priceMode === 'client' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                    >
                      Client Facing (Gross)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceMode('net')}
                      className={`px-3 py-1 rounded-lg transition-all ${priceMode === 'net' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
                    >
                      Wholesale (Net)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-700 w-24">Markup: {agencyMarkup}%</span>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={agencyMarkup}
                    onChange={(e) => setAgencyMarkup(parseInt(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Agency Profit: +AED {agencyCommission.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Formal Invoice Card */}
              <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-6">
                <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">TeleTrip Travel Network</h2>
                    <p className="text-xs text-gray-500">Official Hotelbeds B2B Partner · Invoice #TT-2026-8819</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Date Issued</span>
                    <div className="text-xs font-bold text-gray-800">November 07, 2026</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block uppercase text-[10px]">Client Details</span>
                    <div className="font-extrabold text-gray-900 mt-1">Mr. Ahmed Khan & Guest</div>
                    <div className="text-gray-600">ahmed.khan@example.com</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block uppercase text-[10px]">Property Booked</span>
                    <div className="font-extrabold text-gray-900 mt-1">Atlantis The Royal, Palm Jumeirah</div>
                    <div className="text-gray-600">Seascape Deluxe King · 3 Nights (Nov 15 - 18)</div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 p-3 bg-gray-50 font-bold text-gray-500 uppercase text-[10px]">
                    <div className="col-span-8">Description</div>
                    <div className="col-span-4 text-right">Amount</div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-12 p-3">
                      <div className="col-span-8">
                        <span className="font-bold text-gray-800">Seascape Deluxe King (3 nights stay)</span>
                        <div className="text-[10px] text-gray-400">Includes buffet breakfast & Aquaventure access</div>
                      </div>
                      <div className="col-span-4 text-right font-mono font-bold text-gray-900">
                        AED {basePrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-12 p-3 text-gray-600">
                      <div className="col-span-8">Taxes, VAT (5%) & Municipal Fees (5%)</div>
                      <div className="col-span-4 text-right font-mono">AED {(vat + serviceCharge).toFixed(2)}</div>
                    </div>
                    {priceMode === 'client' && (
                      <div className="grid grid-cols-12 p-3 text-blue-900 bg-blue-50/50">
                        <div className="col-span-8 font-semibold">Travel Agency Service & Concierge ({agencyMarkup}%)</div>
                        <div className="col-span-4 text-right font-mono font-bold">AED {agencyCommission.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-12 p-4 bg-gray-900 text-white font-bold">
                    <div className="col-span-8 text-sm">
                      {priceMode === 'client' ? 'Client Quote Total' : 'Net Wholesale Supplier Payable'}
                    </div>
                    <div className="col-span-4 text-right text-base text-emerald-400 font-mono">
                      AED {(priceMode === 'client' ? clientFacingTotal : grandTotal).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs"
                  >
                    Issue Client Voucher
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Persistent Feedback Inspector */}
      <FeedbackOverlay targetName="CartCheckout_Redesign" />
    </div>
  );
}
