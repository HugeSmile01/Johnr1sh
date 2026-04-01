# Johnr1sh Copilot

> Secure Mobile-First AI System — Production Monorepo

## Stack

| Layer        | Technology                             |
| ------------ | -------------------------------------- |
| Frontend     | Next.js 15, App Router, Tailwind CSS   |
| API          | tRPC, Node.js, TypeScript              |
| AI Inference | Replicate Llama2                       |
| Database     | Supabase (PostgreSQL) + Prisma ORM     |
| Cache        | Upstash Redis (rate limiting)          |
| Auth         | JWT + Refresh Token Rotation, OAuth    |
| Monitoring   | Sentry + PostHog                       |
| CI/CD        | GitHub Actions + Vercel                |
| PWA          | Service Workers, offline-first         |

## Quick Start

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker (for local Supabase + Redis)

### 1. Clone & install

```bash
git clone https://github.com/HugeSmile01/Johnr1sh
cd Johnr1sh
pnpm install
```

### 2. Configure environment

```bash
cp infra/env.example .env.local
# Fill in your secrets
```

### 3. Start local services

```bash
docker-compose -f infra/docker-compose.yml up -d
```

### 4. Database setup

```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Run development servers

```bash
pnpm dev
```

- **Web** → http://localhost:3000
- **API** → http://localhost:4000

## Project Structure

```
johnr1sh-copilot/
├── web/          # Next.js 15 Frontend + PWA
├── api/          # tRPC Backend Server
├── lib/          # Shared Utilities
├── ui/           # Shared UI Components
├── db/           # Prisma Schema + Migrations
├── infra/        # DevOps Config
├── .github/      # GitHub Actions
└── docs/         # Documentation
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Security](docs/SECURITY.md)
- [API Reference](docs/API.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Runbook](docs/RUNBOOK.md)

## License

MIT
