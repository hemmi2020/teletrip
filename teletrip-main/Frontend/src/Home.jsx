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
import { Hotel, Car, Compass, CreditCard, Shield, Globe } from "lucide-react";

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
    <div className="bg-white">
      <Helmet><title>Telitrip — Travel Smarter</title></Helmet>
      <Header />
      <Slider />

      {/* Content slides over sticky hero */}
      <div className="relative z-10 bg-white">

        {/* ── SECTION 1: Our Deals ── */}
        <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* 3D gradient shape — blue/purple blob */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)', filter: 'blur(80px)' }} />
          <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #06b6d4, #3b82f6)', filter: 'blur(60px)', animation: 'float1 8s ease-in-out infinite alternate' }} />

          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-blue-500" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-500" style={{ letterSpacing: '0.14em' }}>Featured Destinations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Handpicked deals,<br /><span className="text-blue-600">just for you.</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-md mb-12" style={{ lineHeight: 1.7 }}>Curated stays across the world's most sought-after destinations.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredDestinations.map((dest, i) => (
                <motion.div key={dest.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-100" style={{ aspectRatio: '4/5' }}>
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg mb-1">{dest.name}</h3>
                    <p className="text-white/60 text-[13px]">{dest.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Why Telitrip ── */}
        <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
          {/* 3D gradient shape — purple/pink */}
          <div className="absolute top-20 -right-40 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #a855f7, #ec4899)', filter: 'blur(70px)', animation: 'float2 10s ease-in-out infinite alternate' }} />
          <div className="absolute -bottom-20 left-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b, #ef4444)', filter: 'blur(60px)', animation: 'float3 12s ease-in-out infinite alternate' }} />

          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-purple-500" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-purple-500" style={{ letterSpacing: '0.14em' }}>Why Telitrip</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-14" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Everything you need,<br /><span className="text-purple-600">in one place.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { Icon: Hotel, title: 'Hotels', desc: '250,000+ properties worldwide. Best rate guaranteed.', color: '#2563eb' },
                { Icon: Car, title: 'Transfers', desc: 'Airport pickups, private cars and shared shuttles.', color: '#059669' },
                { Icon: Compass, title: 'Experiences', desc: 'Tours, activities and local adventures curated by experts.', color: '#7c3aed' },
                { Icon: CreditCard, title: 'Best Prices', desc: 'We compare rates across providers so you pay less.', color: '#f59e0b' },
                { Icon: Shield, title: 'Secure Booking', desc: 'End-to-end encrypted payments. Your data stays private.', color: '#ef4444' },
                { Icon: Globe, title: 'Global Coverage', desc: 'Available in 190+ countries. Book anywhere, anytime.', color: '#0891b2' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:border-gray-200 hover:scale-[1.02] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${item.color}15` }}>
                    <item.Icon style={{ width: 24, height: 24, color: item.color, strokeWidth: 1.8 }} />
                  </div>
                  <h3 className="text-gray-900 font-semibold text-lg mb-2" style={{ letterSpacing: '-0.02em' }}>{item.title}</h3>
                  <p className="text-gray-500 text-[13px]" style={{ lineHeight: 1.65 }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Testimonials ── */}
        <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* 3D gradient shape — green/teal */}
          <div className="absolute -top-20 left-1/3 w-96 h-96 rounded-full opacity-12" style={{ background: 'radial-gradient(circle, #10b981, #06b6d4)', filter: 'blur(80px)', animation: 'float1 14s ease-in-out infinite alternate' }} />

          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-emerald-500" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-emerald-500" style={{ letterSpacing: '0.14em' }}>Traveller Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-12" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Loved by travellers<br /><span className="text-emerald-600">around the world.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.slice(0, 6).map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
                  </div>
                  <p className="text-gray-600 text-[14px] mb-5" style={{ lineHeight: 1.7 }}>"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.image} alt={t.name} className="w-9 h-9 rounded-full" />
                    <span className="text-gray-500 text-[13px] font-medium">{t.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: CTA ── */}
        <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
          {/* 3D gradient shape — amber/orange */}
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #f59e0b, #ef4444)', filter: 'blur(70px)', animation: 'float2 9s ease-in-out infinite alternate' }} />
          <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)', filter: 'blur(60px)', animation: 'float3 11s ease-in-out infinite alternate' }} />

          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6" style={{ letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                Ready to explore<br /><span className="text-blue-600">the world?</span>
              </h2>
              <p className="text-gray-500 text-base sm:text-lg mb-10 max-w-lg mx-auto">Join millions of travellers who book smarter with Telitrip.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
