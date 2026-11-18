import React, { useState } from 'react';
import { useSiteAccess } from '../../context/SiteAccessContext';
import { Lock, ChevronUp, X, ShieldCheck } from 'lucide-react';

export default function StaffPreviewBadge() {
  const { isUnlocked, isGateEnabled, lockSite } = useSiteAccess();
  const [isOpen, setIsOpen] = useState(false);

  // If gate is not enabled (public launch), don't show the preview badge
  if (!isGateEnabled || !isUnlocked) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 font-sans">
      {isOpen ? (
        <div className="bento-card bg-white/95 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-gray-800 text-xs w-72 animate-fade-in">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 gg-anim-pulse" />
              <span className="font-bold text-gray-900">Staff Preview Active</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mb-3.5 leading-relaxed">
            Public visitors see the Telitrip coming soon page. You are viewing the live platform with active APIs.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={lockSite}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-center font-semibold transition-colors"
            >
              Lock Site
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-blue-600 shadow-lg shadow-black/5 backdrop-blur-md transition-all text-xs font-semibold"
          title="TeleTrip Private Preview Mode"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 gg-anim-pulse" />
          <span className="text-[11px] tracking-wide">Staff Preview</span>
          <ChevronUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
        </button>
      )}
    </div>
  );
}
