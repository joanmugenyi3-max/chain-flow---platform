# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build tools required by some packages (Prophet, psycopg2, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install wheel/setuptools first for reliable builds
RUN pip install --upgrade pip setuptools wheel

COPY requirements.txt .

# Install all Python dependencies into a prefix directory so the production
# stage can copy them cleanly without needing build tooling.
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ─── Stage 2: production ─────────────────────────────────────────────────────
FROM python:3.11-slim AS production

WORKDIR /app

# Runtime system dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Create non-root user and group
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/bash --create-home appuser

# Copy application source
COPY src/ ./src/

# Model registry directory (mounted as volume in production)
RUN mkdir -p /app/model_registry && chown -R appuser:appgroup /app

USER appuser

# Expose service port
EXPOSE 8000

# Health-check so orchestrators know when the service is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--loop", "uvloop", "--http", "httptools"]
