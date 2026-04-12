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
    <main className="pt-16 w-full">
      <section className="relative w-full bg-gray-900 overflow-hidden">
        {/* Background Images */}
        {images.map((img, i) => (
          <div key={i} className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        {/* Content */}
        <div className="relative z-10">
          {/* Tagline */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 sm:mb-4">
              Find your perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">stay anywhere</span>
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto">
              Compare prices across 250,000+ hotels. Best rates guaranteed.
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 md:pb-16">
            <HotelSearchForm />
          </div>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`rounded-full transition-all duration-500 ${i === active ? 'w-5 h-1 bg-white' : 'w-1 h-1 bg-white/40'}`} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Slider;
