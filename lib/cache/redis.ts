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

/** 20 requests per 10 seconds per IP (sliding window) */
export const chatRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 s'),
  analytics: true,
  prefix: 'rl:chat',
});

/** 5 auth attempts per minute per IP */
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
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
