import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from './context.js';
import { sendChatMessage, getConversationHistory } from '../services/replicate.js';
import { PaginationSchema } from '@johnr1sh/lib/validation/schemas';
import { chatRatelimit } from '@johnr1sh/lib/cache/redis';
import { sanitizePrompt } from '@johnr1sh/lib/security/sanitize';
import { logAudit } from '../services/audit.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const chatRouter = router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(4000).trim(),
        conversationId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const ip = (ctx.req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
        ?? ctx.req.socket.remoteAddress
        ?? 'unknown';

      const { success } = await chatRatelimit.limit(ip);
      if (!success) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' });
      }

      const sanitized = sanitizePrompt(input.message);
      const userId = ctx.user.sub;

      // Get or create conversation
      let conversationId = input.conversationId;
      if (!conversationId) {
        const conv = await prisma.conversation.create({
          data: { userId, title: sanitized.slice(0, 80) },
        });
        conversationId = conv.id;
      } else {
        const conv = await prisma.conversation.findFirst({
          where: { id: conversationId, userId },
        });
        if (!conv) throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' });
      }

      // Save user message
      await prisma.chatMessage.create({
        data: { conversationId, role: 'user', content: sanitized },
      });

      // Fetch history for context
      const history = await getConversationHistory(conversationId);

      // Call AI
      const aiContent = await sendChatMessage([
        { role: 'system', content: 'You are Johnr1sh Copilot, a helpful AI assistant.' },
        ...history,
        { role: 'user', content: sanitized },
      ]);

      // Save assistant message
      const assistantMsg = await prisma.chatMessage.create({
        data: { conversationId, role: 'assistant', content: aiContent },
      });

      await logAudit({ userId, action: 'chat.send', resource: `conversation:${conversationId}`, ipAddress: ip });

      return { conversationId, message: assistantMsg };
    }),

  getConversations: protectedProcedure
    .input(PaginationSchema)
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.sub;
      const items = await prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      const hasMore = items.length > input.limit;
      const page = hasMore ? items.slice(0, -1) : items;
      return { items: page, hasMore, nextCursor: hasMore ? page.at(-1)?.id : undefined };
    }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }).merge(PaginationSchema))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.sub;
      const conv = await prisma.conversation.findFirst({
        where: { id: input.conversationId, userId },
      });
      if (!conv) throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' });

      const items = await prisma.chatMessage.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: 'asc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      const hasMore = items.length > input.limit;
      const page = hasMore ? items.slice(0, -1) : items;
      return { items: page, hasMore, nextCursor: hasMore ? page.at(-1)?.id : undefined };
    }),
});
