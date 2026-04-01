import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './context.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@johnr1sh/lib/auth/jwt';
import {
  storeRefreshToken,
  getStoredRefreshToken,
  invalidateRefreshToken,
  authRatelimit,
} from '@johnr1sh/lib/cache/redis';
import { supabaseAdmin } from '@johnr1sh/lib/auth/supabase';
import { logAudit } from '../services/audit.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authRouter = router({
  /** Exchange Supabase OAuth token for our JWT pair */
  exchangeToken: publicProcedure
    .input(z.object({ supabaseAccessToken: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const ip =
        (ctx.req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
        ctx.req.socket.remoteAddress ??
        'unknown';

      const { success } = await authRatelimit.limit(ip);
      if (!success) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many auth attempts' });
      }

      const { data: supaUser, error } = await supabaseAdmin.auth.getUser(input.supabaseAccessToken);
      if (error || !supaUser.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Supabase token' });
      }

      const { id: supaId, email } = supaUser.user;
      if (!email) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email required' });

      const user = await prisma.user.upsert({
        where: { email },
        update: { updatedAt: new Date() },
        create: { id: supaId, email, name: supaUser.user.user_metadata?.['full_name'] as string | undefined },
      });

      const [accessToken, refreshToken] = await Promise.all([
        signAccessToken({ sub: user.id, email: user.email, role: user.role as 'user' | 'admin' }),
        signRefreshToken(user.id),
      ]);

      await storeRefreshToken(user.id, refreshToken);
      await logAudit({ userId: user.id, action: 'auth.login', resource: 'session', ipAddress: ip });

      return { accessToken, refreshToken, expiresIn: 900 };
    }),

  /** Rotate refresh token and issue new access + refresh token pair */
  refreshTokens: publicProcedure
    .input(z.object({ refreshToken: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const ip =
        (ctx.req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
        ctx.req.socket.remoteAddress ??
        'unknown';

      let userId: string;
      try {
        ({ sub: userId } = await verifyRefreshToken(input.refreshToken));
      } catch {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid refresh token' });
      }

      const stored = await getStoredRefreshToken(userId);
      if (stored !== input.refreshToken) {
        // Possible token reuse — invalidate and force re-login
        await invalidateRefreshToken(userId);
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Refresh token reuse detected' });
      }

      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

      const [accessToken, newRefreshToken] = await Promise.all([
        signAccessToken({ sub: user.id, email: user.email, role: user.role as 'user' | 'admin' }),
        signRefreshToken(user.id),
      ]);

      await storeRefreshToken(user.id, newRefreshToken);
      await logAudit({ userId: user.id, action: 'auth.refresh', resource: 'session', ipAddress: ip });

      return { accessToken, refreshToken: newRefreshToken, expiresIn: 900 };
    }),

  /** Revoke refresh token and end session */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await invalidateRefreshToken(ctx.user.sub);
    await logAudit({ userId: ctx.user.sub, action: 'auth.logout', resource: 'session' });
    return { success: true };
  }),

  /** Return current user profile */
  me: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findUniqueOrThrow({ where: { id: ctx.user.sub } });
  }),
});
