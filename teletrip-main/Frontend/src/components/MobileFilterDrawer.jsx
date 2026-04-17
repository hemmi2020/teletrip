import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * MobileFilterDrawer — bottom-sheet filter panel for mobile.
 * Props:
 *   isOpen   {boolean}   — whether the drawer is visible
 *   onClose  {function}  — called when backdrop or X is tapped (no apply)
 *   onApply  {function}  — called when "Apply Filters" is tapped
 *   onReset  {function}  — called when "Reset" is tapped
 *   title    {string}    — header title text
 *   children {ReactNode} — filter section content
 */
const MobileFilterDrawer = ({ isOpen, onClose, onApply, onReset, title = 'Filters', children }) => {
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

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[130]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[131] bg-white rounded-t-2xl max-h-[85vh]
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Sticky header */}
        <div style={{ flexShrink: 0 }} className="px-4 pt-3 pb-2 border-b border-gray-100">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900">{title}</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: '1 1 auto', overflowY: 'auto', width: '100%' }}>
          <div style={{ padding: '8px 16px', width: '100%', boxSizing: 'border-box' }}>
            {children}
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ flexShrink: 0 }} className="border-t border-gray-100 px-4 py-3 flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterDrawer;
