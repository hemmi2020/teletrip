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
      <section className="relative w-full min-h-screen bg-gray-900 overflow-hidden">
        {/* Background Images */}
        {images.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-between min-h-screen">
          {/* Top - Headline */}
          <div className="flex-1 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 sm:pt-12">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/90 text-xs sm:text-sm font-medium tracking-wide">Trusted by 10,000+ travellers worldwide</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-4 sm:mb-6">
                  Find your perfect
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">stay anywhere</span>
                </h1>
                <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-lg mb-6">
                  Compare prices across 250,000+ hotels worldwide. Best rates guaranteed with free cancellation on most bookings.
                </p>
                {/* Trust badges */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <span className="text-white/80 text-sm font-medium">4.8/5 Rating</span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <div className="text-white/80 text-sm font-medium">Best Price Guarantee</div>
                  <div className="w-px h-4 bg-white/20 hidden sm:block" />
                  <div className="text-white/80 text-sm font-medium hidden sm:block">24/7 Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom - Search Form */}
          <div className="w-full pb-8 sm:pb-12 lg:pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <HotelSearchForm />
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1 rounded-full transition-all duration-500 ${i === active ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Slider;
