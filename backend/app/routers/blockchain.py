import hashlib
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.schemas import BlockchainVerifyRequest, BlockchainVerifyResponse, ContributeRequest
from app.services import blockchain_service
from app.database import get_db, KnowledgeContribution

router = APIRouter(prefix="/blockchain", tags=["blockchain"])


@router.post("/verify", response_model=BlockchainVerifyResponse)
async def verify_source(request: BlockchainVerifyRequest):
    """Verify if a knowledge source hash is registered on Shardeum."""
    result = blockchain_service.verify_source(request.source_hash)
    return BlockchainVerifyResponse(
        hash=request.source_hash,
        verified=result.get("verified", False),
        title=result.get("title"),
        timestamp=result.get("timestamp"),
    )


@router.get("/status")
async def blockchain_status():
    """Check Shardeum blockchain connection status."""
    connected = blockchain_service.is_connected()
    total_logs = blockchain_service.get_response_log_count() if connected else 0
    return {
        "connected": connected,
        "network": "Shardeum Sphinx Testnet",
        "total_response_logs": total_logs,
    }


@router.post("/contribute")
async def contribute_knowledge(request: ContributeRequest, db: AsyncSession = Depends(get_db)):
    """Submit a new Vedic knowledge source for community review and on-chain registration."""
    source_hash = hashlib.sha256(request.content.encode("utf-8")).hexdigest()

    contribution = KnowledgeContribution(
        title=request.title,
        content=request.content,
        category=request.category,
        contributor_address=request.contributor_address,
        source_hash=source_hash,
    )
    db.add(contribution)
    await db.commit()

    return {
        "message": "Contribution submitted for review",
        "source_hash": source_hash,
        "title": request.title,
        "status": "pending_review",
    }


@router.get("/contributions")
async def list_contributions(db: AsyncSession = Depends(get_db)):
    """List all submitted knowledge contributions."""
    result = await db.execute(select(KnowledgeContribution).order_by(KnowledgeContribution.created_at.desc()))
    contributions = result.scalars().all()
    return {
        "contributions": [
            {
                "id": c.id,
                "title": c.title,
                "category": c.category,
                "contributor": c.contributor_address,
                "source_hash": c.source_hash,
                "verified": c.verified,
                "reward_paid": c.reward_paid,
            }
            for c in contributions
        ]
    }
