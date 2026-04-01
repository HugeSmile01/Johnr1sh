# Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser / PWA                         │
│   Next.js 15 (App Router)  +  React 19  +  Tailwind CSS     │
│   Service Worker (offline-first)                             │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS / tRPC
┌──────────────────────────▼───────────────────────────────────┐
│                     tRPC API Server                          │
│   Express + tRPC  |  JWT Auth  |  Rate Limiting              │
│   Audit Logging   |  Sentry    |  Zod Validation             │
└────┬────────────────────┬──────────────────────┬─────────────┘
     │                    │                      │
┌────▼──────┐    ┌────────▼──────┐    ┌──────────▼──────────┐
│ Supabase  │    │  Upstash      │    │  Replicate          │
│ PostgreSQL│    │  Redis        │    │  Llama 2 70B        │
│ + Prisma  │    │  Rate Limit   │    │  AI Inference       │
└───────────┘    └───────────────┘    └─────────────────────┘
```

## Monorepo Packages

| Package         | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `web`           | Next.js 15 frontend, PWA, App Router           |
| `api`           | tRPC server, business logic, AI integration    |
| `lib`           | Shared utilities: auth, security, cache, types |
| `ui`            | Shared React component library                 |
| `db`            | Prisma schema, migrations, seed                |

## Data Flow

1. **User authentication**: Google OAuth → Supabase → JWT (access + refresh) stored in memory / HTTP-only cookie.
2. **Chat request**: Client sends message via tRPC → rate limit check (Redis) → sanitise prompt → Replicate Llama2 → save to PostgreSQL → return response.
3. **Token refresh**: Sliding-window refresh token rotation stored in Redis; reuse detection triggers logout.
4. **Offline**: Service Worker caches shell assets; API requests fail gracefully when offline.

## Security Layers

- HTTPS everywhere (HSTS preload)
- Content-Security-Policy (strict, no `unsafe-eval` in prod)
- JWT HS256 with short-lived access tokens (15 min) + refresh token rotation
- Upstash Redis rate limiting (IP-based sliding window)
- Zod input validation on every tRPC procedure
- DOMPurify + server-side HTML stripping for AI prompts
- Row-Level Security enabled on all Supabase tables
- Audit log for every auth + chat event
