import React, { useEffect, useRef } from 'react';
import { ChevronLeft, X } from 'lucide-react';

/**
 * FullScreenModal
 * Mobile (< md): fixed inset-0, slides up from bottom, full-screen sheet
 * Desktop (md+): hidden — let existing modal handle it
 *
 * Props:
 *   isOpen    {boolean}
 *   onClose   {() => void}
 *   title     {string}
 *   children  {React.ReactNode}
 *   footer    {React.ReactNode}  — sticky CTA area
 */
const FullScreenModal = ({ isOpen, onClose, title, children, footer }) => {
  const contentRef = useRef(null);
  const touchStartY = useRef(null);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Swipe-down to dismiss (only when scrollTop === 0)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
      if (touchStartY.current === null) return;
      const delta = e.changedTouches[0].clientY - touchStartY.current;
      if (delta > 80 && el.scrollTop === 0) {
        onClose();
      }
      touchStartY.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onClose]);

  return (
    // Only renders on mobile — md+ uses existing modal
    <div
      className={`md:hidden fixed inset-0 z-[150] bg-white flex flex-col
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
    >
      {/* Sticky header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="flex-1 text-[15px] font-semibold text-gray-900 truncate">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Scrollable content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Sticky footer */}
      {footer && (
        <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
};

export default FullScreenModal;
