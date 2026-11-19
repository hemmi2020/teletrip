'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Car,
  Compass,
  CreditCard,
  ShieldCheck,
  Globe,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const SLIDES = [
  {
    id: "hotels",
    serviceTab: "stays",
    title: "HOTELS",
    description: "250,000+ properties worldwide with direct member rates and guaranteed booking.",
    cta: "Explore Hotels",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&auto=format&fit=crop&q=85"
  },
  {
    id: "transfers",
    serviceTab: "transfers",
    title: "TRANSFERS",
    description: "Reliable airport pickups, private executive cars, and premium group shuttles.",
    cta: "Book a Transfer",
    icon: Car,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&auto=format&fit=crop&q=85"
  },
  {
    id: "experiences",
    serviceTab: "experiences",
    title: "EXPERIENCES",
    description: "Handpicked tours, desert safaris, yacht cruises, and bucket-list cultural excursions.",
    cta: "Discover Experiences",
    icon: Compass,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&auto=format&fit=crop&q=85"
  },
  {
    id: "best-prices",
    serviceTab: "stays",
    title: "BEST PRICES",
    description: "We compare rates across global inventory so you never overpay for your journey.",
    cta: "Compare Deals",
    icon: CreditCard,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&auto=format&fit=crop&q=85"
  },
  {
    id: "secure-booking",
    serviceTab: "stays",
    title: "SECURE BOOKING",
    description: "End-to-end encrypted payments with instant vouchers and 24/7 dedicated support.",
    cta: "Learn More",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&auto=format&fit=crop&q=85"
  },
  {
    id: "global-coverage",
    serviceTab: "stays",
    title: "GLOBAL COVERAGE",
    description: "Available in 190+ countries across 6 continents. Book anywhere, travel everywhere.",
    cta: "View Destinations",
    icon: Globe,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&auto=format&fit=crop&q=85"
  }
];

export default function WhyTeliTripSlider() {
  const navigate = useNavigate();

  // Active queue: queue[0] is active background slide; queue.slice(1) are visible preview cards
  const [queue, setQueue] = useState(SLIDES);
  const [isHovered, setIsHovered] = useState(false);
  const isTransitioningRef = useRef(false);
  const autoPlayTimerRef = useRef(null);

  const activeSlide = queue[0];
  const originalIndex = SLIDES.findIndex((s) => s.id === activeSlide.id);
  const slideNumber = String(originalIndex + 1).padStart(2, "0");
  const totalSlides = String(SLIDES.length).padStart(2, "0");
  const progressPercent = ((originalIndex + 1) / SLIDES.length) * 100;

  // Preload all high-res slide images on mount
  useEffect(() => {
    SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  // Advance to next slide with 750ms throttle
  const handleNext = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setQueue((prev) => [...prev.slice(1), prev[0]]);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 750);
  }, []);

  // Go to previous slide
  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setQueue((prev) => {
      const last = prev[prev.length - 1];
      return [last, ...prev.slice(0, prev.length - 1)];
    });

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 750);
  }, []);

  // Jump directly to clicked preview card
  const handleCardClick = useCallback((slideId) => {
    if (isTransitioningRef.current) return;
    const targetIdx = queue.findIndex((s) => s.id === slideId);
    if (targetIdx <= 0) return;

    isTransitioningRef.current = true;
    setQueue((prev) => [...prev.slice(targetIdx), ...prev.slice(0, targetIdx)]);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 750);
  }, [queue]);

  // Auto-advance every 6000ms (paused on hover or active transition)
  useEffect(() => {
    if (isHovered) return;

    autoPlayTimerRef.current = setInterval(() => {
      if (!isTransitioningRef.current) {
        handleNext();
      }
    }, 6000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [handleNext, isHovered]);

  // Keyboard navigation: ArrowLeft / ArrowRight
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // CTA navigation handler: Switch hero search form to corresponding service tab and scroll to it
  const handleCtaClick = (slide) => {
    const tab = slide.serviceTab || "stays";

    if (window.location.pathname !== "/" && window.location.pathname !== "") {
      navigate(`/?tab=${tab}`);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("switchHeroTab", {
        detail: { tab }
      })
    );

    const searchFormEl =
      document.querySelector(".search-form-section") ||
      document.getElementById("search-form");

    if (searchFormEl) {
      const rect = searchFormEl.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = scrollTop + rect.top - 120;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-0 sm:min-h-[600px] lg:h-[78vh] lg:min-h-[580px] lg:max-h-[760px] overflow-hidden bg-slate-950 text-white select-none flex flex-col justify-between py-6 sm:py-8 lg:py-10"
      aria-label="Why TeliTrip Interactive Slider"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          CINEMATIC FULL-BLEED BACKGROUND LAYER (Stable Aspect Ratio, Zero Distortion)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              opacity: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
              scale: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
            {/* Layered high-contrast dark vignette overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT CONTAINER (Independent Layer, Unwarped)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full flex-1 flex flex-col justify-between">
        
        {/* ── TOP SECTION HEADER: Section Identity without Duplicate Text ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-3 lg:mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-[2px] bg-[#2563EB]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#3b82f6]">
              Why TeliTrip
            </span>
          </div>
          <span className="hidden sm:inline text-white/30 text-xs">•</span>
          <h2 className="text-sm sm:text-base font-semibold text-white/90 tracking-tight">
            Everything you need, in one place.
          </h2>
        </div>

        {/* ── 2-COLUMN MAIN BODY: Masked Typography Left, Preview Strip Right ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 my-auto w-full py-2 sm:py-4">
          
          {/* ════ LEFT COLUMN: Masked Staggered Typography (~45% width) ════ */}
          <div className="w-full lg:w-[45%] max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col"
              >
                {/* Bold Condensed Uppercase Headline (Clean, no upper eyebrow lines) */}
                <div className="overflow-hidden mb-3 sm:mb-4">
                  <motion.h3
                    variants={{
                      initial: { y: "100%", opacity: 0 },
                      animate: { y: "0%", opacity: 1 },
                      exit: { y: "-100%", opacity: 0 }
                    }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => handleCtaClick(activeSlide)}
                    className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[0.98] text-white cursor-pointer hover:text-blue-200 transition-colors"
                  >
                    {activeSlide.title}
                  </motion.h3>
                </div>

                {/* 2-line Description */}
                <div className="overflow-hidden mb-5 sm:mb-6 lg:mb-8">
                  <motion.p
                    variants={{
                      initial: { y: "100%", opacity: 0 },
                      animate: { y: "0%", opacity: 1 },
                      exit: { y: "-100%", opacity: 0 }
                    }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-sm sm:text-base text-white/80 max-w-md leading-relaxed font-normal"
                  >
                    {activeSlide.description}
                  </motion.p>
                </div>

                {/* CTA Row: Circular royal-blue icon button + pill-shaped outlined CTA button */}
                <div className="overflow-hidden">
                  <motion.div
                    variants={{
                      initial: { y: "100%", opacity: 0 },
                      animate: { y: "0%", opacity: 1 },
                      exit: { y: "-100%", opacity: 0 }
                    }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-4 pt-1"
                  >
                    <button
                      type="button"
                      onClick={() => handleCtaClick(activeSlide)}
                      aria-label={activeSlide.cta}
                      className="w-11 h-11 rounded-full bg-[#2563EB] hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                    >
                      <activeSlide.icon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCtaClick(activeSlide)}
                      className="rounded-full border border-white/60 hover:border-white px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-white hover:text-slate-950 transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      {activeSlide.cta}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ════ RIGHT COLUMN: Horizontal Sliding Preview Cards (~55% width) ════ */}
          <div className="w-full lg:w-[55%] overflow-visible py-1">
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 overflow-x-auto lg:overflow-visible scrollbar-none pb-2 pt-1 -mr-4 pr-4 sm:mr-0 sm:pr-0 touch-pan-x">
              <AnimatePresence mode="popLayout" initial={false}>
                {queue.slice(1).map((slide) => {
                  return (
                    <motion.div
                      key={slide.id}
                      layout="position"
                      initial={{ opacity: 0, scale: 0.88, x: 40 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -40 }}
                      transition={{
                        layout: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.35 },
                        scale: { duration: 0.45 }
                      }}
                      onClick={() => handleCardClick(slide.id)}
                      whileHover={{ scale: 1.04, y: -4 }}
                      className="group relative w-[145px] h-[210px] sm:w-[175px] sm:h-[260px] lg:w-[210px] lg:h-[310px] rounded-2xl overflow-hidden shadow-2xl shrink-0 cursor-pointer border border-white/10 hover:border-white/40 transition-colors bg-slate-900"
                    >
                      {/* Preview Card Image */}
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                        loading="lazy"
                      />

                      {/* Card Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />

                      {/* Top-Right Category Icon (One-click jump to service search) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCtaClick(slide);
                        }}
                        title={`Search ${slide.title}`}
                        aria-label={`Search ${slide.title}`}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:bg-[#2563EB] hover:border-transparent transition-colors duration-300 z-10 cursor-pointer"
                      >
                        <slide.icon className="w-4 h-4" />
                      </button>

                      {/* Card Info at bottom-left: Clean uppercase title without upper heading lines or badges */}
                      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
                        <div className="text-sm lg:text-base font-extrabold text-white tracking-wide uppercase leading-tight truncate drop-shadow-md">
                          {slide.title}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ════ BOTTOM CONTROLS: Nav Buttons, Progress Track, Slide Counter ════ */}
        <div className="w-full flex items-center justify-between gap-3 sm:gap-6 pt-4 sm:pt-5 border-t border-white/10">
          
          {/* Previous / Next Circular Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/40 hover:border-white hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Slide"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/40 hover:border-white hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Animated Royal-Blue Progress Track */}
          <div className="h-[2px] bg-white/20 flex-1 overflow-hidden rounded-full max-w-xs sm:max-w-md lg:max-w-lg mx-2">
            <motion.div
              className="h-full bg-[#2563EB]"
              initial={{ width: "16.67%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Large Two-Digit Slide Counter (Rolling Vertically) */}
          <div className="flex items-baseline gap-1.5 shrink-0">
            <div className="overflow-hidden h-9 sm:h-10 flex items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={slideNumber}
                  initial={{ y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -28, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tabular-nums text-white inline-block"
                >
                  {slideNumber}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-white/40 text-xs sm:text-sm font-semibold tracking-wider">
              / {totalSlides}
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
