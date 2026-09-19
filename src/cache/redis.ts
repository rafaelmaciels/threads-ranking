import Redis from 'ioredis';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis não disponível. Desabilitando tentativas agressivas de reconexão.');
        return null;
      }
      return Math.min(times * 200, 1000);
    },
  });

  client.on('error', (err) => {
    logger.warn('Aviso de conexão com Redis:', { error: err.message });
  });

  client.on('connect', () => {
    logger.info('Conectado ao Redis com sucesso.');
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis;
