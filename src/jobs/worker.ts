import { Worker, Job } from 'bullmq';
import { bullRedisConnection } from './queue';
import { ProfileSyncService } from '@/services/profileSyncService';
import { logger } from '@/utils/logger';

interface ProfileSyncJobData {
  username: string;
  forceFresh?: boolean;
}

export function startWorker() {
  logger.info('🚀 Inicializando BullMQ Worker para sincronização de perfis...');

  const worker = new Worker<ProfileSyncJobData>(
    'profile-sync',
    async (job: Job<ProfileSyncJobData>) => {
      const { username } = job.data;
      logger.info(`[Worker] Processando sync para @${username}`, { jobId: job.id });

      const result = await ProfileSyncService.syncProfile(username, {
        maxPages: 5,
        pageSize: 25,
      });

      return result;
    },
    {
      connection: bullRedisConnection,
      concurrency: 2, // Concorrência máxima para respeitar rate limits externos
    }
  );

  worker.on('completed', (job: Job) => {
    logger.info(`[Worker] Job ${job.id} concluído com sucesso para @${job.data.username}`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error(`[Worker] Job ${job?.id} falhou para @${job?.data.username}: ${err.message}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Encerrando worker BullMQ de forma graciosa...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return worker;
}

// Se executado diretamente via linha de comando (`npm run worker`)
if (require.main === module) {
  startWorker();
}
