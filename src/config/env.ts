import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Provider
  THREADS_PROVIDER: z.enum(['mock', 'official', 'external']).default('mock'),

  // Database & Redis
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/threads_ranking?schema=public'),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),

  // Official Threads API
  THREADS_CLIENT_ID: z.string().optional(),
  THREADS_CLIENT_SECRET: z.string().optional(),
  THREADS_ACCESS_TOKEN: z.string().optional(),
  THREADS_REDIRECT_URI: z.string().optional(),

  // External Provider
  THREADS_EXTERNAL_API_URL: z.string().url().default('https://api.socialfetch.dev/v1'),
  THREADS_EXTERNAL_API_KEY: z.string().optional(),

  // Performance and Rate limits
  SYNC_INTERVAL_HOURS: z.coerce.number().default(6),
  RATE_LIMIT_MAX_REQUESTS_PER_MINUTE: z.coerce.number().default(60),
});

export type Env = z.infer<typeof envSchema>;

function cleanEnv(raw: NodeJS.ProcessEnv): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === 'string' && val.trim() === '') {
      continue; // Ignora strings vazias para que Zod aplique .default() ou .optional()
    }
    cleaned[key] = val;
  }

  // Se NEXT_PUBLIC_APP_URL não foi definido ou estava vazio, aproveita VERCEL_URL se disponível
  if (!cleaned.NEXT_PUBLIC_APP_URL) {
    if (raw.NEXT_PUBLIC_VERCEL_URL) {
      cleaned.NEXT_PUBLIC_APP_URL = `https://${raw.NEXT_PUBLIC_VERCEL_URL}`;
    } else if (raw.VERCEL_PROJECT_PRODUCTION_URL) {
      cleaned.NEXT_PUBLIC_APP_URL = `https://${raw.VERCEL_PROJECT_PRODUCTION_URL}`;
    } else if (raw.VERCEL_URL) {
      cleaned.NEXT_PUBLIC_APP_URL = `https://${raw.VERCEL_URL}`;
    }
  }

  return cleaned;
}

function parseEnv(): Env {
  const cleaned = cleanEnv(process.env);
  const result = envSchema.safeParse(cleaned);
  
  if (!result.success) {
    console.warn('⚠️ Variáveis de ambiente incompletas ou com formato inválido, aplicando fallbacks seguros:', result.error.format());
    return envSchema.parse({
      ...cleaned,
      NEXT_PUBLIC_APP_URL: (typeof cleaned.NEXT_PUBLIC_APP_URL === 'string' && cleaned.NEXT_PUBLIC_APP_URL) || 'http://localhost:3000',
      THREADS_PROVIDER: ['mock', 'official', 'external'].includes(cleaned.THREADS_PROVIDER as string)
        ? cleaned.THREADS_PROVIDER
        : 'mock',
      DATABASE_URL: (typeof cleaned.DATABASE_URL === 'string' && cleaned.DATABASE_URL) || 'postgresql://postgres:postgres@localhost:5432/threads_ranking?schema=public',
      REDIS_URL: (typeof cleaned.REDIS_URL === 'string' && cleaned.REDIS_URL) || 'redis://localhost:6379',
      THREADS_EXTERNAL_API_URL: (typeof cleaned.THREADS_EXTERNAL_API_URL === 'string' && cleaned.THREADS_EXTERNAL_API_URL) || 'https://api.socialfetch.dev/v1',
    });
  }
  return result.data;
}

export const env = parseEnv();

