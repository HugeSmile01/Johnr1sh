import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { verifyAccessToken } from '@johnr1sh/lib/auth/jwt';
import type { TokenPayload } from '@johnr1sh/lib/auth/jwt';

export interface Context {
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  user: TokenPayload | null;
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<Context> {
  let user: TokenPayload | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      user = await verifyAccessToken(token);
    } catch {
      // Invalid/expired token — leave user as null
    }
  }

  return { req, res, user };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
