#!/usr/bin/env bash
# ============================================================
# ChainFlow Platform - GitHub Repository Setup Script
# Usage: ./setup-github.sh <your-github-username> <repo-name>
# Example: ./setup-github.sh johndoe chainflow-platform
# ============================================================

set -euo pipefail

GITHUB_USER="${1:-}"
REPO_NAME="${2:-chainflow-platform}"
BRANCH="main"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }
error()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header() { echo -e "\n${BOLD}${BLUE}══ $1 ══${NC}"; }

# ── Validate arguments ───────────────────────────────────────────────
if [ -z "$GITHUB_USER" ]; then
  error "Usage: ./setup-github.sh <github-username> [repo-name]"
fi

header "ChainFlow Platform — GitHub Initialization"
echo "User:       $GITHUB_USER"
echo "Repository: $REPO_NAME"
echo "Branch:     $BRANCH"
echo ""

# ── Prerequisites check ──────────────────────────────────────────────
header "Checking prerequisites"
command -v git >/dev/null 2>&1 || error "git is not installed"
command -v gh  >/dev/null 2>&1 || warn "GitHub CLI (gh) not found — you'll need to create the repo manually"
log "git found: $(git --version)"

# ── .gitignore ───────────────────────────────────────────────────────
header "Creating .gitignore"
cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
out/
*.tsbuildinfo

# Environment files (NEVER commit these)
.env
.env.local
.env.*.local
.env.production
.env.staging
!.env.example

# Python
__pycache__/
*.py[cod]
.venv/
*.egg-info/
.pytest_cache/

# Terraform state (use remote state)
*.tfstate
*.tfstate.backup
.terraform/
*.tfvars
!*.tfvars.example

# Logs
*.log
logs/
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Coverage
coverage/
.nyc_output/

# Turbo cache
.turbo/

# Docker
.docker/

# AI model artifacts
*.pkl
*.h5
*.pt
*.pth
models/weights/

# Certificates
*.pem
*.key
*.crt
GITIGNORE
log ".gitignore created"

# ── .env.example ─────────────────────────────────────────────────────
header "Creating .env.example"
cat > .env.example << 'ENVEXAMPLE'
# ── Database ─────────────────────────────────────────────
DATABASE_URL=postgresql://chainflow:your_password@localhost:5432/chainflow_db

# ── Redis ─────────────────────────────────────────────────
REDIS_URL=redis://:your_redis_password@localhost:6379

# ── Kafka ─────────────────────────────────────────────────
KAFKA_BROKERS=localhost:9092

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET=replace_with_minimum_32_chars_random_secret
JWT_REFRESH_SECRET=replace_with_another_32_chars_secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── AWS ───────────────────────────────────────────────────
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=chainflow-uploads-your-account

# ── Stripe ────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# ── OAuth ─────────────────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MS_CLIENT_ID=your_microsoft_client_id
MS_CLIENT_SECRET=your_microsoft_client_secret

# ── AI Engine ─────────────────────────────────────────────
AI_ENGINE_URL=http://localhost:8000
OPENAI_API_KEY=sk-your-openai-key-optional

# ── App ───────────────────────────────────────────────────
NODE_ENV=development
PORT=4001
APP_URL=http://localhost:3000
API_URL=http://localhost:4000

# ── Frontend ──────────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:4000
VITE_AI_ENGINE_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
ENVEXAMPLE
log ".env.example created"

# ── Git initialization ───────────────────────────────────────────────
header "Initializing Git repository"
git init
git config core.autocrlf false
git add -A
git commit -m "feat: initial ChainFlow platform architecture

- Monorepo structure (Turborepo + pnpm workspaces)
- Microservices: procurement, inventory, logistics, production, mining, ai-engine, saas-core
- Prisma schema: complete ERD (multi-tenant, all modules)
- i18n: EN + FR complete translations
- Docker Compose: full local dev stack
- GitHub Actions: CI/CD pipeline (test → build → staging → production)
- AWS EKS deployment configs
- Terraform infrastructure modules

Co-authored-by: ChainFlow Platform <platform@chainflow.io>"

git branch -M $BRANCH
log "Git initialized with initial commit"

# ── GitHub repository creation ───────────────────────────────────────
header "Creating GitHub repository"
if command -v gh >/dev/null 2>&1; then
  echo ""
  echo "Attempting to create repository via GitHub CLI..."
  echo "You may be prompted to authenticate."
  echo ""
  gh auth status 2>/dev/null || gh auth login

  gh repo create "$GITHUB_USER/$REPO_NAME" \
    --private \
    --description "ChainFlow — AI-powered Supply Chain SaaS Platform" \
    --push \
    --source=. \
    --remote=origin && log "Repository created and pushed!" || {
      warn "Auto-creation failed. Doing manual push..."
      git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
      git push -u origin $BRANCH
    }
else
  warn "GitHub CLI not available. Running manual setup..."
  echo ""
  echo "  1. Go to: https://github.com/new"
  echo "  2. Create repository: $REPO_NAME"
  echo "  3. Then run these commands:"
  echo ""
  echo "     git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
  echo "     git push -u origin $BRANCH"
fi

# ── GitHub Secrets reminder ──────────────────────────────────────────
header "Required GitHub Secrets (Settings → Secrets → Actions)"
echo ""
echo "  AWS_ACCOUNT_ID              Your AWS account ID"
echo "  AWS_ACCESS_KEY_ID           IAM user access key (deploy role)"
echo "  AWS_SECRET_ACCESS_KEY       IAM user secret key"
echo "  PRODUCTION_DATABASE_URL     RDS PostgreSQL connection string"
echo "  STRIPE_SECRET_KEY           Live Stripe secret key"
echo "  SLACK_WEBHOOK_URL           Slack notifications webhook"
echo "  CODECOV_TOKEN               Codecov.io token (optional)"
echo ""
warn "NEVER commit real secrets to the repository!"
echo ""

header "Setup complete!"
echo ""
echo "  Repository: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "  Next steps:"
echo "  1. cp .env.example .env && fill in values"
echo "  2. pnpm install"
echo "  3. docker-compose up -d"
echo "  4. pnpm db:migrate && pnpm db:seed"
echo "  5. pnpm dev"
echo ""
