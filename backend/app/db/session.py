from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=True, # Log SQL queries for development
    future=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
