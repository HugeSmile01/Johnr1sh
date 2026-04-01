import { TRPCError } from '@trpc/server';
import type { TRPCErrorCode } from '@trpc/server/dist/rpc/codes';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: TRPCErrorCode = 'INTERNAL_SERVER_ERROR',
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function toTRPCError(err: unknown): TRPCError {
  if (err instanceof TRPCError) return err;
  if (err instanceof AppError) {
    return new TRPCError({ code: err.code, message: err.message });
  }
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
}
