# Contributing

## Prerequisites

- Node.js ≥ 20, pnpm ≥ 9
- Docker (for local services)

## Setup

```bash
pnpm install
cp infra/env.example .env.local
docker-compose -f infra/docker-compose.yml up -d
pnpm db:generate && pnpm db:migrate
pnpm dev
```

## Branching

```
main        → Production-ready code
develop     → Integration branch
feature/*   → New features (branch from develop)
fix/*       → Bug fixes
chore/*     → Tooling / dependency updates
```

## Commit Messages

We use [Conventional Commits](https://conventionalcommits.org):

```
feat(chat): Add streaming AI responses
fix(auth): Handle expired refresh tokens correctly
docs(api): Update tRPC endpoint descriptions
chore(deps): Bump Prisma to 5.15
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`

## Code Style

- **Prettier** for formatting (run `pnpm format`)
- **ESLint** for linting (run `pnpm lint`)
- TypeScript strict mode — no `any` without a comment
- `'use client'` directive only where client interactivity is strictly needed

## Pull Requests

1. Open a PR against `develop`
2. Ensure CI passes (lint, type-check, build)
3. Request review from at least one maintainer
4. Squash-merge after approval

## Testing

```bash
pnpm test          # Run all tests
pnpm test --watch  # Watch mode
```

Write unit tests for all new utility functions and tRPC procedures.
