import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WhyTeliTripSlider from "./components/WhyTeliTripSlider";
import Slider from "./components/Slider";
import Footer from "./components/Footer";
import Carousel from "./components/Carousel";
import {
  Hotel,
  Car,
  Compass,
  CreditCard,
  Shield,
  Globe,
  ArrowRight,
  Star,
  TrendingUp,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const CITY_HOTEL_COUNTS = {
  Dubai: "1,420+ hotels",
  Paris: "1,280+ hotels",
  London: "1,650+ hotels",
  Tokyo: "940+ hotels",
  Bali: "820+ hotels",
  "New York": "1,150+ hotels",
  Rome: "890+ hotels",
  Istanbul: "760+ hotels",
  Singapore: "630+ hotels",
  Bangkok: "1,100+ hotels",
  Barcelona: "910+ hotels",
  Maldives: "380+ luxury resorts",
  Sydney: "740+ hotels",
  Amsterdam: "670+ hotels",
  Cairo: "520+ hotels",
  Santorini: "430+ boutique stays",
  "Rio de Janeiro": "610+ hotels",
  "Abu Dhabi": "490+ hotels"
};

const fallbackDestinations = [
  {
    _id: '1',
    name: "Dubai",
    country: "United Arab Emirates",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=800&fit=crop&q=80",
    tag: "Trending",
    hotelCount: "1,420+ hotels"
  },
  {
    _id: '2',
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=800&fit=crop&q=80",
    tag: "Popular",
    hotelCount: "1,280+ hotels"
  },
  {
    _id: '3',
    name: "London",
    country: "United Kingdom",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=800&fit=crop&q=80",
    tag: "Top Choice",
    hotelCount: "1,650+ hotels"
  },
  {
    _id: '4',
    name: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=800&fit=crop&q=80",
    tag: "Culture",
    hotelCount: "940+ hotels"
  },
  {
    _id: '5',
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=800&fit=crop&q=80",
    tag: "Resort",
    hotelCount: "820+ hotels"
  },
  {
    _id: '6',
    name: "New York",
    country: "United States",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=800&fit=crop&q=80",
    tag: "City Break",
    hotelCount: "1,150+ hotels"
  },
  {
    _id: '7',
    name: "Rome",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=800&fit=crop&q=80",
    tag: "Historic",
    hotelCount: "890+ hotels"
  },
  {
    _id: '8',
    name: "Istanbul",
    country: "Turkey",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=800&fit=crop&q=80",
    tag: "Heritage",
    hotelCount: "760+ hotels"
  },
  {
    _id: '9',
    name: "Singapore",
    country: "Singapore",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=800&fit=crop&q=80",
    tag: "Modern",
    hotelCount: "630+ hotels"
  },
  {
    _id: '10',
    name: "Bangkok",
    country: "Thailand",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=800&fit=crop&q=80",
    tag: "Vibrant",
    hotelCount: "1,100+ hotels"
  },
  {
    _id: '11',
    name: "Barcelona",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=800&fit=crop&q=80",
    tag: "Beach & Art",
    hotelCount: "910+ hotels"
  },
  {
    _id: '12',
    name: "Maldives",
    country: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=800&fit=crop&q=80",
    tag: "Luxury",
    hotelCount: "380+ luxury resorts"
  },
  {
    _id: '13',
    name: "Sydney",
    country: "Australia",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=800&fit=crop&q=80",
    tag: "Harbour",
    hotelCount: "740+ hotels"
  },
  {
    _id: '14',
    name: "Amsterdam",
    country: "Netherlands",
    image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600&h=800&fit=crop&q=80",
    tag: "Canals",
    hotelCount: "670+ hotels"
  },
  {
    _id: '15',
    name: "Cairo",
    country: "Egypt",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&h=800&fit=crop&q=80",
    tag: "Wonders",
    hotelCount: "520+ hotels"
  },
  {
    _id: '16',
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=800&fit=crop&q=80",
    tag: "Island",
    hotelCount: "430+ boutique stays"
  },
  {
    _id: '17',
    name: "Rio de Janeiro",
    country: "Brazil",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&h=800&fit=crop&q=80",
    tag: "Carnival",
    hotelCount: "610+ hotels"
  },
  {
    _id: '18',
    name: "Abu Dhabi",
    country: "United Arab Emirates",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=800&fit=crop&q=80",
    tag: "Grand",
    hotelCount: "490+ hotels"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [destinations, setDestinations] = useState(fallbackDestinations);
  const destinationsScrollRef = useRef(null);
  const [isDestinationsHovered, setIsDestinationsHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch destinations from backend and merge with fallback data
  const API_BASE = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';
  useEffect(() => {
    fetch(`${API_BASE}/destinations`)
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Prioritize active database destinations configured in Admin CMS
          const dbDestinations = data.data.filter(d => d.isActive !== false && d.status !== 'archived');
          if (dbDestinations.length > 0) {
            const combined = [...dbDestinations];
            fallbackDestinations.forEach(fb => {
              if (!combined.some(d => d.name?.toLowerCase() === fb.name?.toLowerCase())) {
                combined.push(fb);
              }
            });
            setDestinations(combined);
          }
        }
      })
      .catch(() => {
        // Fallback already initialized
      });
  }, []);

  // Smooth scroll sliding controls for destinations carousel
  const scrollDestinationsNext = useCallback(() => {
    if (!destinationsScrollRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = destinationsScrollRef.current;
    const scrollAmount = clientWidth * 0.82;
    if (scrollLeft + clientWidth >= scrollWidth - 16) {
      destinationsScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      destinationsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, []);

  const scrollDestinationsPrev = useCallback(() => {
    if (!destinationsScrollRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = destinationsScrollRef.current;
    const scrollAmount = clientWidth * 0.82;
    if (scrollLeft <= 16) {
      destinationsScrollRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
    } else {
      destinationsScrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  }, []);

  // Auto-advance destinations carousel smoothly every 4.5 seconds
  useEffect(() => {
    if (isDestinationsHovered) return;
    const interval = setInterval(() => {
      scrollDestinationsNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isDestinationsHovered, scrollDestinationsNext]);

  // Scroll smoothly to the search form section
  const scrollToSearchForm = () => {
    const el = document.querySelector(".search-form-section") || document.getElementById("search-form");
    if (el) {
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = scrollTop + rect.top - 120;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Auto-fill and scroll to hero search form when destination card is clicked
  const handleDestinationClick = (dest) => {
    window.dispatchEvent(
      new CustomEvent("selectHeroDestination", {
        detail: { destination: dest }
      })
    );
    scrollToSearchForm();
  };

  const testimonials = [
    { id: 1, name: "Sarah J.", rating: 5, text: "The booking process was so easy and we found an amazing hotel at a great price!", avatar: "SJ", color: "#3b82f6" },
    { id: 2, name: "Michael B.", rating: 5, text: "Great selection of hotels and the customer service was excellent.", avatar: "MB", color: "#10b981" },
    { id: 3, name: "Emily D.", rating: 5, text: "We've used this service for all our trips. Never disappointed.", avatar: "ED", color: "#8b5cf6" },
    { id: 4, name: "David W.", rating: 5, text: "Fantastic experience! User-friendly platform with great deals.", avatar: "DW", color: "#f59e0b" },
  ];

  return (
    <div className="bg-white" style={{ margin: 0, padding: 0 }}>
      <Helmet><title>Telitrip — Travel Smarter</title></Helmet>
      <Header />
      {/* Main Hero Section matching user design */}
      <div className="relative z-30 bg-white overflow-visible">
        <HeroSection />
      </div>

      {/* Content slides over sticky hero */}
      <div className="relative z-10 bg-white">

        {/* ═══════════════════════════════════════════════════════════════════
            FEATURED DESTINATIONS — All 18 Cards, 5 On-Screen View, Smooth Scroll & Sliding Buttons
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative pt-6 sm:pt-10 lg:pt-12 pb-10 sm:pb-14 lg:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto relative">
            
            {/* ── Top Header Row: Title & Subtitle Left, Sliding Buttons Right ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <div className="w-6 h-[2px] bg-gradient-to-r from-[#2563eb] to-[#042770] rounded-full" />
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-blue-600">
                    Top Destinations
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Popular destinations <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-[#042770]">worldwide</span>
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
                  Browse live hotel availability and click any destination to auto-fill search.
                </p>
              </div>

              {/* ── Sliding Navigation Buttons (Always visible in Header) ── */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={scrollDestinationsPrev}
                  aria-label="Previous Destinations"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 hover:border-blue-600 hover:bg-blue-50/60 active:scale-95 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={scrollDestinationsNext}
                  aria-label="Next Destinations"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 hover:border-blue-600 hover:bg-blue-50/60 active:scale-95 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* ── Scrollable Horizontal Cards Strip (5 on-screen on desktop) ── */}
            <div className="relative group">
              {/* Floating Side Left Arrow on Desktop Hover */}
              <button
                type="button"
                onClick={scrollDestinationsPrev}
                aria-label="Scroll Left"
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl items-center justify-center text-gray-700 hover:text-blue-600 hover:border-blue-600 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Floating Side Right Arrow on Desktop Hover */}
              <button
                type="button"
                onClick={scrollDestinationsNext}
                aria-label="Scroll Right"
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl items-center justify-center text-gray-700 hover:text-blue-600 hover:border-blue-600 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Scroll Track with all 18 destination cards */}
              <div
                ref={destinationsScrollRef}
                onMouseEnter={() => setIsDestinationsHovered(true)}
                onMouseLeave={() => setIsDestinationsHovered(false)}
                className="flex items-center gap-3 sm:gap-4 overflow-x-auto scroll-smooth scrollbar-none py-1.5 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory select-none touch-pan-x"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {(destinations.length ? destinations : fallbackDestinations).map((dest) => (
                  <div
                    key={dest._id || dest.name}
                    onClick={() => handleDestinationClick(dest)}
                    className="group/card relative flex-shrink-0 w-[190px] min-[380px]:w-[210px] sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-64px)/5)] rounded-2xl overflow-hidden cursor-pointer bg-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 snap-start active:scale-98"
                    style={{ aspectRatio: "3/4" }}
                  >
                    {/* Card Photo */}
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-700 ease-out pointer-events-none"
                      loading="lazy"
                    />

                    {/* Dark gradient overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)"
                      }}
                    />

                    {/* Tag badge */}
                    {dest.tag && (
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs"
                          style={{
                            background: "rgba(255,255,255,0.22)",
                            backdropFilter: "blur(8px)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.3)"
                          }}
                        >
                          {dest.tag}
                        </span>
                      </div>
                    )}

                    {/* Card Info at Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left pointer-events-none">
                      <h3 className="text-white font-extrabold text-base sm:text-lg leading-tight group-hover/card:text-blue-200 transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-white/75 text-xs mt-0.5 font-medium truncate">
                        {dest.country}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center gap-1.5 text-white/95 text-[11px] font-semibold">
                        <Hotel className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>
                          {dest.hotelCount ||
                            CITY_HOTEL_COUNTS[dest.name] ||
                            "850+ hotels available"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: Why Telitrip — Interactive Full-Bleed Slider (Single Shared Instance)
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden w-full">
          <WhyTeliTripSlider />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            MOBILE HOMEPAGE: Testimonials & CTA
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden">
          {/* ── Testimonials ── */}
          <section className="py-7 px-4" style={{ background: '#f8fafc' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-[2px] bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-emerald-600">
                Traveller Stories
              </span>
            </div>
            <div className="mb-3">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Loved by travellers <span className="text-emerald-600">worldwide</span>
              </h2>
            </div>
            <div className="relative pt-1">
              <Carousel
                arrowPosition="top-right"
                items={testimonials.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-white border border-gray-100/80 shadow-sm h-full">
                    <div className="flex items-center gap-0.5 mb-2.5">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                    </div>
                    <p className="text-gray-700 text-[13px] mb-3.5 leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: t.color }}>{t.avatar}</div>
                      <span className="text-gray-500 text-[12px] font-medium">{t.name}</span>
                    </div>
                  </div>
                ))}
                autoPlayInterval={5000}
                itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
              />
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="px-4 py-6 sm:py-8 text-center">
            <div className="relative overflow-hidden rounded-3xl px-5 py-7 shadow-xl text-left" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <h2 className="text-xl font-bold text-white mb-1.5 relative" style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Ready to explore?
              </h2>
              <p className="text-white/45 text-[12px] mb-4 relative">Find your perfect stay, anywhere in the world.</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={scrollToSearchForm}
                  className="relative px-5 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase text-white active:scale-95 transition-transform cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', letterSpacing: '0.08em', minHeight: 'unset', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
                >
                  Start Searching
                </button>
                <Link
                  to="/contact"
                  className="relative px-5 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase text-white/90 bg-white/10 border border-white/20 active:scale-95 transition-transform"
                  style={{ minHeight: 'unset' }}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            DESKTOP HOMEPAGE: Testimonials & CTA
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block">

          {/* ── SECTION 3: Testimonials ── */}
          <section className="relative py-12 md:py-16 lg:py-20 px-6 lg:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto relative">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-[2px] bg-emerald-500 rounded-full" />
                <span className="text-[11px] font-semibold tracking-widest uppercase text-emerald-600" style={{ letterSpacing: '0.14em' }}>Traveller Stories</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8" style={{ letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                Loved by travellers<br /><span className="text-emerald-600">around the world.</span>
              </h2>
              <div className="relative pt-1">
                <Carousel
                  arrowPosition="top-right"
                  items={testimonials.map((t) => (
                    <div key={t.id} className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all h-full">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                      </div>
                      <p className="text-gray-600 text-[14px] mb-5" style={{ lineHeight: 1.7 }}>"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold" style={{ background: t.color }}>{t.avatar}</div>
                        <span className="text-gray-500 text-[13px] font-medium">{t.name}</span>
                      </div>
                    </div>
                  ))}
                  autoPlayInterval={5000}
                  itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
                />
              </div>
            </div>
          </section>

          {/* ── SECTION 4: CTA ── */}
          <section className="relative py-12 md:py-16 px-6 lg:px-8 bg-gray-50/50 overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.04em', lineHeight: 1.08 }}>
                  Ready to explore<br /><span className="text-blue-600">the world?</span>
                </h2>
                <p className="text-gray-500 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">Join millions of travellers who book smarter with Telitrip.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={scrollToSearchForm} className="px-8 py-3.5 rounded-full text-[13px] font-bold tracking-widest uppercase text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer shadow-md hover:shadow-lg" style={{ letterSpacing: '0.08em', minHeight: 'unset' }}>
                    Start Searching
                  </button>
                  <Link to="/contact" className="px-8 py-3.5 rounded-full text-[13px] font-bold tracking-widest uppercase text-gray-700 bg-white border border-gray-300 hover:border-gray-400 hover:text-gray-900 transition-all cursor-pointer shadow-xs hover:shadow-sm" style={{ letterSpacing: '0.08em', minHeight: 'unset' }}>
                    Contact Us
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        <Footer />
      </div>

      {/* Float animations */}
      <style>{`
        @keyframes float1 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(30px, -20px) scale(1.1); } }
        @keyframes float2 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-20px, 30px) scale(1.15); } }
        @keyframes float3 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(15px, 15px) scale(1.08); } }
      `}</style>
    </div>
  );
};

export default Home;
