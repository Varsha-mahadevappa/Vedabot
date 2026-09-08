import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SanskritQuote({ quote }) {
  const [expanded, setExpanded] = useState(true);
  if (!quote) return null;

  return (
    <div className="sanskrit-card mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-saffron-400 text-lg">🕉</span>
          <span className="text-xs text-saffron-300 font-medium uppercase tracking-wider">
            Sanskrit Shloka
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <>
          {/* Devanagari */}
          <p className="devanagari text-lg text-saffron-200 leading-relaxed mb-2">
            {quote.devanagari}
          </p>

          {/* Transliteration */}
          <p className="text-xs text-gray-400 italic mb-2">
            {quote.transliteration}
          </p>

          {/* Translation */}
          <p className="text-sm text-gray-300 border-t border-saffron-800/40 pt-2">
            {quote.translation}
          </p>

          {/* Source */}
          {quote.source && (
            <p className="text-xs text-saffron-500 mt-2">
              — {quote.source}
            </p>
          )}
        </>
      )}
    </div>
  );
}
