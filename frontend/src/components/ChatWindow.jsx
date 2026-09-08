import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import useChatStore from "../store/chatStore";
import { sendMessage } from "../services/api";

const SUGGESTIONS = [
  "What is the meaning of Om?",
  "Explain karma according to the Bhagavad Gita",
  "What are the four goals of life in Vedic philosophy?",
  "Tell me about the Gayatri Mantra",
  "What is the concept of Brahman in the Upanishads?",
];

export default function ChatWindow() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    language,
    isLoading,
    error,
    sessionId,
    addMessage,
    setLoading,
    setError,
    setSessionId,
    clearMessages,
    getHistory,
  } = useChatStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text = input) => {
    const query = text.trim();
    if (!query || isLoading) return;

    setInput("");
    setError(null);

    // Add user message
    addMessage({ role: "user", content: query });
    setLoading(true);

    try {
      const data = await sendMessage({
        message: query,
        language,
        sessionId,
        history: getHistory(),
      });

      if (!sessionId) setSessionId(data.session_id);

      // Add bot message
      addMessage({
        role: "assistant",
        content: data.response,
        sanskrit_quote: data.sanskrit_quote,
        sources: data.sources,
        related_topics: data.related_topics,
        confidence: data.confidence,
        logged_on_chain: data.logged_on_chain,
        response_hash: data.response_hash,
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Something went wrong");
      addMessage({
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div className="text-6xl mb-4">🕉️</div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-2">
              Namaste! I am VedaBot
            </h2>
            <p className="text-gray-400 max-w-md text-sm mb-8">
              Ask me anything about Vedic philosophy, Sanskrit texts, the Bhagavad Gita,
              Upanishads, Yoga Sutras, and more — in your language.
            </p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-left px-4 py-2.5 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/40
                             rounded-xl text-sm text-gray-300 hover:text-saffron-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} onTopicClick={handleSend} />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron-600 to-saffron-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🕉</span>
                  </div>
                  <div className="chat-bubble-bot">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-sm">Consulting the Vedic texts...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-800/60 px-4 py-3 bg-gray-950/80 backdrop-blur-sm">
        {error && (
          <p className="text-red-400 text-xs mb-2 px-1">{error}</p>
        )}
        <div className="flex gap-2 items-end">
          {/* Clear button */}
          {!isEmpty && (
            <button
              onClick={clearMessages}
              className="p-2 text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
              title="Clear conversation"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Vedic knowledge..."
              rows={1}
              className="w-full bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 pr-12
                         text-sm text-gray-100 placeholder-gray-500 resize-none
                         focus:outline-none focus:border-saffron-600/60 transition-colors
                         scrollbar-thin"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-saffron-500 hover:bg-saffron-600 disabled:bg-gray-700 disabled:cursor-not-allowed
                       text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1.5 px-1">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
