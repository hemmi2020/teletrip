import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';

/**
 * MobileFilters — A fully self-contained mobile filter bottom sheet.
 * Uses 100% inline styles for layout to avoid any CSS inheritance/override issues.
 *
 * Props:
 *   isOpen        {boolean}
 *   onClose       {function}
 *   onReset       {function}
 *   activeCount   {number}   — number of active filters (for badge)
 *   sections      {Array}    — filter section definitions (see below)
 *
 * Section shape:
 *   { key, label, type: 'checkbox'|'radio'|'range'|'search', options?, value, onChange }
 */

// ─── Inline style constants ───────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9998, display: 'flex', alignItems: 'flex-end',
  },
  sheet: {
    position: 'relative', backgroundColor: '#fff', width: '100%',
    borderRadius: '20px 20px 0 0', maxHeight: '88vh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 -4px 32px rgba(0,0,0,0.18)',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#d1d5db',
    borderRadius: 99, margin: '12px auto 0',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px 12px', borderBottom: '1px solid #f3f4f6', flexShrink: 0,
  },
  headerTitle: {
    fontSize: 17, fontWeight: 700, color: '#111827', margin: 0,
  },
  headerRight: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  resetBtn: {
    fontSize: 14, color: '#2563eb', fontWeight: 600,
    background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f3f4f6',
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  body: {
    flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
  },
  section: {
    borderBottom: '1px solid #f3f4f6',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', cursor: 'pointer', background: 'none',
    border: 'none', width: '100%', textAlign: 'left',
  },
  sectionLabel: {
    fontSize: 15, fontWeight: 600, color: '#1f2937', margin: 0,
  },
  sectionBody: {
    padding: '4px 20px 16px',
  },
  // Checkbox / radio row
  optionRow: {
    display: 'flex', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: '9px 0',
    borderBottom: '1px solid #f9fafb', cursor: 'pointer',
    background: 'none', border: 'none', width: '100%', textAlign: 'left',
  },
  optionLeft: {
    display: 'flex', flexDirection: 'row', alignItems: 'center',
    gap: 12, flex: 1, minWidth: 0,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, border: '2px solid #d1d5db',
    backgroundColor: '#fff', flexShrink: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
  },
  checkboxActive: {
    backgroundColor: '#2563eb', borderColor: '#2563eb',
  },
  radioCircle: {
    width: 20, height: 20, borderRadius: '50%', border: '2px solid #d1d5db',
    backgroundColor: '#fff', flexShrink: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#2563eb',
  },
  radioDot: {
    width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2563eb',
  },
  optionLabel: {
    fontSize: 15, color: '#374151', lineHeight: 1.4,
    textAlign: 'left', flex: 1, minWidth: 0,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  optionCount: {
    fontSize: 12, color: '#9ca3af', flexShrink: 0, marginLeft: 8,
    backgroundColor: '#f3f4f6', borderRadius: 99, padding: '2px 7px',
  },
  searchInput: {
    width: '100%', padding: '10px 14px', fontSize: 15,
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    outline: 'none', boxSizing: 'border-box', color: '#111827',
    backgroundColor: '#f9fafb',
  },
  rangeRow: {
    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 8,
  },
  rangeInput: {
    flex: 1, padding: '10px 12px', fontSize: 15,
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    outline: 'none', boxSizing: 'border-box', color: '#111827',
    backgroundColor: '#f9fafb', minWidth: 0,
  },
  rangeSep: {
    fontSize: 14, color: '#9ca3af', flexShrink: 0,
  },
  footer: {
    padding: '12px 20px 20px', borderTop: '1px solid #f3f4f6',
    flexShrink: 0, backgroundColor: '#fff',
  },
  applyBtn: {
    width: '100%', padding: '14px', fontSize: 16, fontWeight: 700,
    backgroundColor: '#2563eb', color: '#fff', border: 'none',
    borderRadius: 12, cursor: 'pointer', letterSpacing: 0.2,
  },
};

// ─── Checkmark SVG ────────────────────────────────────────────────────────────
const Checkmark = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Single section ───────────────────────────────────────────────────────────
const FilterSection = ({ section }) => {
  const [open, setOpen] = useState(true);

  return (
    <div style={S.section}>
      <button
        style={S.sectionHeader}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span style={S.sectionLabel}>{section.label}</span>
        {open
          ? <ChevronUp size={18} color="#6b7280" />
          : <ChevronDown size={18} color="#6b7280" />
        }
      </button>

      {open && (
        <div style={S.sectionBody}>
          {/* Search input */}
          {section.type === 'search' && (
            <input
              type="text"
              value={section.value || ''}
              onChange={e => section.onChange(e.target.value)}
              placeholder={section.placeholder || `Search ${section.label.toLowerCase()}...`}
              style={S.searchInput}
            />
          )}

          {/* Price range */}
          {section.type === 'range' && (
            <div style={S.rangeRow}>
              <input
                type="number"
                value={section.valueMin || ''}
                onChange={e => section.onChangeMin(e.target.value)}
                placeholder={section.placeholderMin || 'Min'}
                style={S.rangeInput}
              />
              <span style={S.rangeSep}>–</span>
              <input
                type="number"
                value={section.valueMax || ''}
                onChange={e => section.onChangeMax(e.target.value)}
                placeholder={section.placeholderMax || 'Max'}
                style={S.rangeInput}
              />
            </div>
          )}

          {/* Checkbox list */}
          {section.type === 'checkbox' && section.options?.map(opt => {
            const checked = (section.value || []).includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                style={S.optionRow}
                onClick={() => {
                  const cur = section.value || [];
                  section.onChange(
                    checked ? cur.filter(v => v !== opt.value) : [...cur, opt.value]
                  );
                }}
              >
                <span style={S.optionLeft}>
                  <span style={{ ...S.checkbox, ...(checked ? S.checkboxActive : {}) }}>
                    {checked && <Checkmark />}
                  </span>
                  <span style={S.optionLabel}>{opt.label}</span>
                </span>
                {opt.count != null && (
                  <span style={S.optionCount}>{opt.count}</span>
                )}
              </button>
            );
          })}

          {/* Radio list */}
          {section.type === 'radio' && section.options?.map(opt => {
            const selected = section.value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                style={S.optionRow}
                onClick={() => section.onChange(selected ? '' : opt.value)}
              >
                <span style={S.optionLeft}>
                  <span style={{ ...S.radioCircle, ...(selected ? S.radioCircleActive : {}) }}>
                    {selected && <span style={S.radioDot} />}
                  </span>
                  <span style={S.optionLabel}>{opt.label}</span>
                </span>
                {opt.count != null && (
                  <span style={S.optionCount}>{opt.count}</span>
                )}
              </button>
            );
          })}

          {/* Select (dropdown) */}
          {section.type === 'select' && (
            <select
              value={section.value || ''}
              onChange={e => section.onChange(e.target.value)}
              style={{ ...S.searchInput, appearance: 'auto' }}
            >
              <option value="">All</option>
              {section.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const MobileFilters = ({ isOpen, onClose, onReset, activeCount = 0, sections = [] }) => {
  if (!isOpen) return null;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.sheet} onClick={e => e.stopPropagation()}>
        {/* Drag handle */}
        <div style={S.handle} />

        {/* Header */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={18} color="#2563eb" />
            <h2 style={S.headerTitle}>Filters</h2>
            {activeCount > 0 && (
              <span style={{
                backgroundColor: '#2563eb', color: '#fff', fontSize: 12,
                fontWeight: 700, borderRadius: 99, padding: '2px 8px',
              }}>
                {activeCount}
              </span>
            )}
          </div>
          <div style={S.headerRight}>
            {activeCount > 0 && (
              <button style={S.resetBtn} onClick={onReset} type="button">
                Reset all
              </button>
            )}
            <button style={S.closeBtn} onClick={onClose} type="button" aria-label="Close">
              <X size={16} color="#6b7280" />
            </button>
          </div>
        </div>

        {/* Scrollable filter sections */}
        <div style={S.body}>
          {sections.map(section => (
            <FilterSection key={section.key} section={section} />
          ))}
        </div>

        {/* Footer */}
        <div style={S.footer}>
          <button style={S.applyBtn} onClick={onClose} type="button">
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters;
