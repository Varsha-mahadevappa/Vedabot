from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class SupportedLanguage(str, Enum):
    ENGLISH = "en"
    HINDI = "hi"
    SANSKRIT = "sa"
    TAMIL = "ta"
    TELUGU = "te"
    BENGALI = "bn"


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    language: SupportedLanguage = SupportedLanguage.ENGLISH
    session_id: Optional[str] = None
    history: Optional[List[ChatMessage]] = []


class SanskritQuote(BaseModel):
    devanagari: str
    transliteration: str
    translation: str
    source: str


class SourceCitation(BaseModel):
    text_name: str
    chapter: Optional[str] = None
    verse: Optional[str] = None
    excerpt: str
    verified_on_chain: bool = False
    source_hash: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    response: str
    original_language: str
    sources: List[SourceCitation] = []
    sanskrit_quote: Optional[SanskritQuote] = None
    related_topics: List[str] = []
    confidence: str = "medium"
    response_hash: Optional[str] = None
    logged_on_chain: bool = False


class KnowledgeSource(BaseModel):
    id: str
    title: str
    category: str
    description: str
    chunk_count: int
    verified: bool = False


class BlockchainVerifyRequest(BaseModel):
    source_hash: str


class BlockchainVerifyResponse(BaseModel):
    hash: str
    verified: bool
    title: Optional[str] = None
    timestamp: Optional[int] = None


class ContributeRequest(BaseModel):
    title: str
    content: str
    category: str
    contributor_address: str


class ResponseLogEntry(BaseModel):
    response_id: int
    question_hash: str
    answer_hash: str
    timestamp: int
    source_hashes: List[str] = []
