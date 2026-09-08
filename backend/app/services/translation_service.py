"""
Translation Service: language detection + bidirectional translation.
Uses deep-translator (Google backend, free tier).
"""

from langdetect import detect, DetectorFactory
from deep_translator import GoogleTranslator

# Make langdetect deterministic
DetectorFactory.seed = 42

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "sa": "Sanskrit",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
}

# Sanskrit is not supported by Google Translate as source — treat as Hindi for detection
LANG_ALIASES = {
    "sa": "hi",  # Approximate: Sanskrit → Hindi script fallback
}


def detect_language(text: str) -> str:
    """Detect the language of the input text. Returns ISO 639-1 code."""
    try:
        detected = detect(text)
        # Normalize: if detected as 'hi' and text has Devanagari, could be Sanskrit
        return detected if detected in SUPPORTED_LANGUAGES else "en"
    except Exception:
        return "en"


def translate_to_english(text: str, source_lang: str) -> str:
    """Translate text from source_lang to English."""
    if source_lang == "en":
        return text
    try:
        src = LANG_ALIASES.get(source_lang, source_lang)
        translator = GoogleTranslator(source=src, target="en")
        return translator.translate(text) or text
    except Exception:
        return text


def translate_from_english(text: str, target_lang: str) -> str:
    """Translate English text to the target language."""
    if target_lang == "en":
        return text
    try:
        tgt = LANG_ALIASES.get(target_lang, target_lang)
        translator = GoogleTranslator(source="en", target=tgt)
        return translator.translate(text) or text
    except Exception:
        return text


def get_language_name(code: str) -> str:
    """Return human-readable name for a language code."""
    return SUPPORTED_LANGUAGES.get(code, "Unknown")
