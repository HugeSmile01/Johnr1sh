import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@johnr1sh/api/src/server';

export const trpc = createTRPCReact<AppRouter>();

export function makeTRPCClient() {
  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: process.env['NEXT_PUBLIC_API_URL']
          ? `${process.env['NEXT_PUBLIC_API_URL']}/trpc`
          : '/api/trpc',
        headers() {
          const token =
            typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
