import React, { useState } from 'react';
import { useAccessibility, FONT_SIZES } from '../../context/AccessibilityContext';
import { Type, X } from 'lucide-react';

export const AccessibilityBar = () => {
  const { fontSize, setFontSize } = useAccessibility();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2" role="region" aria-label="Text Size Accessibility Controls">
      {/* Expanded panel */}
      {expanded && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider pr-1 select-none">Text Size</span>
          {FONT_SIZES.map((size, i) => (
            <button
              key={size.id}
              onClick={() => { setFontSize(size.id); setExpanded(false); }}
              title={size.title}
              aria-label={size.title}
              aria-pressed={fontSize === size.id}
              className={`
                rounded-xl flex items-center justify-center font-bold transition-all duration-150
                ${i === 0 ? 'w-9 h-9 text-sm' : i === 1 ? 'w-10 h-10 text-base' : 'w-11 h-11 text-lg'}
                ${fontSize === size.id
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}
              `}
            >
              {size.label}
            </button>
          ))}
          <button
            onClick={() => setExpanded(false)}
            aria-label="Close text size panel"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition ml-1"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        title="Change Text Size"
        aria-label="Accessibility: Change text size"
        aria-expanded={expanded}
        className={`
          w-12 h-12 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center
          ${expanded
            ? 'bg-sky-600 text-white shadow-sky-600/30'
            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/30'}
        `}
      >
        <Type className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
};
