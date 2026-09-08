import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import BlockchainBadge from "./BlockchainBadge";

const PREVIEW_LENGTH = 150;

function SourceEntry({ src }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = src.excerpt && src.excerpt.length > PREVIEW_LENGTH;
  const displayText = expanded || !isLong
    ? src.excerpt
    : src.excerpt.slice(0, PREVIEW_LENGTH) + "...";

  return (
    <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800/60 text-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-medium text-saffron-300">
          {src.text_name}
          {src.chapter && ` — ${src.chapter}`}
          {src.verse && ` ${src.verse}`}
        </span>
        <BlockchainBadge verified={src.verified_on_chain} />
      </div>

      {/* Full passage text */}
      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{displayText}</p>

      {/* Show more / Show less toggle */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-saffron-500 hover:text-saffron-300 transition-colors"
        >
          {expanded ? (
            <><ChevronUp size={11} /> Show less</>
          ) : (
            <><ChevronDown size={11} /> Show full passage</>
          )}
        </button>
      )}
    </div>
  );
}

export default function SourceCitation({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-saffron-400 transition-colors"
      >
        <BookOpen size={11} />
        <span>{sources.length} source{sources.length > 1 ? "s" : ""} used</span>
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {sources.map((src, i) => (
            <SourceEntry key={i} src={src} />
          ))}
        </div>
      )}
    </div>
  );
}
