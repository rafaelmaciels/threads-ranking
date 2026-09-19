import { describe, it, expect } from 'vitest';
import { MockThreadsProvider } from '@/providers/threads/mock/mockProvider';

describe('MockThreadsProvider', () => {
  const provider = new MockThreadsProvider();

  it('deve retornar os metadados do perfil demo', async () => {
    const profile = await provider.getProfile('demo');
    expect(profile.username).toBe('demo');
    expect(profile.name).toBe('Demonstração Oficial');
    expect(profile.isVerified).toBe(true);
  });

  it('deve retornar lista paginada de posts', async () => {
    const result = await provider.getPosts('demo', { limit: 2 });
    expect(result.data.length).toBe(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe('2');
    expect(result.data[0].metrics.likes).toBeGreaterThan(0);
  });

  it('deve permitir obter métricas de um post específico', async () => {
    const metrics = await provider.getPostMetrics('mock_post_demo_1');
    expect(metrics.likes).toBe(125430);
    expect(metrics.replies).toBe(3420);
  });
});
