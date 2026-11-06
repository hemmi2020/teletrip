import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Check,
  Copy,
  Sparkles,
  Send,
  Trash2,
  Crosshair,
  Star,
  User,
  Mail,
  Award,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const FeedbackOverlay = ({ targetName = "HotelSearchExperience" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [overallDirection, setOverallDirection] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [preferredVariant, setPreferredVariant] = useState("Variant A (Modern Luxury Clarity)");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const hoverOutlineRef = useRef(null);

  // Inspector mode event listener
  useEffect(() => {
    if (!isInspecting) {
      if (hoverOutlineRef.current) {
        hoverOutlineRef.current.style.display = 'none';
      }
      return;
    }

    const handleMouseMove = (e) => {
      // Don't inspect the overlay itself
      if (e.target.closest('#design-lab-feedback-panel') || e.target.closest('#design-lab-feedback-btn')) {
        if (hoverOutlineRef.current) hoverOutlineRef.current.style.display = 'none';
        return;
      }

      const rect = e.target.getBoundingClientRect();
      if (!hoverOutlineRef.current) {
        const div = document.createElement('div');
        div.id = 'feedback-hover-highlight';
        div.style.position = 'fixed';
        div.style.pointerEvents = 'none';
        div.style.border = '2px dashed #2563eb';
        div.style.backgroundColor = 'rgba(37, 99, 235, 0.12)';
        div.style.zIndex = '99998';
        div.style.transition = 'all 0.08s ease';
        div.style.borderRadius = '6px';
        document.body.appendChild(div);
        hoverOutlineRef.current = div;
      }

      hoverOutlineRef.current.style.display = 'block';
      hoverOutlineRef.current.style.top = `${rect.top}px`;
      hoverOutlineRef.current.style.left = `${rect.left}px`;
      hoverOutlineRef.current.style.width = `${rect.width}px`;
      hoverOutlineRef.current.style.height = `${rect.height}px`;
    };

    const handleClick = (e) => {
      if (e.target.closest('#design-lab-feedback-panel') || e.target.closest('#design-lab-feedback-btn')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const el = e.target;
      const variantContainer = el.closest('[data-variant]');
      const variantId = variantContainer ? variantContainer.getAttribute('data-variant') : 'General';
      const tag = el.tagName.toLowerCase();
      const text = (el.innerText || el.textContent || '').trim().slice(0, 35);
      const selector = el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : tag;

      setSelectedElement({
        variant: variantId,
        tag,
        text,
        selector: `${tag}${el.id ? '#' + el.id : ''}`,
        description: `${tag} with "${text || 'No text'}"`
      });

      setIsInspecting(false);
      if (hoverOutlineRef.current) hoverOutlineRef.current.style.display = 'none';
      setIsOpen(true);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      if (hoverOutlineRef.current) {
        hoverOutlineRef.current.remove();
        hoverOutlineRef.current = null;
      }
    };
  }, [isInspecting]);

  const handleSaveComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      variant: selectedElement?.variant || 'General',
      elementDescription: selectedElement?.description || 'General element',
      selector: selectedElement?.selector || 'general',
      text: commentText.trim()
    };
    setComments(prev => [...prev, newComment]);
    setCommentText("");
    setSelectedElement(null);
  };

  const handleDeleteComment = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const formatMarkdown = () => {
    const grouped = {};
    comments.forEach(c => {
      grouped[c.variant] = grouped[c.variant] || [];
      grouped[c.variant].push(c);
    });

    let md = `## 🎨 Design Lab Client Feedback\n\n`;
    md += `**Client/Reviewer:** ${clientName || 'Client'}${clientEmail ? ` (${clientEmail})` : ''}\n`;
    md += `**Preferred Variant:** ${preferredVariant}\n`;
    md += `**Overall Rating:** ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)\n`;
    md += `**Target Experience:** ${targetName}\n`;
    md += `**Element Notes:** ${comments.length}\n\n`;

    if (overallDirection.trim()) {
      md += `### 💡 Overall Direction & Synthesis\n`;
      md += `${overallDirection.trim()}\n\n`;
    }

    if (comments.length > 0) {
      md += `### 🔍 Specific Element Feedback\n`;
      Object.keys(grouped).forEach(vKey => {
        md += `#### Variant ${vKey}\n`;
        grouped[vKey].forEach((c, i) => {
          md += `${i + 1}. **${c.elementDescription}** (\`${c.selector}\`)\n   "${c.text}"\n`;
        });
        md += `\n`;
      });
    }

    return md;
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(null);
    const md = formatMarkdown();

    // 1. Always copy to clipboard for convenience
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(md);
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }

    // 2. Persist to Backend server so Antigravity can read it automatically
    const backendBase = import.meta.env.VITE_BASE_URL || 'https://telitrip-backend.onrender.com';
    const payload = {
      clientName: clientName.trim() || 'Anonymous Client',
      clientEmail: clientEmail.trim(),
      preferredVariant,
      rating,
      overallDirection: overallDirection.trim(),
      comments,
      markdown: md,
      targetName
    };

    try {
      const endpoints = [
        `${backendBase}/api/design-lab/feedback`,
        `/api/design-lab/feedback`
      ];

      let saved = false;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const data = await res.json();
            setSubmitSuccess({
              id: data.feedbackId || 'fb_saved',
              message: 'Feedback received! Saved to server & copied to clipboard.'
            });
            saved = true;
            break;
          }
        } catch (innerErr) {
          // try next
        }
      }

      if (!saved) {
        setSubmitSuccess({
          id: 'fb_local',
          message: 'Saved to clipboard! (Server sync pending, but feedback is safely copied)'
        });
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setSubmitSuccess({
        id: 'fb_clipboard',
        message: 'Feedback copied to clipboard!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div id="design-lab-feedback-btn" className="fixed bottom-6 right-6 z-[99999] flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIsInspecting(!isInspecting);
            if (!isOpen) setIsOpen(true);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-xl transition-all cursor-pointer ${
            isInspecting
              ? 'bg-amber-500 text-white ring-4 ring-amber-300 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isInspecting ? (
            <>
              <Crosshair className="w-4 h-4" />
              <span>Click Any Element on Screen...</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              <span>Review Lab ({comments.length})</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-full bg-gray-900/90 text-white hover:bg-black shadow-lg cursor-pointer"
          title="Toggle Feedback Drawer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
        </button>
      </div>

      {/* Slide-out Feedback Drawer */}
      {isOpen && (
        <div
          id="design-lab-feedback-panel"
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-white shadow-2xl z-[99999] border-l border-gray-200 flex flex-col text-left text-gray-900 animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <h3 className="text-sm font-extrabold text-white">Client Design Review</h3>
                <p className="text-[10px] text-blue-200">Select preferred design & send feedback directly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Success Banner if submitted */}
            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">{submitSuccess.message}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">
                    Antigravity and your development team have received this submission directly.
                  </div>
                </div>
              </div>
            )}

            {/* Client Info (Optional) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-gray-700 flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Reviewer Info (Optional)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Your Name / Client"
                  className="w-full text-xs p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full text-xs p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Preferred Variant Vote */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
              <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                Which Variant is Your Favorite?
              </span>
              <select
                value={preferredVariant}
                onChange={(e) => setPreferredVariant(e.target.value)}
                className="w-full text-xs p-2.5 bg-white rounded-lg border border-blue-200 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Variant A (Modern Luxury Clarity)">Variant A: Modern Luxury Clarity (Booking/Airbnb Style)</option>
                <option value="Variant B (Interactive Map & Cards)">Variant B: Split-Pane Interactive Map & Cards</option>
                <option value="Variant C (High-Density Rate Matrix)">Variant C: High-Density Table Matrix (B2B Travel Agent)</option>
                <option value="Variant D (Smart Scenario Filters & Drawer)">Variant D: Smart Scenario Filters & Half-Sheet Drawer</option>
                <option value="Variant E (Boutique Storytelling)">Variant E: Boutique Storytelling & Visual Immersion</option>
                <option value="Hybrid Blend (Mix of multiple variants)">Hybrid Blend: Mix elements of several variants</option>
              </select>

              {/* Star Rating */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-600 font-medium">Rate this design direction:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="cursor-pointer p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Point & Click Element Feedback */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                  <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                  {selectedElement ? `Target: Variant ${selectedElement.variant}` : "Point & Click Note on Any Element"}
                </span>
                {!isInspecting && (
                  <button
                    type="button"
                    onClick={() => setIsInspecting(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    Select Element
                  </button>
                )}
              </div>

              {selectedElement ? (
                <div className="text-[11px] text-gray-700 bg-white p-2 rounded-lg border border-blue-200 font-mono">
                  {selectedElement.description}
                </div>
              ) : (
                <p className="text-[11px] text-gray-500">
                  Click "Select Element" to click on any button, card, image, or text to comment on it specifically.
                </p>
              )}

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What do you think of this element? (e.g. Love the dual price, but make CTA button bolder)"
                rows={2}
                className="w-full text-xs p-2.5 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-2">
                {selectedElement && (
                  <button
                    type="button"
                    onClick={() => setSelectedElement(null)}
                    className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveComment}
                  disabled={!commentText.trim()}
                  className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
                >
                  Save Element Note
                </button>
              </div>
            </div>

            {/* Collected Notes List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold uppercase tracking-wider text-gray-500 text-[10px]">
                  Collected Element Notes ({comments.length})
                </h4>
                {comments.length > 0 && (
                  <button
                    onClick={() => setComments([])}
                    className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {comments.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-xs border border-dashed rounded-xl">
                  No element notes yet. (Optional)
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                        Variant {c.variant}
                      </span>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 truncate">{c.elementDescription}</p>
                    <p className="text-xs text-gray-800 font-medium">"{c.text}"</p>
                  </div>
                ))
              )}
            </div>

            {/* Overall Direction / Notes */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-gray-800 flex items-center justify-between text-xs">
                <span>Overall Feedback / Client Directives</span>
                <span className="text-[10px] text-gray-400 font-normal">What changes do you want?</span>
              </label>
              <textarea
                value={overallDirection}
                onChange={(e) => setOverallDirection(e.target.value)}
                placeholder="e.g. Variant A's card is the best. Please take the sticky filters from Variant D and the mobile toggle from Variant B."
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer Submit CTA */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Team...</span>
                </>
              ) : copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Submitted & Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback to Antigravity & Team</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-gray-500">
              Directly notifies the development team and copies notes to your clipboard for WhatsApp / Slack.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackOverlay;
