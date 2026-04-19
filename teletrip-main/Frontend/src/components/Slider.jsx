import React, { useEffect, useState } from "react";
import HotelSearchForm from "./HotelSearchForm";

const Slider = () => {
  const images = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=1080&fit=crop&q=80",
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setActive(p => (p === images.length - 1 ? 0 : p + 1)), 6000);
    return () => clearTimeout(id);
  }, [active, images.length]);

  return (
    <section className="sticky top-0 w-full bg-gray-900 z-0 overflow-hidden" style={{ height: '100svh', minHeight: 550 }}>
      {/* Photo slideshow */}
      <div className="absolute inset-0">
        {images.map((img, i) => (
          <div key={i} className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      </div>

      {/* Content — responsive vertical layout */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end sm:justify-center px-3 sm:px-4 pb-8 sm:pb-0 pt-24 sm:pt-0 text-center">
        <div className="max-w-7xl w-full mx-auto mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-5" style={{ letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Find your perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">stay anywhere</span>
          </h1>
          <p className="text-sm sm:text-lg text-white/60 max-w-xl mx-auto mb-0">
            Compare prices across 250,000+ hotels. Best rates guaranteed.
          </p>
        </div>
        <div className="max-w-5xl w-full mx-auto search-form-section">
          <HotelSearchForm />
        </div>
      </div>

      {/* Dots — above bottom nav on mobile */}
      <div className="absolute bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {images.map((_, i) => (
          <span key={i} onClick={() => setActive(i)} className={`block rounded-full transition-all duration-500 cursor-pointer ${i === active ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'}`} />
        ))}
      </div>
    </section>
  );
};

export default Slider;
