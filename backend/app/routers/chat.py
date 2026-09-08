import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schemas import ChatRequest, ChatResponse
from app.services import rag_service, llm_service, translation_service, blockchain_service
from app.database import get_db, ChatLog

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    session_id = request.session_id or str(uuid.uuid4())
    user_lang = request.language.value

    # 1. Detect / confirm language
    detected_lang = translation_service.detect_language(request.message)
    effective_lang = user_lang if user_lang != "en" else detected_lang

    # 2. Translate user query to English for RAG
    query_en = translation_service.translate_to_english(request.message, effective_lang)

    # 3. Retrieve relevant Vedic passages
    chunks = rag_service.retrieve(query_en, top_k=5)
    context = rag_service.build_context(chunks)
    citations = rag_service.to_citations(chunks)

    # 4. Generate LLM response
    llm_result = llm_service.generate_response(
        query=query_en,
        context=context,
        history=request.history,
    )

    answer_en = llm_result.get("answer", "I could not find a relevant answer in the Vedic texts.")
    confidence = llm_result.get("confidence", "MEDIUM").lower()
    related_topics = llm_result.get("related_topics", [])
    sanskrit_quote = llm_service.parse_sanskrit_quote(llm_result.get("sanskrit_quote"))

    # 5. Translate answer back to user's language
    answer_final = translation_service.translate_from_english(answer_en, effective_lang)

    # 6. Hash response for blockchain logging
    response_hash = llm_service.hash_response(request.message, answer_en)

    # 7. Verify source citations on-chain
    for citation in citations:
        if citation.source_hash:
            result = blockchain_service.verify_source(citation.source_hash)
            citation.verified_on_chain = result.get("verified", False)

    # 8. Log response to blockchain (fire and don't block on failure)
    source_hashes = [c.source_hash for c in citations if c.source_hash]
    import hashlib
    q_hash = hashlib.sha256(request.message.encode()).hexdigest()
    log_result = blockchain_service.log_response_on_chain(q_hash, response_hash, source_hashes)
    logged_on_chain = log_result.get("success", False)

    # 9. Save to local DB
    log_entry = ChatLog(
        session_id=session_id,
        question=request.message,
        answer=answer_en,
        language=effective_lang,
        response_hash=response_hash,
        logged_on_chain=logged_on_chain,
    )
    db.add(log_entry)
    await db.commit()

    return ChatResponse(
        session_id=session_id,
        response=answer_final,
        original_language=effective_lang,
        sources=citations,
        sanskrit_quote=sanskrit_quote,
        related_topics=related_topics,
        confidence=confidence,
        response_hash=response_hash,
        logged_on_chain=logged_on_chain,
    )
