import React, { useState } from 'react';
import { useSiteAccess } from '../../context/SiteAccessContext';

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
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl text-white text-xs w-64 animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">Staff Preview Active</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              &times;
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Public visitors see the Coming Soon teaser page. You are viewing the live platform with active APIs.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={lockSite}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-center font-medium transition-colors"
            >
              Lock Site
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white shadow-xl backdrop-blur-md transition-all text-xs"
          title="TeleTrip Private Preview Mode"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-[11px] tracking-wide">Staff Preview</span>
          <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
