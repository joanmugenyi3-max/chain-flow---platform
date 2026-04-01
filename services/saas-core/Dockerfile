# ─── Builder Stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install all dependencies (including devDeps needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY tsconfig.json nest-cli.json* ./
COPY src ./src/

# Generate Prisma client
RUN pnpm prisma:generate

# Compile TypeScript
RUN pnpm build

# ─── Development Stage ───────────────────────────────────────────────────────
FROM node:20-alpine AS development

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY tsconfig.json nest-cli.json* ./
COPY src ./src/

RUN pnpm prisma:generate

EXPOSE 4007

CMD ["pnpm", "start:dev"]

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy manifests and install production deps only
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile --prod \
  && pnpm prisma:generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Change ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4007

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4007/api/health || exit 1

CMD ["node", "dist/main"]
