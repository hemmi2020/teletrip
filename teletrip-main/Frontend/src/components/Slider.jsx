import React, { useEffect, useState, useRef } from "react";
import HotelSearchForm from "./HotelSearchForm";

const Slider = () => {
  const images = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=1080&fit=crop&q=80",
  ];

  const [active, setActive] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActive((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearTimeout(timeoutRef.current);
  }, [active, images.length]);

  return (
    /*
     * Sticky hero: the section sticks at top:0 while the page scrolls.
     * The next section (deals/content) slides over it from below.
     * z-0 keeps it behind the floating header (z-100) and content sections.
     */
    <section
      className="sticky top-0 w-full bg-gray-900 z-0 overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* BG Images */}
      <div className="absolute inset-0">
        {images.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${
              i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      </div>

      {/* Content — centered vertically, floats over hero */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="max-w-7xl w-full mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3 sm:mb-4">
            Find your perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              stay anywhere
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto mb-8 sm:mb-10">
            Compare prices across 250,000+ hotels. Best rates guaranteed.
          </p>
        </div>

        <div className="max-w-5xl w-full mx-auto px-0 sm:px-6 search-form-section">
          <HotelSearchForm />
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {images.map((_, i) => (
          <span
            key={i}
            onClick={() => setActive(i)}
            className={`block rounded-full transition-all duration-500 cursor-pointer ${
              i === active ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-1 opacity-60">
        <span className="text-white text-[10px] tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-white/50 animate-pulse" />
      </div>
    </section>
  );
};

export default Slider;
