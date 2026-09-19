import { redis } from './redis';
import { logger } from '@/utils/logger';

// Fallback in-memory cache para ambientes locais ou testes onde o Redis não estiver rodando
const inMemoryCache = new Map<string, { value: string; expiresAt: number }>();

export class CacheService {
  /**
   * Obtém um item do cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch {
      // Fallback em memória
      const item = inMemoryCache.get(key);
      if (item && item.expiresAt > Date.now()) {
        return JSON.parse(item.value) as T;
      }
      inMemoryCache.delete(key);
    }
    return null;
  }

  /**
   * Salva um item no cache com TTL
   */
  static async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    try {
      await redis.setex(key, ttlSeconds, serialized);
    } catch {
      // Fallback em memória
      inMemoryCache.set(key, {
        value: serialized,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  /**
   * Remove uma chave
   */
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch {
      inMemoryCache.delete(key);
    }
  }

  /**
   * Controle de Rate Limit baseado em sliding window / fixed window
   */
  static async checkRateLimit(
    identifier: string,
    maxRequests = 60,
    windowSeconds = 60
  ): Promise<{ allowed: boolean; remaining: number; resetInSeconds: number }> {
    const key = `ratelimit:${identifier}`;
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }
      const ttl = await redis.ttl(key);
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetInSeconds: ttl > 0 ? ttl : windowSeconds,
      };
    } catch {
      // Se Redis falhar, permite a requisição mas loga aviso
      logger.warn('Rate limit Redis indisponível, ignorando bloqueio em fallback');
      return { allowed: true, remaining: maxRequests, resetInSeconds: windowSeconds };
    }
  }
}
