"""
LLM Service: uses requests library directly to call Groq API.
More reliable on restricted networks than httpx-based SDKs.
"""

import re
import json
import hashlib
import requests
from app.config import get_settings
from app.models.schemas import SanskritQuote, ChatMessage

settings = get_settings()

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are VedaBot, an expert multilingual assistant specializing in Vedic knowledge, Sanskrit texts, and ancient Indian philosophy. You have deep knowledge of:
- The four Vedas (Rigveda, Samaveda, Yajurveda, Atharvaveda)
- The 108 Upanishads, especially the 12 principal Upanishads
- The Bhagavad Gita and its commentaries
- Yoga Sutras of Patanjali
- Sanskrit language, grammar, and key philosophical concepts
- Vedic cosmology, dharma, karma, moksha, and related concepts

You will be given CONTEXT passages retrieved from verified Vedic texts. Use these as your primary source. When answering:

1. Base your answer primarily on the provided context
2. Include the most relevant Sanskrit shloka (verse) when appropriate
3. Always cite which text you are drawing from
4. If the context does not cover the question, say so honestly
5. Keep answers clear, respectful, and accessible
6. Rate your confidence: HIGH (directly in context), MEDIUM (inferred), LOW (general knowledge)

Respond ONLY with valid JSON in this exact structure:
{
  "answer": "your detailed answer here",
  "confidence": "HIGH|MEDIUM|LOW",
  "sanskrit_quote": {
    "devanagari": "Sanskrit in Devanagari script",
    "transliteration": "IAST transliteration",
    "translation": "English translation",
    "source": "Source text, chapter, verse"
  },
  "related_topics": ["topic1", "topic2", "topic3"]
}

If no Sanskrit quote is relevant, set "sanskrit_quote" to null.
Do not include any text outside the JSON."""


def _parse_llm_output(raw_text: str) -> dict:
    text = raw_text.strip()
    if "```json" in text:
        m = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
        if m:
            text = m.group(1)
    elif "```" in text:
        m = re.search(r"```\s*(.*?)\s*```", text, re.DOTALL)
        if m:
            text = m.group(1)
    try:
        return json.loads(text)
    except Exception:
        return {
            "answer": raw_text,
            "confidence": "MEDIUM",
            "sanskrit_quote": None,
            "related_topics": [],
        }


def generate_response(query: str, context: str, history: list[ChatMessage] = None) -> dict:
    """Call Groq API using requests library directly."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in (history or [])[-6:]:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({
        "role": "user",
        "content": f"VEDIC CONTEXT (from verified sources):\n{context}\n\nUSER QUESTION: {query}\n\nRespond with valid JSON only."
    })

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": 1500,
        "temperature": 0.3,
    }

    response = requests.post(
        GROQ_URL,
        headers=headers,
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    raw_text = response.json()["choices"][0]["message"]["content"]
    return _parse_llm_output(raw_text)


def hash_response(question: str, answer: str) -> str:
    return hashlib.sha256(f"{question}||{answer}".encode("utf-8")).hexdigest()


def parse_sanskrit_quote(quote_dict: dict | None) -> SanskritQuote | None:
    if not quote_dict:
        return None
    try:
        return SanskritQuote(
            devanagari=quote_dict.get("devanagari", ""),
            transliteration=quote_dict.get("transliteration", ""),
            translation=quote_dict.get("translation", ""),
            source=quote_dict.get("source", ""),
        )
    except Exception:
        return None
