import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Header from "./components/Header";
import Slider from "./components/Slider";
import Footer from "./components/Footer";
import { Hotel, Car, Compass, CreditCard, Shield, Globe, ArrowRight, Star, Sparkles, TrendingUp, MapPin } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const featuredDestinations = [
    { id: 1, name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=800&fit=crop", tag: "Popular" },
    { id: 2, name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=800&fit=crop", tag: "Trending" },
    { id: 3, name: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=800&fit=crop", tag: "Top Rated" },
    { id: 4, name: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=800&fit=crop", tag: "Luxury" },
    { id: 5, name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=800&fit=crop", tag: "Culture" },
  ];

  const testimonials = [
    { id: 1, name: "Sarah J.", rating: 5, text: "The booking process was so easy and we found an amazing hotel at a great price!", avatar: "SJ", color: "#3b82f6" },
    { id: 2, name: "Michael B.", rating: 5, text: "Great selection of hotels and the customer service was excellent.", avatar: "MB", color: "#10b981" },
    { id: 3, name: "Emily D.", rating: 5, text: "We've used this service for all our trips. Never disappointed.", avatar: "ED", color: "#8b5cf6" },
    { id: 4, name: "David W.", rating: 5, text: "Fantastic experience! User-friendly platform with great deals.", avatar: "DW", color: "#f59e0b" },
  ];

  const stats = [
    { value: "250K+", label: "Hotels" },
    { value: "190+", label: "Countries" },
    { value: "4.8", label: "Rating" },
    { value: "1M+", label: "Bookings" },
  ];

  return (
    <div className="bg-white">
      <Helmet><title>Telitrip — Travel Smarter</title></Helmet>
      <Header />
      <Slider />

      {/* Content slides over sticky hero */}
      <div className="relative z-10 bg-white">

        {/* ═══════════════════════════════════════════════════════════════════
            MOBILE HOMEPAGE — completely custom layout for < md
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden">

          {/* ── Quick Actions ── */}
          <section className="px-4 pt-8 pb-6">
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {[
                { icon: Hotel, label: 'Hotels', color: '#2563eb', bg: '#eff6ff' },
                { icon: Car, label: 'Transfers', color: '#059669', bg: '#ecfdf5' },
                { icon: Compass, label: 'Experiences', color: '#7c3aed', bg: '#f5f3ff' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = document.querySelector('.search-form-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-full flex-shrink-0 transition-all active:scale-95"
                  style={{ background: item.bg, border: `1px solid ${item.color}20`, minHeight: 'unset' }}
                >
                  <item.icon style={{ width: 18, height: 18, color: item.color, strokeWidth: 2 }} />
                  <span className="text-[13px] font-semibold" style={{ color: item.color }}>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Stats Row ── */}
          <section className="px-4 pb-8">
            <div className="grid grid-cols-4 gap-2">
              {stats.map((s, i) => (
                <div key={i} className="text-center py-3 rounded-2xl" style={{ background: '#f8fafc' }}>
                  <div className="text-[16px] font-bold text-gray-900" style={{ letterSpacing: '-0.03em' }}>{s.value}</div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Featured Destinations ── */}
          <section className="pb-10">
            <div className="px-4 mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-amber-500">Explore</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900" style={{ letterSpacing: '-0.03em' }}>Top Destinations</h2>
              </div>
              <button className="text-[11px] font-semibold text-blue-600 flex items-center gap-1" style={{ minHeight: 'unset' }}>
                See all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
              {featuredDestinations.map((dest) => (
                <div key={dest.id} className="flex-shrink-0 w-[52vw] snap-start relative overflow-hidden rounded-3xl" style={{ aspectRatio: '3/4' }}>
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 40%, transparent 60%)' }} />
                  {/* Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                      {dest.tag}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-[17px] leading-tight" style={{ letterSpacing: '-0.02em' }}>{dest.name}</h3>
                    <p className="text-white/60 text-[12px] mt-0.5">{dest.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Why Telitrip — Bento Grid ── */}
          <section className="px-4 pb-10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-purple-500">Why Us</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ letterSpacing: '-0.03em' }}>Everything in one place</h2>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { Icon: Hotel, title: 'Hotels', desc: '250K+ properties', color: '#2563eb', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
                { Icon: Car, title: 'Transfers', desc: 'Airport & city', color: '#059669', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' },
                { Icon: Compass, title: 'Experiences', desc: 'Tours & activities', color: '#7c3aed', bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' },
                { Icon: CreditCard, title: 'Best Prices', desc: 'Rate comparison', color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' },
                { Icon: Shield, title: 'Secure', desc: 'Encrypted payments', color: '#ef4444', bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' },
                { Icon: Globe, title: 'Global', desc: '190+ countries', color: '#0891b2', bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="p-4 rounded-2xl relative overflow-hidden"
                  style={{ background: item.bg }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: `${item.color}18` }}>
                    <item.Icon style={{ width: 17, height: 17, color: item.color, strokeWidth: 2 }} />
                  </div>
                  <h3 className="text-gray-900 font-semibold text-[13px] mb-0.5" style={{ letterSpacing: '-0.01em' }}>{item.title}</h3>
                  <p className="text-gray-500 text-[11px]">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section className="pb-10" style={{ background: '#f8fafc' }}>
            <div className="px-4 pt-8 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-semibold tracking-widest uppercase text-amber-500">Reviews</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900" style={{ letterSpacing: '-0.03em' }}>Loved by travellers</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
              {testimonials.map((t) => (
                <div key={t.id} className="flex-shrink-0 w-[75vw] snap-start p-4 rounded-2xl bg-white border border-gray-100/80 shadow-sm">
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-gray-700 text-[13px] mb-4 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: t.color }}>{t.avatar}</div>
                    <span className="text-gray-500 text-[12px] font-medium">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="px-4 py-12 text-center">
            <div className="relative overflow-hidden rounded-3xl px-6 py-10" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

              <h2 className="text-2xl font-bold text-white mb-2 relative" style={{ letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                Ready to explore?
              </h2>
              <p className="text-white/50 text-[13px] mb-6 relative">Find your perfect stay, anywhere in the world.</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="relative px-7 py-3 rounded-full text-[12px] font-bold tracking-widest uppercase text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', letterSpacing: '0.08em', minHeight: 'unset', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
              >
                Start Searching
              </button>
            </div>
          </section>

          {/* Mobile footer spacing for bottom nav */}
          <div className="pb-4" />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            DESKTOP HOMEPAGE — preserved from original
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block">

          {/* ── SECTION 1: Featured Destinations ── */}
          <section className="relative py-20 md:py-28 px-6 lg:px-8 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)', filter: 'blur(80px)' }} />
            <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #06b6d4, #3b82f6)', filter: 'blur(60px)', animation: 'float1 8s ease-in-out infinite alternate' }} />

            <div className="max-w-7xl mx-auto relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-blue-500" />
                <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-500" style={{ letterSpacing: '0.14em' }}>Featured Destinations</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Handpicked deals,<br /><span className="text-blue-600">just for you.</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-md mb-12" style={{ lineHeight: 1.7 }}>Curated stays across the world's most sought-after destinations.</p>

              <div className="grid md:grid-cols-3 gap-5">
                {featuredDestinations.slice(0, 3).map((dest, i) => (
                  <motion.div key={dest.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-100" style={{ aspectRatio: '4/5' }}>
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-bold text-lg mb-1">{dest.name}, {dest.country}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 2: Why Telitrip ── */}
          <section className="relative py-20 md:py-28 px-6 lg:px-8 bg-gray-50 overflow-hidden">
            <div className="absolute top-20 -right-40 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #a855f7, #ec4899)', filter: 'blur(70px)', animation: 'float2 10s ease-in-out infinite alternate' }} />

            <div className="max-w-7xl mx-auto relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-purple-500" />
                <span className="text-[11px] font-semibold tracking-widest uppercase text-purple-500" style={{ letterSpacing: '0.14em' }}>Why Telitrip</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-14" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Everything you need,<br /><span className="text-purple-600">in one place.</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { Icon: Hotel, title: 'Hotels', desc: '250,000+ properties worldwide. Best rate guaranteed.', color: '#2563eb' },
                  { Icon: Car, title: 'Transfers', desc: 'Airport pickups, private cars and shared shuttles.', color: '#059669' },
                  { Icon: Compass, title: 'Experiences', desc: 'Tours, activities and local adventures curated by experts.', color: '#7c3aed' },
                  { Icon: CreditCard, title: 'Best Prices', desc: 'We compare rates across providers so you pay less.', color: '#f59e0b' },
                  { Icon: Shield, title: 'Secure Booking', desc: 'End-to-end encrypted payments. Your data stays private.', color: '#ef4444' },
                  { Icon: Globe, title: 'Global Coverage', desc: 'Available in 190+ countries. Book anywhere, anytime.', color: '#0891b2' },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${item.color}15` }}>
                      <item.Icon style={{ width: 20, height: 20, color: item.color, strokeWidth: 1.8 }} />
                    </div>
                    <h3 className="text-gray-900 font-semibold text-lg mb-2" style={{ letterSpacing: '-0.02em' }}>{item.title}</h3>
                    <p className="text-gray-500 text-[13px] leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
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

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                    </div>
                    <p className="text-gray-600 text-[14px] mb-5" style={{ lineHeight: 1.7 }}>"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold" style={{ background: t.color }}>{t.avatar}</div>
                      <span className="text-gray-500 text-[13px] font-medium">{t.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 4: CTA ── */}
          <section className="relative py-24 md:py-32 px-6 lg:px-8 bg-gray-50 overflow-hidden">
            <div className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #f59e0b, #ef4444)', filter: 'blur(70px)', animation: 'float2 9s ease-in-out infinite alternate' }} />

            <div className="max-w-4xl mx-auto text-center relative">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" style={{ letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                  Ready to explore<br /><span className="text-blue-600">the world?</span>
                </h2>
                <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto">Join millions of travellers who book smarter with Telitrip.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-3.5 rounded-full text-[13px] font-bold tracking-widest uppercase text-white bg-blue-600 hover:bg-blue-700 transition-all" style={{ letterSpacing: '0.08em', minHeight: 'unset' }}>
                    Start Searching
                  </button>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-3.5 rounded-full text-[13px] font-semibold text-gray-600 border border-gray-300 hover:border-gray-400 hover:text-gray-900 transition-all" style={{ minHeight: 'unset' }}>
                    Learn More
                  </button>
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
