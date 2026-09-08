"""
RAG Service: ChromaDB semantic retrieval over the Vedic knowledge base.
"""

import os
import chromadb
from sentence_transformers import SentenceTransformer
from app.models.schemas import SourceCitation

COLLECTION_NAME = "vedic_knowledge"

# Pre-load everything at import time (avoids async httpx conflicts in ST v5)
_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
_client = chromadb.PersistentClient(path=_path)
_collection = _client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"},
)
_model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)


def _get_collection():
    return _collection


def _get_model():
    return _model


def retrieve(query: str, top_k: int = 5) -> list[dict]:
    """Return top_k relevant chunks for the given query."""
    model = _model
    collection = _collection

    query_embedding = model.encode([query]).tolist()[0]
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count() or 1),
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    if results and results["documents"]:
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            chunks.append({
                "text": doc,
                "source": meta.get("source", "Unknown"),
                "category": meta.get("category", ""),
                "chapter": meta.get("chapter", ""),
                "verse": meta.get("verse", ""),
                "sanskrit": meta.get("sanskrit", ""),
                "transliteration": meta.get("transliteration", ""),
                "source_hash": meta.get("source_hash", ""),
                "relevance": round(1 - float(dist), 4),
            })
    return chunks


def build_context(chunks: list[dict]) -> str:
    """Format retrieved chunks into an LLM-ready context string."""
    if not chunks:
        return "No specific Vedic text passages found for this query."

    parts = []
    for i, chunk in enumerate(chunks, 1):
        ref = chunk["source"]
        if chunk["chapter"]:
            ref += f", {chunk['chapter']}"
        if chunk["verse"]:
            ref += f" {chunk['verse']}"
        parts.append(f"[{i}] ({ref})\n{chunk['text']}")

    return "\n\n".join(parts)


def to_citations(chunks: list[dict]) -> list[SourceCitation]:
    """Convert chunks to SourceCitation Pydantic models."""
    citations = []
    for chunk in chunks:
        citations.append(SourceCitation(
            text_name=chunk["source"],
            chapter=chunk.get("chapter") or None,
            verse=chunk.get("verse") or None,
            excerpt=chunk["text"],
            verified_on_chain=False,
            source_hash=chunk.get("source_hash"),
        ))
    return citations


def get_all_sources() -> list[dict]:
    """Return distinct sources in the knowledge base."""
    count = _collection.count()
    if count == 0:
        return []

    results = _collection.get(include=["metadatas"])
    seen = {}
    for meta in results["metadatas"]:
        src = meta.get("source", "Unknown")
        if src not in seen:
            seen[src] = {
                "title": src,
                "category": meta.get("category", ""),
                "count": 0,
            }
        seen[src]["count"] += 1

    return list(seen.values())
