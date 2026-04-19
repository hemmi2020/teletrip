import React, { Suspense, lazy, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import HotelSearchForm from "./components/HotelSearchForm";
import DestinationCard from "./components/DestinationCard";
import OfferCard from "./components/OfferCard";
import TestimonialCard from "./components/TestimonialCard";
import { Helmet } from "react-helmet-async";
import Header from "./components/Header";
import Slider from "./components/Slider";
import Row01 from "./components/Row01";
import Accommodation from "./components/Accomodation";
import Services from "./components/Services";
import Footer from "./components/Footer";

const TestimonialsCarousel = ({ testimonials, isMobile }) => {
  const [isPaused, setIsPaused] = useState(false);
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <motion.section
      className="py-12 md:py-16 bg-gray-50 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-center mb-8 underline"
          variants={isMobile ? fadeInUpMobile : fadeInUp}
        >
          What Our Customers Say
        </motion.h2>

        <div className="relative">
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 20s linear infinite;
            }
            .animate-scroll.paused {
              animation-play-state: paused;
            }
          `}</style>
          
          <div 
            className={`flex ${isPaused ? 'animate-scroll paused' : 'animate-scroll'}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div key={`${testimonial.id}-${index}`} className="w-80 flex-shrink-0 px-3">
                <TestimonialCard
                  name={testimonial.name}
                  image={testimonial.image}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInUpMobile = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const staggerContainerMobile = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const scaleInMobile = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const featuredDestinations = [
    {
      id: 1,
      name: "Paris, France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
      description:
        "Experience the city of love with its iconic landmarks and cuisine.",
    },
    {
      id: 2,
      name: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop",
      description:
        "Relax on pristine beaches and explore lush tropical landscapes.",
    },
    {
      id: 3,
      name: "New York, USA",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop",
      description:
        "Discover the city that never sleeps with its vibrant culture.",
    },
  ];

  const specialOffers = [
    {
      id: 1,
      title: "Summer Getaway",
      discount: "25% OFF",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop",
      description:
        "Book your summer vacation now and get 25% off on selected hotels.",
    },
    {
      id: 2,
      title: "Weekend Escape",
      discount: "Free Breakfast",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop",
      description:
        "Enjoy complimentary breakfast when you book a weekend stay.",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      image: "https://ui-avatars.com/api/?name=Sarah+Johnson&size=100&background=3b82f6&color=fff",
      rating: 5,
      text: "The booking process was so easy and we found an amazing hotel at a great price!",
    },
    {
      id: 2,
      name: "Michael Brown",
      image: "https://ui-avatars.com/api/?name=Michael+Brown&size=100&background=10b981&color=fff",
      rating: 4,
      text: "Great selection of hotels and the customer service was excellent.",
    },
    {
      id: 3,
      name: "Emily Davis",
      image: "https://ui-avatars.com/api/?name=Emily+Davis&size=100&background=8b5cf6&color=fff",
      rating: 5,
      text: "We've used this service for all our trips and have never been disappointed.",
    },
    {
      id: 4,
      name: "David Wilson",
      image: "https://ui-avatars.com/api/?name=David+Wilson&size=100&background=f59e0b&color=fff",
      rating: 5,
      text: "Fantastic experience! The platform is user-friendly and offers great deals.",
    },
    {
      id: 5,
      name: "Jessica Martinez",
      image: "https://ui-avatars.com/api/?name=Jessica+Martinez&size=100&background=ec4899&color=fff",
      rating: 5,
      text: "Best travel booking site I've used. Highly recommend to everyone!",
    },
    {
      id: 6,
      name: "Robert Taylor",
      image: "https://ui-avatars.com/api/?name=Robert+Taylor&size=100&background=6366f1&color=fff",
      rating: 4,
      text: "Quick booking process and excellent customer support. Very satisfied!",
    },
  ];
  return (
    <div style={{ background: '#050a14' }}>
      <Helmet><title>Telitrip — Travel Smarter</title></Helmet>
      <Header />

      {/* ── Hero (sticky, behind header) ── */}
      <Slider />

      {/* ── All content slides over the sticky hero ── */}
      <div className="relative z-10" style={{ background: '#050a14' }}>

        {/* ── SECTION 1: Our Deals ── */}
        <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-blue-500" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-400" style={{ letterSpacing: '0.14em' }}>Featured Destinations</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Handpicked deals,<br />
                <span style={{ color: '#60a5fa' }}>just for you.</span>
              </h2>
              <p className="text-white/40 text-sm max-w-xs md:text-right" style={{ lineHeight: 1.7 }}>
                Curated stays across the world's most sought-after destinations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {featuredDestinations.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{ aspectRatio: i === 0 ? '4/5' : '4/5', background: '#0d1526' }}
                >
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,10,20,0.9) 0%, transparent 60%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg mb-1" style={{ letterSpacing: '-0.02em' }}>{dest.name}</h3>
                    <p className="text-white/50 text-[13px]" style={{ lineHeight: 1.5 }}>{dest.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Why Telitrip ── */}
        <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-purple-500" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-purple-400" style={{ letterSpacing: '0.14em' }}>Why Telitrip</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-16" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Everything you need,<br />
              <span style={{ color: '#a78bfa' }}>in one place.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '🏨', title: 'Hotels', desc: '250,000+ properties worldwide. Best rate guaranteed on every booking.' },
                { icon: '🚗', title: 'Transfers', desc: 'Airport pickups, private cars and shared shuttles — all pre-booked.' },
                { icon: '🎭', title: 'Experiences', desc: 'Tours, activities and local adventures curated by experts.' },
                { icon: '💳', title: 'Best Prices', desc: 'We compare rates across providers so you always pay less.' },
                { icon: '🔒', title: 'Secure Booking', desc: 'End-to-end encrypted payments. Your data stays private.' },
                { icon: '🌍', title: 'Global Coverage', desc: 'Available in 190+ countries. Book anywhere, anytime.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-6 rounded-2xl group hover:scale-[1.02] transition-transform duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-white font-semibold text-lg mb-2" style={{ letterSpacing: '-0.02em' }}>{item.title}</h3>
                  <p className="text-white/40 text-[13px]" style={{ lineHeight: 1.65 }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Testimonials ── */}
        <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-t overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-emerald-500" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-emerald-400" style={{ letterSpacing: '0.14em' }}>Traveller Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-12" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Loved by travellers<br />
              <span style={{ color: '#34d399' }}>around the world.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.slice(0, 6).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="p-6 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <span key={j} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>
                    ))}
                  </div>
                  <p className="text-white/70 text-[14px] mb-5" style={{ lineHeight: 1.7 }}>"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.image} alt={t.name} className="w-9 h-9 rounded-full" />
                    <span className="text-white/50 text-[13px] font-medium">{t.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: CTA ── */}
        <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6" style={{ letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                Ready to explore<br />
                <span style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>the world?</span>
              </h2>
              <p className="text-white/40 text-base sm:text-lg mb-10 max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
                Join millions of travellers who book smarter with Telitrip.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-8 py-3.5 rounded-full text-[13px] font-bold tracking-widest uppercase text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', letterSpacing: '0.08em', minHeight: 'unset' }}
                >
                  Start Searching
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-8 py-3.5 rounded-full text-[13px] font-semibold text-white/70 hover:text-white transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', minHeight: 'unset' }}
                >
                  Learn More
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
