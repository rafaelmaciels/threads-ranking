import { prisma } from '@/database/prisma';
import { CacheService } from '@/cache/cacheService';
import { ProfileSyncService } from './profileSyncService';
import { calculatePostGrowth } from './growthCalculator';
import { RankingMetric, ProfileRankingResult, RankedPost } from '@/domain/rankings/types';
import { UsernameSchema } from '@/domain/profiles/types';
import { ProfileNotFoundError } from '@/utils/errors';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { getThreadsProvider } from '@/providers/threads';

// Circuit breaker para evitar esperar timeout do banco se o PostgreSQL local não estiver rodando
let dbUnavailableUntil = 0;

export class RankingService {
  /**
   * Obtém o ranking de posts de um perfil público com base na métrica selecionada
   */
  static async getProfileRanking(
    rawUsername: string,
    metric: RankingMetric = 'likes',
    options: { limit?: number; offset?: number; autoSyncIfStale?: boolean } = {}
  ): Promise<ProfileRankingResult> {
    const username = UsernameSchema.parse(rawUsername);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const offset = Math.max(0, options.offset ?? 0);
    const cacheKey = `ranking:${username}:${metric}:${offset}:${limit}`;

    // 1. Tenta recuperar do Redis
    const cached = await CacheService.get<ProfileRankingResult>(cacheKey);
    if (cached) {
      const { getHistoricalProfile } = await import('@/providers/threads/historicalData');
      const hist = getHistoricalProfile(username);
      if (!hist || (cached.pagination.total >= hist.posts.length && cached.posts.length > 0)) {
        return cached;
      }
    }

    // 2. Busca perfil no PostgreSQL (com circuit breaker se o banco estiver indisponível)
    let profile: any = null;
    let totalPostsCount = 0;
    const isDbBypassed = Date.now() < dbUnavailableUntil;

    if (!isDbBypassed) {
      try {
        profile = await prisma.profile.findUnique({
          where: { username },
        });

        const isStale =
          !profile?.lastSyncedAt ||
          Date.now() - profile.lastSyncedAt.getTime() > env.SYNC_INTERVAL_HOURS * 3600 * 1000;

        // Se o perfil não existe ou está desatualizado e autoSync permitido, sincroniza automaticamente
        if ((!profile || isStale) && options.autoSyncIfStale !== false) {
          try {
            await ProfileSyncService.syncProfile(username);
            profile = await prisma.profile.findUnique({ where: { username } });
          } catch (syncErr) {
            logger.warn(`Auto-sync falhou para @${username}, usando dados existentes se disponíveis`, { error: syncErr });
          }
        }
      } catch (dbErr: any) {
        dbUnavailableUntil = Date.now() + 60000; // Bloqueia tentativas por 60s para respostas ultra-rápidas
        logger.warn('PostgreSQL local não alcançável. Ativando circuit breaker e fallback em memória.', {
          error: dbErr?.message,
        });
      }
    }

    // Fallback gracioso para dados diretos do provedor (Mock ou External)
    if (!profile) {
      let provider = getThreadsProvider();
      if (username === 'demo') {
        const { MockThreadsProvider } = await import('@/providers/threads/mock/mockProvider');
        provider = new MockThreadsProvider();
      }

      const mockProfile = await provider.getProfile(username);
      const targetDeepLimit = Math.max(100, Math.min(env.MAX_HISTORICAL_POSTS, 500));
      const mockPostsResult = await provider.getPosts(username, { limit: targetDeepLimit });

      const postsMapped: RankedPost[] = mockPostsResult.data.map((post: any, idx: number) => {
        const pubTime = new Date(post.publishedAt).getTime();
        const hoursSincePub = Math.max(0.1, (Date.now() - pubTime) / 3600000);
        const growthPerHour = Math.round((post.metrics.likes / hoursSincePub) * 10) / 10;

        return {
          ...post,
          rank: idx + 1,
          growthPerHour,
          metricValue:
            metric === 'replies'
              ? post.metrics.replies
              : metric === 'reposts'
              ? post.metrics.reposts
              : metric === 'quotes'
              ? post.metrics.quotes
              : metric === 'recent'
              ? pubTime
              : metric === 'growth'
              ? growthPerHour
              : post.metrics.likes,
        };
      });

      // Ordena rigorosamente de acordo com a métrica selecionada
      if (metric === 'replies') {
        postsMapped.sort((a, b) => b.metrics.replies - a.metrics.replies || b.metrics.likes - a.metrics.likes);
      } else if (metric === 'reposts') {
        postsMapped.sort((a, b) => b.metrics.reposts - a.metrics.reposts || b.metrics.likes - a.metrics.likes);
      } else if (metric === 'quotes') {
        postsMapped.sort((a, b) => b.metrics.quotes - a.metrics.quotes || b.metrics.likes - a.metrics.likes);
      } else if (metric === 'recent') {
        postsMapped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      } else if (metric === 'growth') {
        postsMapped.sort((a, b) => (b.growthPerHour || 0) - (a.growthPerHour || 0) || b.metrics.likes - a.metrics.likes);
      } else {
        postsMapped.sort((a, b) => b.metrics.likes - a.metrics.likes || b.metrics.replies - a.metrics.replies);
      }

      // Reatribui ranks após ordenação
      postsMapped.forEach((p, index) => {
        p.rank = offset + index + 1;
      });

      const paged = postsMapped.slice(offset, offset + limit);

      const fallbackResult: ProfileRankingResult = {
        profile: {
          id: mockProfile.id,
          username: mockProfile.username,
          name: mockProfile.name,
          biography: mockProfile.biography,
          profilePictureUrl: mockProfile.profilePictureUrl,
          isVerified: mockProfile.isVerified,
          lastSyncedAt: new Date(),
          totalPostsIndexed: mockPostsResult.data.length,
        },
        metric,
        posts: paged,
        pagination: {
          total: mockPostsResult.data.length,
          limit,
          offset,
          hasMore: offset + limit < mockPostsResult.data.length,
        },
      };

      await CacheService.set(cacheKey, fallbackResult, 180);
      return fallbackResult;
    }

    if (!profile) {
      throw new ProfileNotFoundError(username);
    }

    totalPostsCount = await prisma.post.count({
      where: { profileId: profile.id },
    });

    let rankedPosts: RankedPost[] = [];

    // 3. Consulta e ordenação baseada na métrica escolhida
    if (metric === 'growth') {
      // Para growth: busca os posts recentes com seus últimos dois snapshots
      const postsWithSnapshots = await prisma.post.findMany({
        where: { profileId: profile.id },
        include: {
          snapshots: {
            orderBy: { capturedAt: 'desc' },
            take: 2,
          },
        },
        take: 100, // Amostra para ranking de crescimento
      });

      const calculated = postsWithSnapshots.map((post) => {
        let speed = 0;
        if (post.snapshots.length >= 2) {
          const growth = calculatePostGrowth(post.snapshots[0], post.snapshots[1]);
          speed = growth.likesPerHour;
        } else {
          const hoursSincePub = Math.max(0.1, (Date.now() - post.publishedAt.getTime()) / 3600000);
          speed = Math.round((post.likeCount / hoursSincePub) * 10) / 10;
        }

        return {
          id: post.id,
          threadsId: post.threadsId,
          profileId: post.profileId,
          text: post.text,
          permalink: post.permalink,
          mediaType: post.mediaType,
          mediaUrl: post.mediaUrl,
          publishedAt: post.publishedAt,
          metrics: {
            likes: post.likeCount,
            replies: post.replyCount,
            reposts: post.repostCount,
            quotes: post.quoteCount,
          },
          rank: 0,
          growthPerHour: speed,
          metricValue: speed,
        };
      });

      // Ordena decrescente por velocidade de likes/hora
      calculated.sort((a, b) => (b.growthPerHour ?? 0) - (a.growthPerHour ?? 0));
      rankedPosts = calculated.slice(offset, offset + limit).map((p, idx) => ({
        ...p,
        rank: offset + idx + 1,
      }));
    } else {
      // Ordenações padrão otimizadas por índices do PostgreSQL
      const orderByClause = (() => {
        switch (metric) {
          case 'replies':
            return { replyCount: 'desc' as const };
          case 'reposts':
            return { repostCount: 'desc' as const };
          case 'quotes':
            return { quoteCount: 'desc' as const };
          case 'recent':
            return { publishedAt: 'desc' as const };
          case 'likes':
          default:
            return { likeCount: 'desc' as const };
        }
      })();

      const posts = await prisma.post.findMany({
        where: { profileId: profile.id },
        orderBy: orderByClause,
        skip: offset,
        take: limit,
      });

      rankedPosts = posts.map((post, index) => {
        const metricValue = (() => {
          switch (metric) {
            case 'replies':
              return post.replyCount;
            case 'reposts':
              return post.repostCount;
            case 'quotes':
              return post.quoteCount;
            case 'recent':
              return post.publishedAt.getTime();
            case 'likes':
            default:
              return post.likeCount;
          }
        })();

        return {
          id: post.id,
          threadsId: post.threadsId,
          profileId: post.profileId,
          text: post.text,
          permalink: post.permalink,
          mediaType: post.mediaType,
          mediaUrl: post.mediaUrl,
          publishedAt: post.publishedAt,
          metrics: {
            likes: post.likeCount,
            replies: post.replyCount,
            reposts: post.repostCount,
            quotes: post.quoteCount,
          },
          rank: offset + index + 1,
          metricValue,
        };
      });
    }

    const result: ProfileRankingResult = {
      profile: {
        id: profile.id,
        username: profile.username,
        name: profile.name ?? undefined,
        biography: profile.biography ?? undefined,
        profilePictureUrl: profile.profilePictureUrl ?? undefined,
        isVerified: profile.isVerified,
        lastSyncedAt: profile.lastSyncedAt,
        totalPostsIndexed: totalPostsCount,
      },
      metric,
      posts: rankedPosts,
      pagination: {
        total: totalPostsCount,
        limit,
        offset,
        hasMore: offset + limit < totalPostsCount,
      },
    };

    // Salva em cache no Redis por 5 minutos (300 segundos)
    await CacheService.set(cacheKey, result, 300);

    return result;
  }
}
