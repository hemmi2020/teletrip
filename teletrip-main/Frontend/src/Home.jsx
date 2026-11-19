import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WhyTeliTripSlider from "./components/WhyTeliTripSlider";
import Slider from "./components/Slider";
import Footer from "./components/Footer";
import Carousel from "./components/Carousel";
import { Hotel, Car, Compass, CreditCard, Shield, Globe, ArrowRight, Star, TrendingUp, MapPin } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch destinations from backend
  const API_BASE = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';
  useEffect(() => {
    fetch(`${API_BASE}/destinations`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.length) setDestinations(data.data);
        else setDestinations(fallbackDestinations);
      })
      .catch(() => setDestinations(fallbackDestinations));
  }, []);

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
    Bangkok: "1,100+ hotels"
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
    }
  ];

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
            MOBILE HOMEPAGE — full-width, no side padding on sections
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden">

          {/* ── Featured Destinations ── */}
          <section className="pt-8 pb-8 px-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Popular Destinations</h2>
                <p className="text-xs text-gray-500 mt-0.5">Explore hotel availability citywise</p>
              </div>
              <Link to="/destinations" data-testid="view-all-destinations" className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                View All <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
            <div className="relative pt-6">
            <Carousel
              arrowPosition="top-right"
              items={(destinations.length ? destinations : fallbackDestinations).map((dest) => (
                <div
                  key={dest._id}
                  onClick={() => navigate(`/hotel-search-results?city=${encodeURIComponent(dest.name)}&country=${encodeURIComponent(dest.country)}`)}
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{ aspectRatio: '3/4' }}
                >
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 45%, transparent 70%)' }} />
                  {dest.tag && (
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                        {dest.tag}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <h3 className="text-white font-bold text-[15px] leading-tight">{dest.name}</h3>
                    <p className="text-white/70 text-[11px] mt-0.5">{dest.country}</p>
                    <div className="mt-2 pt-1.5 border-t border-white/15 flex items-center gap-1 text-white/90 text-[10px] font-medium">
                      <Hotel className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{dest.hotelCount || CITY_HOTEL_COUNTS[dest.name] || '850+ hotels'}</span>
                    </div>
                  </div>
                </div>
              ))}
              autoPlayInterval={4000}
              itemsPerView={{ mobile: 1.25, tablet: 2, desktop: 5 }}
            />
            </div>
          </section>

          {/* ── Why Telitrip — Interactive Full-Bleed Card-Expansion Slider ── */}
          <div className="py-2">
            <WhyTeliTripSlider />
          </div>

          {/* ── Testimonials ── */}
          <section className="pb-8 px-4" style={{ background: '#f8fafc' }}>
            <div className="pt-7 pb-3">
              <h2 className="text-lg font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Loved by travellers</h2>
            </div>
            <div className="relative pt-10">
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
          <section className="px-4 py-10 text-center">
            <div className="relative overflow-hidden rounded-3xl px-5 py-9 shadow-xl text-left" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <h2 className="text-xl font-bold text-white mb-2 relative" style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Ready to explore?
              </h2>
              <p className="text-white/45 text-[12px] mb-5 relative">Find your perfect stay, anywhere in the world.</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
            DESKTOP HOMEPAGE
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block">

          {/* ── SECTION 1: Featured Destinations ── */}
          <section className="relative py-16 md:py-24 px-6 lg:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-blue-600" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-blue-600" style={{ letterSpacing: '0.14em' }}>Top Destinations</span>
                </div>
                <Link to="/destinations" data-testid="view-all-destinations" className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  View All <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                Popular destinations <span className="text-blue-600">worldwide</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mb-8" style={{ lineHeight: 1.6 }}>
                Browse live hotel availability and compare direct wholesale rates across key cities.
              </p>

              <div className="relative pt-6">
              <Carousel
                arrowPosition="top-right"
                items={(destinations.length ? destinations : fallbackDestinations).map((dest) => (
                  <div
                    key={dest._id}
                    onClick={() => navigate(`/hotel-search-results?city=${encodeURIComponent(dest.name)}&country=${encodeURIComponent(dest.country)}`)}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-100 shadow-xs hover:shadow-xl transition-all duration-300"
                    style={{ aspectRatio: '3/4' }}
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 45%, transparent 70%)' }}
                    />
                    {dest.tag && (
                      <div className="absolute top-3 left-3">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs"
                          style={{
                            background: 'rgba(255,255,255,0.22)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}
                        >
                          {dest.tag}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                      <h3 className="text-white font-bold text-base sm:text-lg leading-tight group-hover:text-blue-200 transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5 font-medium truncate">{dest.country}</p>
                      <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center gap-1.5 text-white/90 text-[11px] font-semibold">
                        <Hotel className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{dest.hotelCount || CITY_HOTEL_COUNTS[dest.name] || '850+ hotels available'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                autoPlayInterval={4000}
                itemsPerView={{ mobile: 1.25, tablet: 3, desktop: 5 }}
              />
              </div>
            </div>
          </section>

          {/* ── SECTION 2: Why Telitrip — Interactive Full-Bleed Card-Expansion Slider ── */}
          <section className="relative overflow-hidden">
            <WhyTeliTripSlider />
          </section>

          {/* ── SECTION 3: Testimonials ── */}
          <section className="relative py-20 md:py-28 px-6 lg:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-emerald-500" />
                <span className="text-[11px] font-semibold tracking-widest uppercase text-emerald-500" style={{ letterSpacing: '0.14em' }}>Traveller Stories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Loved by travellers<br /><span className="text-emerald-600">around the world.</span>
              </h2>
              <div className="relative pt-10">
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
          <section className="relative py-24 md:py-32 px-6 lg:px-8 bg-gray-50/50 overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" style={{ letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                  Ready to explore<br /><span className="text-blue-600">the world?</span>
                </h2>
                <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto">Join millions of travellers who book smarter with Telitrip.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-3.5 rounded-full text-[13px] font-bold tracking-widest uppercase text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer shadow-md hover:shadow-lg" style={{ letterSpacing: '0.08em', minHeight: 'unset' }}>
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
