# Security

## Authentication

### Flow

```
1. User clicks "Sign in with Google"
2. Supabase handles OAuth redirect + callback
3. API exchanges Supabase token → our JWT pair
4. Access token (15 min) stored in memory (React state)
5. Refresh token (7 days) stored in HTTP-only cookie (or Redis key)
6. Token rotation: every refresh invalidates the previous refresh token
7. Reuse detection: if old refresh token presented → invalidate all sessions
```

### JWT

- Algorithm: **HS256** (symmetric; secret ≥ 64 bytes, generated with `openssl rand -base64 64`)
- Access token TTL: **15 minutes**
- Refresh token TTL: **7 days**, stored in Upstash Redis, one per user
- Issuer: `johnr1sh-copilot`; Audience: `johnr1sh-web`

## HTTP Security Headers

| Header                          | Value                               |
| ------------------------------- | ----------------------------------- |
| `Strict-Transport-Security`     | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy`       | Strict; no `unsafe-eval` in prod    |
| `X-Frame-Options`               | `DENY`                              |
| `X-Content-Type-Options`        | `nosniff`                           |
| `Referrer-Policy`               | `strict-origin-when-cross-origin`   |
| `Permissions-Policy`            | Camera, mic, geolocation blocked    |
| `Cross-Origin-Opener-Policy`    | `same-origin`                       |

## Rate Limiting

Implemented via **Upstash Redis sliding-window** counters:

| Endpoint   | Limit          | Window |
| ---------- | -------------- | ------ |
| Chat       | 20 requests    | 10 s   |
| Auth       | 5 attempts     | 1 min  |

## Input Sanitisation

- All user messages are stripped of HTML tags and control characters before being sent to Replicate.
- `lib/security/sanitize.ts` provides `sanitizePrompt()` (server-safe) and `stripHtml()`.
- On the client, use **DOMPurify** for rich-text rendering.

## Database

- Row-Level Security (RLS) enabled on all Supabase tables.
- Prisma ORM prevents raw SQL injection via parameterised queries.
- `DATABASE_URL` uses the Supabase connection pooler; `DIRECT_URL` for migrations.

## Secrets Management

- No secrets committed to source control (enforced by `.gitignore` and pre-commit hooks).
- All secrets injected as environment variables at runtime.
- Rotate `JWT_SECRET` immediately if compromised (invalidates all sessions).

## Dependency Security

- Weekly `pnpm audit` via `security-audit.yml` GitHub Action.
- CodeQL static analysis on every push.
- Optional Snyk integration (set `SNYK_ENABLED=true`).
