import { ThreadsDataProvider } from './interface';
import { MockThreadsProvider } from './mock/mockProvider';
import { OfficialThreadsProvider } from './official/officialProvider';
import { ExternalThreadsProvider } from './external/externalProvider';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

let cachedProvider: ThreadsDataProvider | null = null;

export function getThreadsProvider(): ThreadsDataProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerType = env.THREADS_PROVIDER;
  logger.info(`Inicializando provedor de dados do Threads: [${providerType}]`);

  switch (providerType) {
    case 'official':
      cachedProvider = new OfficialThreadsProvider();
      break;
    case 'external':
      cachedProvider = new ExternalThreadsProvider();
      break;
    case 'mock':
    default:
      cachedProvider = new MockThreadsProvider();
      break;
  }

  return cachedProvider;
}

export * from './interface';
export { MockThreadsProvider } from './mock/mockProvider';
export { OfficialThreadsProvider } from './official/officialProvider';
export { ExternalThreadsProvider } from './external/externalProvider';
