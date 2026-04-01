<<<<<<< HEAD
# ChainFlow Platform

**AI-powered Supply Chain SaaS — Enterprise Grade**

> Combining the power of SAP, the intelligence of Palantir, and the usability of modern SaaS tools.

---

## Architecture Overview

ChainFlow is a microservices-based, multi-tenant SaaS platform built on:

- **Frontend**: React + TypeScript + TailwindCSS (Vite) with full EN/FR i18n
- **Backend**: NestJS microservices (Node.js 20) — one service per domain
- **AI/ML**: Python FastAPI with TensorFlow, PyTorch, Scikit-learn, Prophet
- **Database**: PostgreSQL 16 (RDS Multi-AZ) + Redis 7 (ElastiCache)
- **Messaging**: Apache Kafka (AWS MSK) — event-driven architecture
- **Infra**: AWS EKS (Kubernetes) + Terraform IaC + GitHub Actions CI/CD
- **Monorepo**: Turborepo + pnpm workspaces

---

## Repository Structure

```
chainflow-platform/
├── apps/
│   ├── web/                    # React dashboard (main SaaS app)
│   └── landing/                # Marketing landing page
│
├── services/
│   ├── procurement/            # PO, Suppliers, Contracts, CLM
│   ├── inventory/              # Stock, Warehouses, Movements
│   ├── logistics/              # Shipments, Fleet, Routes
│   ├── production/             # Capacity, Gantt, Maintenance
│   ├── mining/                 # Ore extraction, Equipment, IoT, ESG
│   ├── ai-engine/              # Python FastAPI — all ML models
│   ├── saas-core/              # Auth, Tenants, Billing, RBAC
│   └── notification/           # Email, In-app, Webhooks
│
├── packages/
│   ├── database/               # Prisma schema + migrations
│   ├── ui/                     # Shared React components
│   ├── i18n/                   # EN + FR translations
│   ├── types/                  # Shared TypeScript types
│   ├── config/                 # Shared config (ESLint, TS, etc.)
│   └── shared/                 # Utility functions
│
├── infra/
│   ├── terraform/              # AWS infrastructure as code
│   │   ├── modules/            # Reusable modules (EKS, RDS, MSK...)
│   │   └── environments/       # Staging & Production configs
│   ├── k8s/                    # Kubernetes manifests (Kustomize)
│   └── scripts/                # Init scripts, migrations
│
├── docs/
│   ├── api/                    # API documentation (OpenAPI)
│   ├── architecture/           # Architecture decision records
│   └── user/                   # User guides
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # Full CI/CD pipeline
│
├── docker-compose.yml          # Local dev stack
├── turbo.json                  # Turborepo pipeline
├── package.json                # Root workspace config
├── tsconfig.json               # Root TypeScript config
└── setup-github.sh             # GitHub initialization script
```

---

## Quick Start — Local Development

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose
- Git

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/chainflow-platform.git
cd chainflow-platform
pnpm install
```

### 2. Environment setup

```bash
cp .env.example .env
# Edit .env with your local values
```

### 3. Start local infrastructure

```bash
docker-compose up -d
# Starts: PostgreSQL, Redis, Kafka, Kafka UI, Adminer
```

### 4. Database setup

```bash
pnpm db:migrate
pnpm db:seed       # Loads demo data (general + mining scenarios)
```

### 5. Run all services

```bash
pnpm dev
# Starts all services in parallel via Turborepo
# Web:        http://localhost:3000
# API:        http://localhost:4000
# AI Engine:  http://localhost:8000
# Kafka UI:   http://localhost:8090
# Adminer:    http://localhost:8080
```

---

## Push to Your GitHub Repository

### Option A — Automated (recommended)

```bash
chmod +x setup-github.sh
./setup-github.sh YOUR_GITHUB_USERNAME chainflow-platform
```

The script will:
1. Create `.gitignore` and `.env.example`
2. Initialize git and make the initial commit
3. Create the GitHub repository (via `gh` CLI if available)
4. Push all code
5. List required GitHub Secrets for CI/CD

### Option B — Manual

```bash
git init
git add -A
git commit -m "feat: initial ChainFlow platform architecture"
git branch -M main

# Create repo at https://github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/chainflow-platform.git
git push -u origin main
```

---

## GitHub Secrets Required for CI/CD

Set these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `AWS_ACCOUNT_ID` | Your 12-digit AWS account ID |
| `AWS_ACCESS_KEY_ID` | IAM access key (deploy role) |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `PRODUCTION_DATABASE_URL` | RDS PostgreSQL URL |
| `STRIPE_SECRET_KEY` | Stripe live secret key |
| `SLACK_WEBHOOK_URL` | Slack notifications |
| `CODECOV_TOKEN` | Code coverage (optional) |

---

## Infrastructure Deployment (AWS)

```bash
# 1. Create Terraform state backend first (one-time)
aws s3 mb s3://chainflow-terraform-state --region us-east-1
aws dynamodb create-table \
  --table-name chainflow-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# 2. Deploy staging
cd infra/terraform/environments/staging
terraform init
terraform plan
terraform apply

# 3. Deploy production
cd infra/terraform/environments/production
terraform init
terraform plan
terraform apply

# 4. Configure kubectl
aws eks update-kubeconfig --name chainflow-production --region us-east-1

# 5. Deploy Kubernetes workloads
kubectl apply -k infra/k8s/overlays/production
```

---

## Key Technical Decisions

**Multi-tenancy**: Row-level tenant isolation via `organizationId` on every table + PostgreSQL Row Level Security policies. Strict tenant context enforcement in all NestJS services via middleware.

**Event-driven**: All cross-service communication uses Kafka. Services publish domain events (e.g., `purchase-order.approved`) and subscribe independently — no direct service-to-service HTTP calls.

**AI integration**: The AI Engine (FastAPI) exposes REST endpoints consumed by NestJS services. Models are versioned and registered in AWS SageMaker Model Registry. Continuous retraining via scheduled Kafka consumers.

**i18n**: `react-i18next` on frontend, custom i18n middleware on NestJS backend (error messages, notifications). Locale stored per-user, currency/date formatting per-organization.

**Security**: JWT (15min expiry) + refresh tokens. All secrets via AWS Secrets Manager. Tenant data isolation enforced at application level AND database level (RLS). Audit logs on every write operation.

---

## Module Roadmap

| Module | Status |
|--------|--------|
| Auth + Multi-tenant core | Architecture complete |
| Procurement (PO, Suppliers, Contracts) | Architecture complete |
| Inventory (Stock, Warehouse, Movements) | Architecture complete |
| Logistics (Shipments, Fleet, Routes) | Architecture complete |
| Production Planning (Gantt, Capacity) | Architecture complete |
| Mining Specialization (Ore, Equipment, IoT) | Architecture complete |
| AI Engine (Forecasting, Risk, Anomaly) | Architecture complete |
| SaaS Core (Billing, Auth, RBAC) | Architecture complete |
| Frontend Dashboard | Next phase |
| i18n EN + FR | Complete |

---

## License

Proprietary — ChainFlow Platform. All rights reserved.
=======
# minechain - ai
IA - powered Supply Chain Saas for Africa 
>>>>>>> 76e06302e17fdaf503eb12457963e5f34d69ae20
