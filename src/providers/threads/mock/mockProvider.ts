import {
  ThreadsDataProvider,
  PaginatedResult,
  GetPostsOptions,
} from '../interface';
import { ThreadsProfile } from '@/domain/profiles/types';
import { ThreadsPost, ThreadsPostMetrics } from '@/domain/posts/types';
import { ProfileNotFoundError } from '@/utils/errors';

export class MockThreadsProvider implements ThreadsDataProvider {
  public readonly providerName = 'MockThreadsProvider';

  private profiles: Map<string, ThreadsProfile> = new Map([
    [
      'demo',
      {
        id: 'mock_profile_demo',
        threadsId: '100000001',
        username: 'demo',
        name: 'Demonstração Oficial',
        biography: 'Perfil de teste para o Threads Ranking. Mostrando os posts mais curtidos da rede.',
        profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        isVerified: true,
        followerCount: 245000,
      },
    ],
    [
      'zuck',
      {
        id: 'mock_profile_zuck',
        threadsId: '100000002',
        username: 'zuck',
        name: 'Mark Zuckerberg',
        biography: 'Building Meta and open source AI.',
        profilePictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        isVerified: true,
        followerCount: 8900000,
      },
    ],
  ]);

  private mockPosts: Map<string, ThreadsPost[]> = new Map([
    [
      'demo',
      [
        {
          id: 'mock_post_demo_1',
          threadsId: '1789456123001',
          profileId: 'mock_profile_demo',
          text: 'O Threads Ranking é uma ferramenta incrível e open source! Descubra quais são os posts com maior número de curtidas na rede.',
          permalink: 'https://threads.net/@demo/post/1789456123001',
          publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          metrics: {
            likes: 125430,
            replies: 3420,
            reposts: 8900,
            quotes: 1200,
          },
        },
        {
          id: 'mock_post_demo_2',
          threadsId: '1789456123002',
          profileId: 'mock_profile_demo',
          text: 'Arquitetura limpa, banco relacional PostgreSQL, cache Redis e Next.js moderno. É assim que se constrói software de alta performance.',
          permalink: 'https://threads.net/@demo/post/1789456123002',
          publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          metrics: {
            likes: 98210,
            replies: 1840,
            reposts: 4500,
            quotes: 890,
          },
        },
        {
          id: 'mock_post_demo_3',
          threadsId: '1789456123003',
          profileId: 'mock_profile_demo',
          text: 'Lembrando dos tempos do Favstars no Twitter antigo! Essa nostalgia com dados em tempo real é sensacional.',
          permalink: 'https://threads.net/@demo/post/1789456123003',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          metrics: {
            likes: 76840,
            replies: 950,
            reposts: 3100,
            quotes: 450,
          },
        },
        {
          id: 'mock_post_demo_4',
          threadsId: '1789456123004',
          profileId: 'mock_profile_demo',
          text: 'Qual o post com maior engajamento que você já publicou no Threads? Deixe aqui nos comentários!',
          permalink: 'https://threads.net/@demo/post/1789456123004',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          metrics: {
            likes: 54120,
            replies: 5200,
            reposts: 1200,
            quotes: 600,
          },
        },
        {
          id: 'mock_post_demo_5',
          threadsId: '1789456123005',
          profileId: 'mock_profile_demo',
          text: 'Post recente viralizando agora! Observem a taxa de crescimento por hora nos gráficos do ranking.',
          permalink: 'https://threads.net/@demo/post/1789456123005',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          metrics: {
            likes: 32000,
            replies: 850,
            reposts: 4100,
            quotes: 350,
          },
        },
      ],
    ],
    [
      'zuck',
      [
        {
          id: 'mock_post_zuck_1',
          threadsId: '1799999999001',
          profileId: 'mock_profile_zuck',
          text: 'Threads reached 200M monthly active users today. Thank you all for making this community vibrant!',
          permalink: 'https://threads.net/@zuck/post/1799999999001',
          publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          metrics: {
            likes: 450000,
            replies: 28000,
            reposts: 35000,
            quotes: 12000,
          },
        },
        {
          id: 'mock_post_zuck_2',
          threadsId: '1799999999002',
          profileId: 'mock_profile_zuck',
          text: 'Working on next generation open source frontier models. More coming soon.',
          permalink: 'https://threads.net/@zuck/post/1799999999002',
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          metrics: {
            likes: 310000,
            replies: 15400,
            reposts: 22000,
            quotes: 6500,
          },
        },
      ],
    ],
  ]);

  async getProfile(username: string): Promise<ThreadsProfile> {
    const cleanUsername = username.toLowerCase().replace(/^@/, '');
    const found = this.profiles.get(cleanUsername);

    if (found) {
      return found;
    }

    // Para permitir testes fluidos com qualquer username no modo mock:
    const dynamicProfile: ThreadsProfile = {
      id: `mock_profile_${cleanUsername}`,
      threadsId: `dyn_${Math.floor(Math.random() * 1000000)}`,
      username: cleanUsername,
      name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
      biography: `Perfil gerado dinamicamente para demonstração no MockThreadsProvider.`,
      profilePictureUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
      isVerified: false,
      followerCount: 1500,
    };
    this.profiles.set(cleanUsername, dynamicProfile);
    return dynamicProfile;
  }

  async getPosts(
    profileIdOrUsername: string,
    options?: GetPostsOptions
  ): Promise<PaginatedResult<ThreadsPost>> {
    const cleanUsername = profileIdOrUsername.toLowerCase().replace(/^@/, '').replace(/^mock_profile_/, '');
    let posts = this.mockPosts.get(cleanUsername);

    if (!posts) {
      // Gera posts fictícios sob demanda para usernames arbitrários no modo mock
      posts = [
        {
          id: `mock_post_${cleanUsername}_1`,
          threadsId: `dyn_post_${cleanUsername}_1`,
          profileId: `mock_profile_${cleanUsername}`,
          text: `Primeiro post em destaque de @${cleanUsername} para teste do Threads Ranking.`,
          permalink: `https://threads.net/@${cleanUsername}/post/1`,
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          metrics: {
            likes: 42300,
            replies: 410,
            reposts: 1200,
            quotes: 80,
          },
        },
        {
          id: `mock_post_${cleanUsername}_2`,
          threadsId: `dyn_post_${cleanUsername}_2`,
          profileId: `mock_profile_${cleanUsername}`,
          text: `Segundo post mais relevante de @${cleanUsername} com discussão nos comentários.`,
          permalink: `https://threads.net/@${cleanUsername}/post/2`,
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          metrics: {
            likes: 21800,
            replies: 1540,
            reposts: 890,
            quotes: 40,
          },
        },
        {
          id: `mock_post_${cleanUsername}_3`,
          threadsId: `dyn_post_${cleanUsername}_3`,
          profileId: `mock_profile_${cleanUsername}`,
          text: `Terceiro post com insights sobre tecnologia e engenharia de software.`,
          permalink: `https://threads.net/@${cleanUsername}/post/3`,
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          metrics: {
            likes: 12400,
            replies: 230,
            reposts: 450,
            quotes: 15,
          },
        },
      ];
      this.mockPosts.set(cleanUsername, posts);
    }

    const limit = options?.limit || 20;
    const offset = options?.cursor ? parseInt(options.cursor, 10) : 0;
    const paginated = posts.slice(offset, offset + limit);
    const nextOffset = offset + limit;
    const hasMore = nextOffset < posts.length;

    return {
      data: paginated,
      nextCursor: hasMore ? String(nextOffset) : undefined,
      hasMore,
    };
  }

  async getPostMetrics(postId: string): Promise<ThreadsPostMetrics> {
    for (const postList of this.mockPosts.values()) {
      const match = postList.find((p) => p.id === postId || p.threadsId === postId);
      if (match) {
        return match.metrics;
      }
    }
    return { likes: 1000, replies: 50, reposts: 20, quotes: 5 };
  }
}
