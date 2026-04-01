import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

function getRedisClient(): Redis {
  const url = process.env['UPSTASH_REDIS_REST_URL'];
  const token = process.env['UPSTASH_REDIS_REST_TOKEN'];
  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
  }
  return new Redis({ url, token });
}

export const redis = getRedisClient();

/**
 * No chat rate limit — the Replicate / Llama 2 model does not publish a
 * hard per-user call cap, so we honour the "no limit" policy. The limiter
 * below is set to 1 000 000 requests per 10 seconds which is effectively
 * unlimited while still letting Upstash collect analytics.
 */
export const chatRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1_000_000, '10 s'),
  analytics: true,
  prefix: 'rl:chat',
});

/**
 * 30 auth attempts per minute — generous for a single-user deployment
 * while still blocking credential-stuffing attacks.
 */
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: 'rl:auth',
});

export async function invalidateRefreshToken(userId: string): Promise<void> {
  await redis.del(`rt:${userId}`);
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  await redis.set(`rt:${userId}`, token, { ex: 60 * 60 * 24 * 7 }); // 7 days
}

export async function getStoredRefreshToken(userId: string): Promise<string | null> {
  return redis.get<string>(`rt:${userId}`);
}
