# Deployment Guide

## Prerequisites

- Node.js ≥ 20, pnpm ≥ 9
- A [Supabase](https://supabase.com) project
- An [Upstash](https://upstash.com) Redis database
- A [Replicate](https://replicate.com) account
- A [Vercel](https://vercel.com) account (for web)
- A [Sentry](https://sentry.io) project (optional)

## Local Development

```bash
# 1. Clone and install
pnpm install

# 2. Start backing services
docker-compose -f infra/docker-compose.yml up -d

# 3. Configure environment
cp infra/env.example .env.local
# Edit .env.local with your credentials

# 4. Generate Prisma client + run migrations
pnpm db:generate
pnpm db:migrate

# 5. Start all services
pnpm dev
# web → http://localhost:3000
# api → http://localhost:4000
```

## Production Deployment (Vercel)

### Required Secrets (GitHub)

| Secret              | Description                       |
| ------------------- | --------------------------------- |
| `VERCEL_TOKEN`      | Vercel personal access token      |
| `VERCEL_ORG_ID`     | Vercel organisation ID            |
| `VERCEL_PROJECT_ID` | Vercel project ID                 |
| `SENTRY_AUTH_TOKEN` | Sentry auth token (optional)      |

### Required Environment Variables (Vercel Dashboard)

Copy all variables from `infra/env.example` into Vercel → Settings → Environment Variables. Ensure `NODE_ENV=production`.

### Deploy

Push to `main` branch — the `deploy.yml` GitHub Action will:
1. Build the project
2. Deploy to Vercel production
3. Notify Sentry of the new release

## Database Migrations

```bash
# Development
pnpm db:migrate

# Production (run once after deploy)
DATABASE_URL=<prod-url> pnpm --filter db prisma migrate deploy
```

## Rollback

Vercel keeps previous deployment snapshots. Roll back via Vercel Dashboard → Deployments → select previous → Promote to Production.
