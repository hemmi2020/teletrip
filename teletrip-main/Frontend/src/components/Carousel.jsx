import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// States for the carousel state machine
const PLAYING = "PLAYING";
const PAUSED_HOVER = "PAUSED_HOVER";
const PAUSED_TOUCH = "PAUSED_TOUCH";
const PAUSED_MANUAL = "PAUSED_MANUAL";

/**
 * Pure function to compute the next index with modulo wrapping.
 * Exported for independent testing.
 */
export function computeNextIndex(currentIndex, totalPages) {
  if (totalPages <= 0) return 0;
  return (currentIndex + 1) % totalPages;
}

/**
 * Compute the previous index with modulo wrapping.
 */
export function computePrevIndex(currentIndex, totalPages) {
  if (totalPages <= 0) return 0;
  return (currentIndex - 1 + totalPages) % totalPages;
}

/**
 * Reusable Carousel component with auto-play, arrow navigation,
 * dot indicators, and touch/hover pause behavior.
 */
const Carousel = ({
  items = [],
  autoPlayInterval = 4000,
  pauseOnHover = true,
  touchPauseDuration = 8000,
  showDots = true,
  showArrows = true,
  arrowPosition = "center-sides",
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playState, setPlayState] = useState(PLAYING);
  const [currentItemsPerView, setCurrentItemsPerView] = useState(itemsPerView.desktop);
  const intervalRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / currentItemsPerView);

  // Determine items per view based on viewport width
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentItemsPerView(itemsPerView.mobile);
      } else if (width < 1024) {
        setCurrentItemsPerView(itemsPerView.tablet);
      } else {
        setCurrentItemsPerView(itemsPerView.desktop);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [itemsPerView.mobile, itemsPerView.tablet, itemsPerView.desktop]);

  // Reset currentIndex if it exceeds totalPages after resize
  useEffect(() => {
    if (totalPages > 0 && currentIndex >= totalPages) {
      setCurrentIndex(0);
    }
  }, [totalPages, currentIndex]);

  // Auto-play logic
  useEffect(() => {
    // Don't auto-play if 0 or 1 items, or items fit in view, or paused
    if (totalItems <= 1 || totalItems <= currentItemsPerView || playState !== PLAYING) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => computeNextIndex(prev, totalPages));
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playState, totalPages, totalItems, currentItemsPerView, autoPlayInterval]);

  // Cleanup touch timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover && playState === PLAYING) {
      setPlayState(PAUSED_HOVER);
    }
  }, [pauseOnHover, playState]);

  const handleMouseLeave = useCallback(() => {
    if (playState === PAUSED_HOVER) {
      setPlayState(PLAYING);
    }
  }, [playState]);

  const handleTouchStart = useCallback(() => {
    if (playState === PLAYING || playState === PAUSED_HOVER) {
      setPlayState(PAUSED_TOUCH);

      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }

      touchTimeoutRef.current = setTimeout(() => {
        setPlayState(PLAYING);
      }, touchPauseDuration);
    }
  }, [playState, touchPauseDuration]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => computeNextIndex(prev, totalPages));
    setPlayState(PAUSED_MANUAL);

    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    touchTimeoutRef.current = setTimeout(() => {
      setPlayState(PLAYING);
    }, touchPauseDuration);
  }, [totalPages, touchPauseDuration]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => computePrevIndex(prev, totalPages));
    setPlayState(PAUSED_MANUAL);

    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    touchTimeoutRef.current = setTimeout(() => {
      setPlayState(PLAYING);
    }, touchPauseDuration);
  }, [totalPages, touchPauseDuration]);

  const goToPage = useCallback(
    (pageIndex) => {
      setCurrentIndex(pageIndex);
      setPlayState(PAUSED_MANUAL);

      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }

      touchTimeoutRef.current = setTimeout(() => {
        setPlayState(PLAYING);
      }, touchPauseDuration);
    },
    [touchPauseDuration]
  );

  // Edge case: 0 items — render nothing
  if (totalItems === 0) {
    return null;
  }

  const hideNav = totalItems <= 1 || totalItems <= currentItemsPerView;

  // Calculate the gap in pixels (matches Tailwind gap-4 = 16px)
  const gapPx = 16;
  // Each item width as a percentage of the container
  const itemWidthPercent = 100 / currentItemsPerView;
  // translateX offset: shift by currentIndex pages worth of items
  const translateX = -(currentIndex * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      data-testid="carousel-container"
      data-play-state={playState}
    >
      {/* Carousel content — sliding strip */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(${translateX}%)`,
          }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className="min-w-0 flex-shrink-0"
              style={{
                width: `calc(${itemWidthPercent}% - ${gapPx * (currentItemsPerView - 1) / currentItemsPerView}px)`,
                marginRight: idx < totalItems - 1 ? `${gapPx}px` : 0,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Arrow navigation — top-right */}
      {showArrows && !hideNav && arrowPosition === "top-right" && (
        <div className="absolute top-0 right-0 flex items-center gap-2 -mt-12">
          <button
            onClick={goToPrev}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 active:scale-90 transition-all"
            style={{ minHeight: "unset", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            aria-label="Previous slide"
            data-testid="carousel-prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 active:scale-90 transition-all"
            style={{ minHeight: "unset", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            aria-label="Next slide"
            data-testid="carousel-next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Arrow navigation — center-sides (default) */}
      {showArrows && !hideNav && arrowPosition === "center-sides" && (
        <>
          <button
            onClick={goToPrev}
            className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-4 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 active:scale-90 transition-all z-10"
            style={{ minHeight: "unset", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            aria-label="Previous slide"
            data-testid="carousel-prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-4 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 active:scale-90 transition-all z-10"
            style={{ minHeight: "unset", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            aria-label="Next slide"
            data-testid="carousel-next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && !hideNav && (
        <div className="flex items-center justify-center gap-1.5 mt-4" data-testid="carousel-dots">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToPage(idx)}
              className={`rounded-full transition-all duration-200 ${
                idx === currentIndex
                  ? "w-6 h-2 bg-blue-500"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
              style={{ minHeight: "unset" }}
              aria-label={`Go to slide ${idx + 1}`}
              data-testid={`carousel-dot-${idx}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
