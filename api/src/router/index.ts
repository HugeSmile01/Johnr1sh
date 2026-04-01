import { router } from './context.js';
import { chatRouter } from './chat.js';
import { authRouter } from './auth.js';

export const appRouter = router({
  chat: chatRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
