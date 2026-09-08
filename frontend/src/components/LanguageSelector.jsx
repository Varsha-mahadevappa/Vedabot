import React from "react";
import useChatStore from "../store/chatStore";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "sa", label: "संस्कृत", flag: "🕉️" },
  { code: "ta", label: "தமிழ்", flag: "🌺" },
  { code: "te", label: "తెలుగు", flag: "🌸" },
  { code: "bn", label: "বাংলা", flag: "🎋" },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useChatStore();

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all
            ${language === lang.code
              ? "bg-saffron-500 text-white shadow-lg shadow-saffron-500/20"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
