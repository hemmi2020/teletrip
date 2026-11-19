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

export const SLIDES = [
  {
    id: "hotels",
    eyebrow: "WHY TELITRIP • 01",
    title: "HOTELS",
    description: "250,000+ properties worldwide. Best rate guaranteed.",
    cta: "Explore Hotels",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&auto=format&fit=crop&q=85",
    href: "/hotel-search-results?city=Dubai&country=United%20Arab%20Emirates"
  },
  {
    id: "transfers",
    eyebrow: "WHY TELITRIP • 02",
    title: "TRANSFERS",
    description: "Airport pickups, private cars and shared shuttles.",
    cta: "Book a Transfer",
    icon: Car,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&auto=format&fit=crop&q=85",
    href: "/transfers"
  },
  {
    id: "experiences",
    eyebrow: "WHY TELITRIP • 03",
    title: "EXPERIENCES",
    description: "Tours, activities and local adventures curated by experts.",
    cta: "Discover Experiences",
    icon: Compass,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&auto=format&fit=crop&q=85",
    href: "/activity-search-results"
  },
  {
    id: "best-prices",
    eyebrow: "WHY TELITRIP • 04",
    title: "BEST PRICES",
    description: "We compare rates across providers so you pay less.",
    cta: "Compare Deals",
    icon: CreditCard,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&auto=format&fit=crop&q=85",
    href: "/destinations"
  },
  {
    id: "secure-booking",
    eyebrow: "WHY TELITRIP • 05",
    title: "SECURE BOOKING",
    description: "End-to-end encrypted payments. Your data stays private.",
    cta: "Learn More",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&auto=format&fit=crop&q=85",
    href: "/about"
  },
  {
    id: "global-coverage",
    eyebrow: "WHY TELITRIP • 06",
    title: "GLOBAL COVERAGE",
    description: "Available in 190+ countries. Book anywhere, anytime.",
    cta: "View Destinations",
    icon: Globe,
    image: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1920&auto=format&fit=crop&q=85",
    href: "/destinations"
  }
];

export default function WhyTeliTripSlider() {
  const navigate = useNavigate();

  // Active queue: queue[0] is active background slide; queue.slice(1) are visible preview cards
  const [queue, setQueue] = useState(SLIDES);
  const [previousSlide, setPreviousSlide] = useState(null);
  const [transitionKey, setTransitionKey] = useState(0);
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

  // Advance to next slide with 850ms transition throttle
  const handleNext = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setPreviousSlide(queue[0]);
    setTransitionKey((k) => k + 1);
    setQueue((prev) => [...prev.slice(1), prev[0]]);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 850);
  }, [queue]);

  // Go to previous slide
  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setPreviousSlide(queue[0]);
    setTransitionKey((k) => k + 1);
    setQueue((prev) => {
      const last = prev[prev.length - 1];
      return [last, ...prev.slice(0, prev.length - 1)];
    });

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 850);
  }, [queue]);

  // Jump directly to clicked preview card
  const handleCardClick = useCallback((indexInQueue) => {
    if (isTransitioningRef.current || indexInQueue === 0) return;
    isTransitioningRef.current = true;

    setPreviousSlide(queue[0]);
    setTransitionKey((k) => k + 1);
    setQueue((prev) => [...prev.slice(indexInQueue), ...prev.slice(0, indexInQueue)]);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 850);
  }, [queue]);

  // Auto-advance every 6000ms (paused on hover or transition)
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

  // CTA navigation handler
  const handleCtaClick = (slide) => {
    if (slide.href) {
      if (slide.href.startsWith("/")) {
        navigate(slide.href);
      } else {
        window.location.href = slide.href;
      }
    }
  };

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-[720px] sm:min-h-[680px] lg:h-[85vh] lg:min-h-[650px] lg:max-h-[880px] overflow-hidden bg-slate-950 text-white select-none flex flex-col justify-between"
      aria-label="Why TeliTrip Interactive Slider"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          BACKGROUND LAYERS (Dribbble Globe Express Card-to-Background FLIP)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Outgoing Background: Scales up to 1.05 and fades out behind expanding card */}
        {previousSlide && (
          <motion.div
            key={`prev-bg-${previousSlide.id}-${transitionKey}`}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none"
          >
            <img
              src={previousSlide.image}
              alt={previousSlide.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </motion.div>
        )}

        {/* Active Full-Bleed Background: Connected via layoutId for card expansion */}
        <motion.div
          key={`active-bg-${activeSlide.id}`}
          layoutId={`slide-card-${activeSlide.id}`}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none"
        >
          <img
            src={activeSlide.image}
            alt={activeSlide.title}
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Layered high-contrast dark gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT CONTAINER
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 w-full h-full flex flex-col justify-between py-8 sm:py-10 lg:py-14 flex-1">
        
        {/* ── TOP SECTION HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6 lg:mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-[2px] bg-[#2563EB]" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#3b82f6]">
              Why TeliTrip
            </span>
          </div>
          <span className="hidden sm:inline text-white/30 text-xs">•</span>
          <h2 className="text-sm sm:text-base font-semibold text-white/90 tracking-tight">
            Everything you need, in one place.
          </h2>
        </div>

        {/* ── 2-COLUMN MAIN BODY (Active Typography on Left, Preview Strip on Right) ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 my-auto w-full py-4 sm:py-6">
          
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
                {/* Accent bar & Eyebrow */}
                <div className="overflow-hidden mb-3">
                  <motion.div
                    variants={{
                      initial: { y: "100%", opacity: 0 },
                      animate: { y: "0%", opacity: 1 },
                      exit: { y: "-100%", opacity: 0 }
                    }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-[2px] bg-[#2563EB]" />
                    <span className="text-xs sm:text-sm uppercase tracking-widest text-white/80 font-bold">
                      {activeSlide.eyebrow}
                    </span>
                  </motion.div>
                </div>

                {/* Bold Condensed Uppercase Headline */}
                <div className="overflow-hidden mb-4">
                  <motion.h3
                    variants={{
                      initial: { y: "100%", opacity: 0 },
                      animate: { y: "0%", opacity: 1 },
                      exit: { y: "-100%", opacity: 0 }
                    }}
                    transition={{ duration: 0.55, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl sm:text-5xl lg:text-7xl font-extrabold uppercase tracking-tight leading-[0.95] text-white"
                  >
                    {activeSlide.title}
                  </motion.h3>
                </div>

                {/* 2-line Description */}
                <div className="overflow-hidden mb-8">
                  <motion.p
                    variants={{
                      initial: { y: "100%", opacity: 0 },
                      animate: { y: "0%", opacity: 1 },
                      exit: { y: "-100%", opacity: 0 }
                    }}
                    transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
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
                    transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
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

          {/* ════ RIGHT COLUMN: Horizontal Flex Row of Vertical Preview Cards (~55% width) ════ */}
          <div className="w-full lg:w-[55%] overflow-visible py-2">
            <div className="flex items-center gap-3.5 sm:gap-4 lg:gap-5 overflow-x-auto lg:overflow-visible scrollbar-none pb-4 pt-2 -mr-6 pr-6 lg:mr-0 lg:pr-0">
              {queue.slice(1).map((slide, idx) => {
                return (
                  <motion.div
                    key={slide.id}
                    layoutId={`slide-card-${slide.id}`}
                    layout
                    onClick={() => handleCardClick(idx + 1)}
                    whileHover={{ scale: 1.04, y: -4 }}
                    transition={{
                      layout: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
                      scale: { duration: 0.25 },
                      y: { duration: 0.25 }
                    }}
                    className="group relative w-[160px] h-[240px] sm:w-[180px] sm:h-[270px] lg:w-[210px] lg:h-[310px] rounded-2xl overflow-hidden shadow-2xl shrink-0 cursor-pointer border border-white/10 hover:border-white/40 transition-colors bg-slate-900"
                  >
                    {/* Preview Card Background Image */}
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for Typography Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />

                    {/* Category Icon Badge in top-right */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 group-hover:bg-[#2563EB] group-hover:border-transparent transition-colors duration-300">
                      <slide.icon className="w-4 h-4" />
                    </div>

                    {/* Card Meta Content at bottom-left */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
                      <div className="w-4 h-[2px] bg-white/60 mb-2 group-hover:w-8 group-hover:bg-[#2563EB] transition-all duration-300" />
                      <div className="text-[10px] uppercase tracking-wider text-white/70 font-semibold mb-0.5">
                        {slide.eyebrow}
                      </div>
                      <div className="text-sm lg:text-base font-extrabold text-white tracking-wide uppercase leading-tight truncate">
                        {slide.title}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════ BOTTOM CONTROLS: Nav Buttons, Progress Track, Slide Counter ════ */}
        <div className="w-full flex items-center justify-between gap-4 sm:gap-6 pt-6 border-t border-white/10">
          
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
