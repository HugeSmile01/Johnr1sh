import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(8000),
});

export const SendMessageSchema = z.object({
  message: z.string().min(1).max(4000).trim(),
  conversationId: z.string().uuid().optional(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(['user', 'admin']).default('user'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SendMessage = z.infer<typeof SendMessageSchema>;
export type User = z.infer<typeof UserSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
