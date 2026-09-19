import { Queue } from 'bullmq';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

// Parse Redis connection string para o BullMQ
const redisUrl = new URL(env.REDIS_URL);
export const bullRedisConnection = {
  host: redisUrl.hostname || 'localhost',
  port: parseInt(redisUrl.port || '6379', 10),
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null,
};

export const profileSyncQueue = new Queue('profile-sync', {
  connection: bullRedisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export async function enqueueProfileSync(
  username: string,
  options?: { priority?: number; forceFresh?: boolean }
) {
  logger.info(`Enfileirando job de sincronização para @${username}`);
  return profileSyncQueue.add(
    'sync-profile',
    { username, forceFresh: options?.forceFresh },
    {
      jobId: `sync:${username.toLowerCase()}:${Math.floor(Date.now() / (1000 * 60 * 15))}`, // Debounce de 15 minutos por perfil
      priority: options?.priority || 10,
    }
  );
}
