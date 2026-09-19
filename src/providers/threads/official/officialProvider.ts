import {
  ThreadsDataProvider,
  PaginatedResult,
  GetPostsOptions,
} from '../interface';
import { ThreadsProfile } from '@/domain/profiles/types';
import { ThreadsPost, ThreadsPostMetrics } from '@/domain/posts/types';
import {
  ProviderAuthenticationError,
  ProviderRateLimitError,
  UnsupportedCapabilityError,
  ProviderUnavailableError,
} from '@/utils/errors';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export class OfficialThreadsProvider implements ThreadsDataProvider {
  public readonly providerName = 'OfficialThreadsProvider';
  private readonly baseUrl = 'https://graph.threads.net/v1.0';

  private getAccessToken(): string {
    const token = env.THREADS_ACCESS_TOKEN;
    if (!token) {
      throw new ProviderAuthenticationError(
        this.providerName,
        'THREADS_ACCESS_TOKEN não configurado. Para usar a API Oficial, configure as credenciais OAuth no arquivo .env.'
      );
    }
    return token;
  }

  async getProfile(username: string): Promise<ThreadsProfile> {
    const token = this.getAccessToken();
    const cleanUsername = username.replace(/^@/, '');

    // Verifica se a busca é para o usuário autenticado ou para terceiro
    // Na API oficial da Meta, a busca direta por username sem ID é suportada via profile_lookup (requer threads_profile_discovery)
    const url = `${this.baseUrl}/profile_lookup?username=${cleanUsername}&access_token=${token}`;

    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new ProviderRateLimitError(this.providerName);
        }
        if (data.error?.code === 190) {
          throw new ProviderAuthenticationError(this.providerName, 'Access token inválido ou expirado.');
        }
        throw new Error(data.error?.message || 'Erro ao consultar perfil na API oficial');
      }

      return {
        id: data.id,
        threadsId: data.id,
        username: data.username,
        name: data.name,
        biography: data.biography,
        profilePictureUrl: data.profile_picture_url,
        isVerified: data.is_verified ?? false,
      };
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === 'ProviderAuthenticationError' || err.name === 'ProviderRateLimitError')) {
        throw err;
      }
      logger.error('Erro na API Oficial Threads ao buscar perfil', { error: err, username: cleanUsername });
      throw new ProviderUnavailableError(this.providerName, 'Falha ao comunicar com a Graph API do Threads.');
    }
  }

  async getPosts(
    profileIdOrUsername: string,
    options?: GetPostsOptions
  ): Promise<PaginatedResult<ThreadsPost>> {
    const token = this.getAccessToken();
    const cleanUsername = profileIdOrUsername.replace(/^@/, '');

    const fields = 'id,media_product_type,media_type,permalink,owner,username,text,timestamp,shortcode,is_quote_post';
    const targetLimit = options?.limit ?? 50;
    // Meta Graph API suporta no máximo limit=100 por requisição
    const perRequestLimit = Math.min(100, targetLimit);

    let accumulatedPosts: ThreadsPost[] = [];
    let currentCursor = options?.cursor;
    let hasMore = true;
    let finalNextCursor: string | undefined = undefined;

    // Se o chamador especificou um cursor explicitamente, fazemos exatamente 1 página
    // Se não passou cursor e solicitou um limit grande (> 100), paginamos até atingir o volume
    const maxIterations = options?.cursor ? 1 : Math.ceil(targetLimit / perRequestLimit);
    let iterations = 0;

    try {
      while (hasMore && iterations < maxIterations) {
        iterations++;
        let url = `${this.baseUrl}/profile_posts?username=${cleanUsername}&fields=${fields}&access_token=${token}&limit=${perRequestLimit}`;

        if (currentCursor) {
          url += `&after=${currentCursor}`;
        }
        if (options?.since) {
          url += `&since=${Math.floor(options.since.getTime() / 1000)}`;
        }
        if (options?.until) {
          url += `&until=${Math.floor(options.until.getTime() / 1000)}`;
        }

        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        const json = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            throw new ProviderRateLimitError(this.providerName);
          }
          throw new Error(json.error?.message || 'Falha ao buscar posts na API oficial');
        }

        const rawPosts: any[] = json.data || [];
        const posts: ThreadsPost[] = rawPosts.map((item) => ({
          id: item.id,
          threadsId: item.id,
          profileId: item.owner?.id || cleanUsername,
          text: item.text || '',
          permalink: item.permalink || `https://threads.net/@${cleanUsername}/post/${item.id}`,
          mediaType: item.media_type || 'TEXT_POST',
          publishedAt: new Date(item.timestamp),
          metrics: {
            // AVISO IMPORTANTE: A API oficial do Threads NÃO retorna likes de terceiros via profile_posts
            likes: 0,
            replies: 0,
            reposts: 0,
            quotes: 0,
          },
        }));

        accumulatedPosts = accumulatedPosts.concat(posts);
        finalNextCursor = json.paging?.cursors?.after;
        hasMore = Boolean(json.paging?.next) && Boolean(finalNextCursor) && rawPosts.length > 0;
        currentCursor = finalNextCursor;

        if (accumulatedPosts.length >= targetLimit) {
          break;
        }

        if (hasMore && iterations < maxIterations) {
          await new Promise((r) => setTimeout(r, env.REQUEST_DELAY_MS));
        }
      }

      return {
        data: accumulatedPosts,
        nextCursor: finalNextCursor,
        hasMore,
      };
    } catch (err) {
      logger.error('Erro na API Oficial Threads ao buscar posts', { error: err });
      throw err;
    }
  }

  async getPostMetrics(postId: string): Promise<ThreadsPostMetrics> {
    const token = this.getAccessToken();
    const url = `${this.baseUrl}/${postId}/insights?metric=likes,replies,reposts,quotes&access_token=${token}`;

    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      const json = await response.json();

      if (!response.ok) {
        // Se a Meta retornar erro de permissão ou indicar que é de terceiro:
        if (json.error?.message?.includes('app-scoped user') || json.error?.code === 100) {
          throw new UnsupportedCapabilityError(
            this.providerName,
            'Métricas de likes de terceiros',
            'A API oficial da Meta só permite consultar insights/likes para mídias criadas pela própria conta autenticada. Para perfis públicos de terceiros, utilize THREADS_PROVIDER=external ou THREADS_PROVIDER=mock.'
          );
        }
        throw new Error(json.error?.message || 'Erro ao consultar insights na API oficial');
      }

      const metricsMap: Record<string, number> = {};
      for (const item of json.data || []) {
        metricsMap[item.name] = item.values?.[0]?.value || 0;
      }

      return {
        likes: metricsMap['likes'] || 0,
        replies: metricsMap['replies'] || 0,
        reposts: metricsMap['reposts'] || 0,
        quotes: metricsMap['quotes'] || 0,
      };
    } catch (err) {
      if (err instanceof UnsupportedCapabilityError) {
        throw err;
      }
      logger.error('Erro ao consultar insights do post na API oficial', { postId, error: err });
      throw err;
    }
  }
}
