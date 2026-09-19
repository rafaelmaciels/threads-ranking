import { prisma } from '@/database/prisma';
import { getThreadsProvider } from '@/providers/threads';
import { CacheService } from '@/cache/cacheService';
import { logger } from '@/utils/logger';
import { UsernameSchema } from '@/domain/profiles/types';
import { SyncJobStatus } from '@prisma/client';
import { env } from '@/config/env';

export interface SyncOptions {
  maxPages?: number;
  pageSize?: number;
  forceFresh?: boolean;
  fetchAllAvailable?: boolean;
  since?: Date;
  until?: Date;
}

export class ProfileSyncService {
  /**
   * Sincroniza incrementalmente um perfil e suas postagens, permitindo busca profunda no histórico
   */
  static async syncProfile(rawUsername: string, options: SyncOptions = {}) {
    const username = UsernameSchema.parse(rawUsername);
    const maxPages = options.fetchAllAvailable
      ? env.SYNC_MAX_PAGES * 2
      : (options.maxPages ?? env.SYNC_MAX_PAGES);
    const pageSize = options.pageSize ?? env.SYNC_PAGE_SIZE;

    const startTime = Date.now();
    logger.info(`Iniciando sincronização do perfil @${username}`, { username });

    const provider = getThreadsProvider();

    // 1. Resolve os metadados do perfil via provider
    const externalProfile = await provider.getProfile(username);

    // 2. Upsert do perfil no banco de dados relacional
    const profile = await prisma.profile.upsert({
      where: { username },
      update: {
        threadsId: externalProfile.threadsId,
        name: externalProfile.name,
        biography: externalProfile.biography,
        profilePictureUrl: externalProfile.profilePictureUrl,
        isVerified: externalProfile.isVerified ?? false,
        updatedAt: new Date(),
      },
      create: {
        threadsId: externalProfile.threadsId,
        username,
        name: externalProfile.name,
        biography: externalProfile.biography,
        profilePictureUrl: externalProfile.profilePictureUrl,
        isVerified: externalProfile.isVerified ?? false,
      },
    });

    // 3. Registra início do job de sync
    const job = await prisma.syncJob.create({
      data: {
        profileId: profile.id,
        status: SyncJobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    let totalSyncedPosts = 0;
    let currentCursor: string | undefined = undefined;
    let pageCount = 0;
    const seenCursors = new Set<string>();

    try {
      // 4. Loop de paginação segura com proteções contra loops e travamentos
      let hasMore = true;
      while (hasMore && pageCount < maxPages) {
        if (currentCursor && seenCursors.has(currentCursor)) {
          logger.warn(`Cursor repetido detectado (${currentCursor}). Interrompendo paginação segura.`, { username });
          break;
        }
        if (currentCursor) {
          seenCursors.add(currentCursor);
        }

        pageCount++;
        const pageResult = await provider.getPosts(username, {
          cursor: currentCursor,
          limit: pageSize,
          since: options.since,
          until: options.until,
        });

        if (!pageResult.data || pageResult.data.length === 0) {
          break;
        }

        // Processa posts da página em lote com transações
        for (const post of pageResult.data) {
          const upsertedPost = await prisma.post.upsert({
            where: { threadsId: post.threadsId },
            update: {
              text: post.text,
              permalink: post.permalink,
              mediaType: post.mediaType,
              mediaUrl: post.mediaUrl,
              likeCount: post.metrics.likes,
              replyCount: post.metrics.replies,
              repostCount: post.metrics.reposts,
              quoteCount: post.metrics.quotes,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            },
            create: {
              threadsId: post.threadsId,
              profileId: profile.id,
              text: post.text,
              permalink: post.permalink,
              mediaType: post.mediaType,
              mediaUrl: post.mediaUrl,
              publishedAt: post.publishedAt,
              likeCount: post.metrics.likes,
              replyCount: post.metrics.replies,
              repostCount: post.metrics.reposts,
              quoteCount: post.metrics.quotes,
              lastSyncedAt: new Date(),
            },
          });

          // Registra snapshot de métricas (com debounce de 30 minutos para evitar snapshots redundantes)
          const lastSnapshot = await prisma.postMetricSnapshot.findFirst({
            where: { postId: upsertedPost.id },
            orderBy: { capturedAt: 'desc' },
          });

          const shouldCreateSnapshot =
            !lastSnapshot ||
            Date.now() - lastSnapshot.capturedAt.getTime() > 30 * 60 * 1000 ||
            lastSnapshot.likeCount !== post.metrics.likes;

          if (shouldCreateSnapshot) {
            await prisma.postMetricSnapshot.create({
              data: {
                postId: upsertedPost.id,
                likeCount: post.metrics.likes,
                replyCount: post.metrics.replies,
                repostCount: post.metrics.reposts,
                quoteCount: post.metrics.quotes,
              },
            });
          }

          totalSyncedPosts++;
        }

        hasMore = pageResult.hasMore && Boolean(pageResult.nextCursor);
        currentCursor = pageResult.nextCursor;

        if (totalSyncedPosts >= env.MAX_HISTORICAL_POSTS) {
          logger.info(`Limite máximo global de posts históricos (${env.MAX_HISTORICAL_POSTS}) atingido para @${username}`);
          break;
        }

        if (hasMore && pageCount < maxPages) {
          await new Promise((r) => setTimeout(r, env.REQUEST_DELAY_MS));
        }
      }

      // 5. Atualiza data do perfil e finaliza o job
      await prisma.profile.update({
        where: { id: profile.id },
        data: { lastSyncedAt: new Date() },
      });

      await prisma.syncJob.update({
        where: { id: job.id },
        data: {
          status: SyncJobStatus.COMPLETED,
          finishedAt: new Date(),
        },
      });

      // 6. Invalida caches pertinentes no Redis para todos os filtros do perfil
      await CacheService.delByPattern(`ranking:${username}:*`);
      await CacheService.del(`profile:${username}`);

      const durationMs = Date.now() - startTime;
      logger.info(`Sincronização concluída com sucesso para @${username}`, {
        username,
        durationMs,
        postCount: totalSyncedPosts,
      });

      return {
        profileId: profile.id,
        username,
        totalSyncedPosts,
        durationMs,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido durante sync';
      logger.error(`Falha ao sincronizar @${username}`, { username, error: err });

      await prisma.syncJob.update({
        where: { id: job.id },
        data: {
          status: SyncJobStatus.FAILED,
          finishedAt: new Date(),
          error: errorMessage,
        },
      });

      throw err;
    }
  }
}
