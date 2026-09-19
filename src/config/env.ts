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

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Configuração inválida de variáveis de ambiente:', result.error.format());
    // Força defaults aceitáveis em dev/test se algo pontual faltar
    return envSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/threads_ranking?schema=public',
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    });
  }
  return result.data;
}

export const env = parseEnv();
