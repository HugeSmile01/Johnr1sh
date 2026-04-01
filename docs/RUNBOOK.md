# Runbook

## Common Issues

### App won't start locally

1. Confirm Docker services are running: `docker-compose -f infra/docker-compose.yml ps`
2. Confirm `.env.local` exists and is fully populated.
3. Run `pnpm db:generate` — Prisma client may be out of date.

### "JWT_SECRET environment variable is not set"

Set `JWT_SECRET` in `.env.local`. Generate a secure value:
```bash
openssl rand -base64 64
```

### Rate limit errors (429)

The Upstash Redis limits are:
- Chat: 20 req / 10 s per IP
- Auth: 5 req / min per IP

In development, you can increase limits in `lib/cache/redis.ts`.

### Prisma migration fails

```bash
# Reset local DB (data loss!)
pnpm --filter db prisma migrate reset

# Inspect migration status
pnpm --filter db prisma migrate status
```

### Replicate timeout

- Check `REPLICATE_API_TOKEN` is valid.
- The Llama 2 70B model may take 30-60 s on first request (cold start).
- Retry the request; subsequent requests are faster.

### Supabase OAuth callback fails

- Ensure the callback URL `https://your-domain.vercel.app/api/auth/callback` is added to Supabase → Authentication → URL Configuration → Redirect URLs.
- For local dev: `http://localhost:3000/api/auth/callback`.

## Monitoring

- **Sentry**: https://sentry.io — errors are captured automatically.
- **PostHog**: https://app.posthog.com — user events.
- **Vercel**: https://vercel.com/dashboard — deployment logs and edge function metrics.

## Incident Response

1. Check Sentry for error spike.
2. Check Vercel deployment logs.
3. If DB issue: check Supabase dashboard → Logs.
4. If rate-limit issue: check Upstash Redis → Analytics.
5. Rollback: Vercel Dashboard → Deployments → previous → Promote to Production.
6. Rotate `JWT_SECRET` if auth is compromised (forces all users to re-login).

## Scaling

- **Web**: Vercel scales automatically (serverless).
- **API**: Deploy as a container on Railway/Fly.io with `PORT=4000`.
- **DB**: Upgrade Supabase plan; enable read replicas for high read traffic.
- **Cache**: Upstash Redis scales with usage; no manual intervention needed.
