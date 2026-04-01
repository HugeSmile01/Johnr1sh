import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router/index.js';
import { createContext } from './router/context.js';
import { getSecurityHeaders, getCorsHeaders } from '@johnr1sh/lib/security/headers';
import { initSentry } from '@johnr1sh/lib/monitoring/sentry';

initSentry();

const app = express();
const PORT = Number(process.env['PORT'] ?? 4000);

const allowedOrigins = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000').split(',');

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  }),
);

app.use((_req, res, next) => {
  const headers = getSecurityHeaders();
  const corsHeaders = getCorsHeaders(allowedOrigins);
  Object.entries({ ...headers, ...corsHeaders }).forEach(([k, v]) => res.setHeader(k, v));
  next();
});

app.use(express.json({ limit: '1mb' }));

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[api] Server listening on http://localhost:${PORT}`);
});

export type { AppRouter } from './router/index.js';
