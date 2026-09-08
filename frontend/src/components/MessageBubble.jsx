import React from "react";
import ReactMarkdown from "react-markdown";
import SanskritQuote from "./SanskritQuote";
import SourceCitation from "./SourceCitation";
import BlockchainBadge from "./BlockchainBadge";

const CONFIDENCE_COLORS = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-red-400",
};

export default function MessageBubble({ message, onTopicClick }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="chat-bubble-user">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="flex gap-3 max-w-[90%]">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron-600 to-saffron-800 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-sm">🕉</span>
        </div>

        <div className="flex-1">
          <div className="chat-bubble-bot">
            {/* Main response */}
            <div className="prose prose-invert prose-sm max-w-none text-gray-100">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Sanskrit Quote */}
            {message.sanskrit_quote && (
              <SanskritQuote quote={message.sanskrit_quote} />
            )}

            {/* Related topics */}
            {message.related_topics && message.related_topics.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <p className="text-xs text-gray-500 mb-2">Related topics:</p>
                <div className="flex flex-wrap gap-1.5">
                  {message.related_topics.map((topic, i) => (
                    <span
                      key={i}
                      onClick={() => onTopicClick && onTopicClick(topic)}
                      className="text-xs bg-gray-900/60 text-saffron-400 border border-saffron-800/30 rounded-full px-2.5 py-0.5 cursor-pointer hover:bg-saffron-900/30 transition-colors"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer: confidence + blockchain + sources */}
          <div className="flex items-center gap-3 mt-1.5 px-1 flex-wrap">
            {message.confidence && (
              <span className={`text-xs ${CONFIDENCE_COLORS[message.confidence] || "text-gray-500"}`}>
                {message.confidence.charAt(0).toUpperCase() + message.confidence.slice(1)} confidence
              </span>
            )}
            {message.logged_on_chain !== undefined && (
              <BlockchainBadge loggedOnChain={message.logged_on_chain} />
            )}
          </div>

          {/* Source citations */}
          <div className="px-1">
            <SourceCitation sources={message.sources} />
          </div>
        </div>
      </div>
    </div>
  );
}
