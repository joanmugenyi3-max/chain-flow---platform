from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Annotated

import structlog
from fastapi import Depends
from sqlalchemy import MetaData, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from src.config import get_settings

logger = structlog.get_logger(__name__)

# Module-level singletons – populated during application lifespan startup.
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None

# Shared metadata with naming convention so Alembic can auto-name constraints.
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}
metadata = MetaData(naming_convention=convention)


class Base(DeclarativeBase):
    """Base class for all ORM models."""

    metadata = metadata


async def init_db() -> None:
    """Create the async SQLAlchemy engine and session factory.

    Called once during application startup via the lifespan handler.
    """
    global _engine, _session_factory  # noqa: PLW0603

    settings = get_settings()
    logger.info("database.init", url=settings.database_url.split("@")[-1])

    _engine = create_async_engine(
        settings.database_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout,
        pool_pre_ping=True,
        echo=(settings.environment == "development"),
    )

    _session_factory = async_sessionmaker(
        bind=_engine,
        class_=AsyncSession,
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )

    # Verify connectivity
    async with _engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    logger.info("database.ready")


async def close_db() -> None:
    """Dispose the engine connection pool.

    Called during application shutdown via the lifespan handler.
    """
    global _engine  # noqa: PLW0603

    if _engine is not None:
        await _engine.dispose()
        logger.info("database.closed")
        _engine = None


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a transactional database session.

    Usage::

        @router.get("/example")
        async def handler(db: DBSession) -> ...:
            result = await db.execute(select(MyModel))
    """
    if _session_factory is None:
        raise RuntimeError("Database has not been initialised. Call init_db() first.")

    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# Convenience type alias for use in route signatures.
DBSession = Annotated[AsyncSession, Depends(get_session)]
