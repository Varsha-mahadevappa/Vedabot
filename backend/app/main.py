from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routers import chat, knowledge, blockchain


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown (nothing to clean up)


app = FastAPI(
    title="VedaBot API",
    description="Multilingual Vedic Knowledge Chatbot — powered by Claude AI + Shardeum Blockchain",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(knowledge.router)
app.include_router(blockchain.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "VedaBot API", "version": "1.0.0"}
