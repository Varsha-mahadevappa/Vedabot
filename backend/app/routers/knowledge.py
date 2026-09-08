from fastapi import APIRouter
from app.services import rag_service

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

CATEGORIES = {
    "Veda": "The four Vedas — Rigveda, Samaveda, Yajurveda, Atharvaveda",
    "Vedanta": "Upanishads and Vedantic philosophy",
    "Vedic Scripture": "Bhagavad Gita and related scriptures",
    "Yoga Philosophy": "Yoga Sutras and yogic traditions",
    "Sanskrit Knowledge": "Sanskrit concepts, grammar, and glossary",
}


@router.get("/sources")
async def list_sources():
    """Return all Vedic sources indexed in the knowledge base."""
    sources = rag_service.get_all_sources()
    return {"sources": sources, "total": len(sources)}


@router.get("/categories")
async def list_categories():
    """Return available knowledge categories."""
    return {
        "categories": [
            {"id": k, "name": k, "description": v}
            for k, v in CATEGORIES.items()
        ]
    }


@router.get("/search")
async def search_knowledge(q: str, top_k: int = 5):
    """Search the Vedic knowledge base semantically."""
    chunks = rag_service.retrieve(q, top_k=top_k)
    return {
        "query": q,
        "results": [
            {
                "text": c["text"],
                "source": c["source"],
                "chapter": c["chapter"],
                "verse": c["verse"],
                "sanskrit": c["sanskrit"],
                "transliteration": c["transliteration"],
                "relevance": c["relevance"],
                "source_hash": c["source_hash"],
            }
            for c in chunks
        ],
    }
