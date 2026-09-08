import React, { useState, useEffect } from "react";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { listSources, searchKnowledge } from "../services/api";
import BlockchainBadge from "./BlockchainBadge";

export default function KnowledgeBrowser({ onClose }) {
  const [sources, setSources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSources()
      .then((d) => setSources(d.sources || []))
      .catch(() => setSources([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await searchKnowledge(searchQuery);
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-saffron-400" />
          <h3 className="font-semibold text-gray-200 text-sm">Knowledge Browser</h3>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Vedic texts..."
            className="flex-1 bg-gray-800 border border-gray-700/60 rounded-lg px-3 py-2 text-sm
                       text-gray-100 placeholder-gray-500 focus:outline-none focus:border-saffron-600/60"
          />
          <button
            type="submit"
            disabled={searching}
            className="p-2 bg-saffron-600 hover:bg-saffron-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </button>
        </form>

        {/* Search results */}
        {searchResults && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">{searchResults.length} results for "{searchQuery}"</p>
            {searchResults.map((r, i) => (
              <div key={i} className="bg-gray-800/60 rounded-lg p-3 mb-2 border border-gray-700/30">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-saffron-400">
                    {r.source} {r.chapter && `— ${r.chapter}`} {r.verse && r.verse}
                  </span>
                  <span className="text-xs text-gray-500">{(r.relevance * 100).toFixed(0)}% match</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{r.text}</p>
                {r.sanskrit && (
                  <p className="devanagari text-xs text-saffron-300 mt-1">{r.sanskrit}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sources list */}
        {!searchResults && (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {loading ? "Loading..." : `${sources.length} sources in knowledge base`}
            </p>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-saffron-400" />
              </div>
            ) : (
              sources.map((src, i) => (
                <div key={i} className="bg-gray-800/60 rounded-lg p-3 mb-2 border border-gray-700/30">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-200">{src.title}</span>
                    <BlockchainBadge verified={src.verified} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 bg-gray-700/60 rounded px-1.5 py-0.5">
                      {src.category}
                    </span>
                    <span className="text-xs text-gray-600">{src.count} chunks</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
