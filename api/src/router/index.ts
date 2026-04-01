import { router } from './context.js';
import { chatRouter } from './chat.js';
import { authRouter } from './auth.js';
import { githubRouter } from './github.js';

export const appRouter = router({
  chat: chatRouter,
  auth: authRouter,
  github: githubRouter,
});

export type AppRouter = typeof appRouter;
