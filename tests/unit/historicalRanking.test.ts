import { describe, it, expect } from 'vitest';
import { MockThreadsProvider } from '@/providers/threads/mock/mockProvider';
import { RankingService } from '@/services/rankingService';

describe('Historical Ranking & Extended Period Verification', () => {
  const provider = new MockThreadsProvider();

  it('deve ranquear o post mais curtido de 120 dias atrás em #1, superando o post de 6 horas atrás', async () => {
    const ranking = await RankingService.getProfileRanking('demo', 'likes', { limit: 10 });
    
    // O post mais curtido do histórico é mock_post_demo_8 (210.500 likes, 120 dias atrás)
    expect(ranking.posts.length).toBeGreaterThanOrEqual(5);
    expect(ranking.posts[0].id).toBe('mock_post_demo_8');
    expect(ranking.posts[0].metrics.likes).toBe(210500);
    expect(ranking.posts[0].rank).toBe(1);

    // O post mais recente (mock_post_demo_5, de 6h atrás com 32k likes) não deve ser o primeiro no ranking de likes
    const recentPost = ranking.posts.find((p) => p.id === 'mock_post_demo_5');
    expect(recentPost).toBeDefined();
    expect(recentPost!.rank).toBeGreaterThan(1);
  });

  it('deve suportar paginação continuada por cursores para recuperar o histórico completo', async () => {
    const page1 = await provider.getPosts('demo', { limit: 4 });
    expect(page1.data.length).toBe(4);
    expect(page1.hasMore).toBe(true);
    expect(page1.nextCursor).toBe('4');

    const page2 = await provider.getPosts('demo', { limit: 4, cursor: page1.nextCursor });
    expect(page2.data.length).toBe(4);
    expect(page2.hasMore).toBe(true);
    expect(page2.nextCursor).toBe('8');

    // Posts da página 2 não devem repetir posts da página 1
    const idsPage1 = new Set(page1.data.map((p) => p.id));
    for (const post of page2.data) {
      expect(idsPage1.has(post.id)).toBe(false);
    }
  });

  it('deve filtrar publicações por data com since e until', async () => {
    const sixtyDaysAgo = new Date(Date.now() - 65 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const filtered = await provider.getPosts('demo', {
      limit: 50,
      since: sixtyDaysAgo,
      until: tenDaysAgo,
    });

    for (const post of filtered.data) {
      expect(post.publishedAt.getTime()).toBeGreaterThanOrEqual(sixtyDaysAgo.getTime());
      expect(post.publishedAt.getTime()).toBeLessThanOrEqual(tenDaysAgo.getTime());
    }
  });

  it('deve calcular corretamente o ranking para métricas variadas (replies, reposts, quotes)', async () => {
    const repliesRanking = await RankingService.getProfileRanking('demo', 'replies', { limit: 5 });
    for (let i = 0; i < repliesRanking.posts.length - 1; i++) {
      expect(repliesRanking.posts[i].metrics.replies).toBeGreaterThanOrEqual(
        repliesRanking.posts[i + 1].metrics.replies
      );
    }

    const repostsRanking = await RankingService.getProfileRanking('demo', 'reposts', { limit: 5 });
    for (let i = 0; i < repostsRanking.posts.length - 1; i++) {
      expect(repostsRanking.posts[i].metrics.reposts).toBeGreaterThanOrEqual(
        repostsRanking.posts[i + 1].metrics.reposts
      );
    }
  });

  it('deve posicionar DcMUJhsGCBF como #2 e Da54OlZESZn como #3 no ranking de curtidas do perfil real rafaelost', async () => {
    const ranking = await RankingService.getProfileRanking('rafaelost', 'likes', { limit: 5 });

    expect(ranking.posts.length).toBeGreaterThanOrEqual(4);

    // Rank 1: MSN post (349 likes)
    expect(ranking.posts[0].permalink).toContain('DdXeZECAGZs');
    expect(ranking.posts[0].metrics.likes).toBe(349);
    expect(ranking.posts[0].rank).toBe(1);

    // Rank 2: Android Studio post (272 likes) - https://www.threads.com/@rafaelost/post/DcMUJhsGCBF
    expect(ranking.posts[1].permalink).toContain('DcMUJhsGCBF');
    expect(ranking.posts[1].metrics.likes).toBe(272);
    expect(ranking.posts[1].rank).toBe(2);

    // Rank 3: Cirurgia miopia post (254 likes) - https://www.threads.com/@rafaelost/post/Da54OlZESZn
    expect(ranking.posts[2].permalink).toContain('Da54OlZESZn');
    expect(ranking.posts[2].metrics.likes).toBe(254);
    expect(ranking.posts[2].rank).toBe(3);

    // Rank 4: Kboing post (247 likes)
    expect(ranking.posts[3].permalink).toContain('DdQXoI6kQ8t');
    expect(ranking.posts[3].metrics.likes).toBe(247);
    expect(ranking.posts[3].rank).toBe(4);
  });
});

