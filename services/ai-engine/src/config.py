from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings resolved from environment variables.

    All fields map 1-to-1 to an environment variable with the same name
    (case-insensitive by default with pydantic-settings).
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = Field(
        default="postgresql+asyncpg://chainflow:chainflow@localhost:5432/chainflow_ai",
        description="Async SQLAlchemy-compatible PostgreSQL URL.",
    )

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL.",
    )

    # ── Kafka ─────────────────────────────────────────────────────────────────
    kafka_brokers: str = Field(
        default="localhost:9092",
        description="Comma-separated list of Kafka broker addresses.",
    )
    kafka_consumer_group: str = Field(
        default="ai-engine-group",
        description="Kafka consumer group id.",
    )

    # ── Model Registry ────────────────────────────────────────────────────────
    model_registry_path: str = Field(
        default="/app/model_registry",
        description="Filesystem path where trained models are persisted.",
    )

    # ── Auth ──────────────────────────────────────────────────────────────────
    jwt_secret: str = Field(
        default="change-me-in-production-use-256-bit-secret",
        description="Secret key used to verify incoming JWT tokens.",
    )
    jwt_algorithm: str = Field(default="HS256")
    jwt_expiry_minutes: int = Field(default=60)

    # ── Service behaviour ─────────────────────────────────────────────────────
    environment: Literal["development", "staging", "production"] = Field(
        default="development",
        description="Deployment environment.",
    )
    log_level: str = Field(default="INFO")
    service_name: str = Field(default="ai-engine")
    service_version: str = Field(default="1.0.0")

    # ── DB pool tunables ──────────────────────────────────────────────────────
    db_pool_size: int = Field(default=10)
    db_max_overflow: int = Field(default=20)
    db_pool_timeout: int = Field(default=30)

    # ── Kafka topic names ─────────────────────────────────────────────────────
    topic_inventory_low_stock: str = Field(default="inventory.low_stock")
    topic_iot_alert: str = Field(default="mining.iot.alert")
    topic_po_received: str = Field(default="procurement.po.received")
    topic_shipment_delayed: str = Field(default="logistics.shipment.delayed")
    topic_ai_insight: str = Field(default="ai.insight.generated")

    @field_validator("kafka_brokers")
    @classmethod
    def _split_brokers(cls, v: str) -> str:  # noqa: N805
        # Normalise – strip surrounding whitespace from each broker.
        return ",".join(b.strip() for b in v.split(","))

    @property
    def kafka_broker_list(self) -> list[str]:
        return self.kafka_brokers.split(",")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()
