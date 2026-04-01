import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@johnr1sh/api/src/router/index';
import { createContext } from '@johnr1sh/api/src/router/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ req } as never),
  });

export { handler as GET, handler as POST };
