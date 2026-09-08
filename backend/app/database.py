from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import Column, String, Integer, Text, Boolean, Float, DateTime
from datetime import datetime
from app.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    language = Column(String, default="en")


class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String)
    question = Column(Text)
    answer = Column(Text)
    language = Column(String)
    response_hash = Column(String, nullable=True)
    logged_on_chain = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeContribution(Base):
    __tablename__ = "knowledge_contributions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String)
    content = Column(Text)
    category = Column(String)
    contributor_address = Column(String)
    source_hash = Column(String)
    verified = Column(Boolean, default=False)
    reward_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
