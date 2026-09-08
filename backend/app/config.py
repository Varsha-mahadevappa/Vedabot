from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    groq_api_key: str = ""
    chroma_db_path: str = "./chroma_db"
    shardeum_rpc_url: str = "https://sphinx.shardeum.org/"
    veda_knowledge_contract: str = "0x0000000000000000000000000000000000000000"
    response_log_contract: str = "0x0000000000000000000000000000000000000000"
    veda_token_contract: str = "0x0000000000000000000000000000000000000000"
    wallet_private_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./vedabot.db"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
