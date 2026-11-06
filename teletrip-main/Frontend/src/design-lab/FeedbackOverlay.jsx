import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Check, Copy, Sparkles, Send, Trash2, Crosshair } from 'lucide-react';

export const FeedbackOverlay = ({ targetName = "HotelSearchExperience" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [overallDirection, setOverallDirection] = useState("");
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
        div.style.border = '2px dashed #3b82f6';
        div.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
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

    let md = `## Design Lab Feedback\n\n`;
    md += `**Target:** ${targetName}\n`;
    md += `**Comments:** ${comments.length}\n\n`;

    Object.keys(grouped).forEach(vKey => {
      md += `### Variant ${vKey}\n`;
      grouped[vKey].forEach((c, i) => {
        md += `${i + 1}. **${c.elementDescription}** (\`${c.selector}\`)\n   "${c.text}"\n`;
      });
      md += `\n`;
    });

    md += `### Overall Direction\n`;
    md += overallDirection.trim() || `I prefer Variant A's clean luxury card hierarchy, but with Variant D's sticky quick-filters and Variant B's split map view.`;
    return md;
  };

  const handleSubmitAll = () => {
    const md = formatMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
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
              <span>Feedback Lab ({comments.length})</span>
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
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-[99999] border-l border-gray-200 flex flex-col text-left text-gray-900 animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <h3 className="text-sm font-extrabold text-gray-900">Design Lab Feedback</h3>
              <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {comments.length} notes
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Element Commenting Box */}
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                  {selectedElement ? `Target: Variant ${selectedElement.variant}` : "Point & Click Feedback"}
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
                <div className="text-[11px] text-gray-600 bg-white p-2 rounded-lg border border-blue-100 font-mono">
                  {selectedElement.description}
                </div>
              ) : (
                <p className="text-[11px] text-blue-700">
                  Click "Select Element" or the floating button to click any button, card, badge, or text to attach a note.
                </p>
              )}

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What do you think of this element? (e.g. Love the dual price, but make CTA bigger)"
                rows={2}
                className="w-full text-xs p-2.5 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-2">
                {selectedElement && (
                  <button
                    type="button"
                    onClick={() => setSelectedElement(null)}
                    className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700"
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
                  Save Note
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Collected Element Notes</h4>
              {comments.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs border border-dashed rounded-xl">
                  No element comments yet. Click any part of the variants to leave notes!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                        Variant {c.variant}
                      </span>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-gray-400 truncate">{c.elementDescription}</p>
                    <p className="text-xs text-gray-800 font-medium">"{c.text}"</p>
                  </div>
                ))
              )}
            </div>

            {/* Overall Direction */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                <span>Overall Direction / Synthesis</span>
                <span className="text-[10px] text-gray-400 font-normal">Which one wins?</span>
              </label>
              <textarea
                value={overallDirection}
                onChange={(e) => setOverallDirection(e.target.value)}
                placeholder="e.g. Variant A's card layout is the cleanest. Let's merge it with Variant D's sticky filter pills and Variant B's map toggle."
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
            <button
              type="button"
              onClick={handleSubmitAll}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Copied to Clipboard! Paste in Chat</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Submit & Copy Feedback to Clipboard</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-gray-500">
              Copies structured feedback so Antigravity can immediately synthesize your winning design!
            </p>
          </div>
        </div>
      )}
    </>
  );
};
