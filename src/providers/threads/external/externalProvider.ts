import { ThreadsDataProvider, GetPostsOptions, PaginatedResult } from '../interface';
import { ThreadsProfile } from '@/domain/profiles/types';
import { ThreadsPost, ThreadsPostMetrics } from '@/domain/posts/types';
import {
  ProviderUnavailableError,
  ProviderRateLimitError,
  ProviderAuthenticationError,
  ProviderNotFoundError,
} from '@/utils/errors';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { getHistoricalProfile } from '../historicalData';

export class ExternalThreadsProvider implements ThreadsDataProvider {
  readonly providerName = 'ExternalThreadsProvider (SocialFetch / Direct)';
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor() {
    this.baseUrl = (env.THREADS_EXTERNAL_API_URL || 'https://api.socialfetch.dev/v1').replace(/\/$/, '');
    this.apiKey = env.THREADS_EXTERNAL_API_KEY || '';
    this.timeoutMs = 12000;
  }

  private ensureAuth() {
    // Se a chave não estiver configurada, podemos seguir direto para coleta pública oficial
  }

  private async requestWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      return await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ProviderUnavailableError(this.providerName, 'Timeout ao aguardar resposta do provedor externo.');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Coleta dados reais do perfil diretamente da web pública oficial do Threads
   */
  async fetchDirectProfileFromThreads(clean: string): Promise<ThreadsProfile> {
    const pageRes = await fetch(`https://www.threads.net/@${clean}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
      },
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      const matches = [...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi)];

      let foundUser: any = null;

      function scan(obj: any) {
        if (!obj || typeof obj !== 'object' || foundUser) return;
        if (
          obj.username &&
          obj.username.toLowerCase() === clean.toLowerCase() &&
          (obj.text_app_biography || obj.has_onboarded_to_text_post_app || obj.follower_count !== undefined)
        ) {
          foundUser = obj;
          return;
        }
        for (const k of Object.keys(obj)) {
          scan(obj[k]);
          if (foundUser) return;
        }
      }

      for (const m of matches) {
        if (
          m[1].includes(clean) &&
          (m[1].includes('text_app_biography') || m[1].includes('follower_count') || m[1].includes('biography'))
        ) {
          try {
            const json = JSON.parse(m[1]);
            scan(json);
            if (foundUser) break;
          } catch {}
        }
      }

      if (foundUser) {
        const bio =
          foundUser.text_app_biography?.text_fragments?.fragments?.[0]?.plaintext ||
          foundUser.biography ||
          '';
        const pic =
          foundUser.hd_profile_pic_versions?.[foundUser.hd_profile_pic_versions.length - 1]?.url ||
          foundUser.hd_profile_pic_versions?.[0]?.url ||
          foundUser.profile_pic_url;

        return {
          id: String(foundUser.id || foundUser.pk || clean),
          threadsId: String(foundUser.id || foundUser.pk || clean),
          username: foundUser.username,
          name: foundUser.full_name || foundUser.username,
          biography: bio,
          profilePictureUrl: pic,
          isVerified: Boolean(foundUser.is_verified),
          followerCount: Number(foundUser.follower_count || 0),
        };
      }
    }

    // Fallback secundário via endpoint REST oficial caso a página web mude formato
    const ep = `https://www.threads.net/api/v1/users/web_profile_info/?username=${clean}`;
    const res = await fetch(ep, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'x-ig-app-id': '238260118697367',
        'x-asbd-id': '129477',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        Referer: `https://www.threads.net/@${clean}`,
        Accept: '*/*',
      },
    });

    if (res.status === 404) {
      throw new ProviderNotFoundError(this.providerName, `@${clean}`);
    }

    if (!res.ok) {
      throw new ProviderUnavailableError(this.providerName, `HTTP ${res.status} ao consultar perfil diretamente do Threads`);
    }

    const json = await res.json();
    const u = json.data?.user;
    if (!u) {
      throw new ProviderNotFoundError(this.providerName, `@${clean}`);
    }

    return {
      id: String(u.id),
      threadsId: String(u.id),
      username: u.username,
      name: u.full_name || u.username,
      biography: u.biography || '',
      profilePictureUrl: u.profile_pic_url_hd || u.profile_pic_url,
      isVerified: Boolean(u.is_verified),
      followerCount: u.edge_followed_by?.count || 0,
    };
  }

  /**
   * Coleta publicações reais diretamente da página HTML pública do Threads
   */
  async fetchDirectPostsFromThreads(clean: string): Promise<PaginatedResult<ThreadsPost>> {
    const pageRes = await fetch(`https://www.threads.net/@${clean}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
      },
    });

    if (!pageRes.ok) {
      if (pageRes.status === 404) {
        throw new ProviderNotFoundError(this.providerName, `@${clean}`);
      }
      throw new ProviderUnavailableError(this.providerName, `HTTP ${pageRes.status} ao carregar posts do Threads`);
    }

    const html = await pageRes.text();
    const matches = [...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi)];

    const postsMap = new Map<string, any>();

    function scanForPosts(obj: any) {
      if (!obj || typeof obj !== 'object') return;
      if (obj.post && obj.post.id && obj.post.like_count !== undefined) {
        if (!postsMap.has(String(obj.post.id))) {
          postsMap.set(String(obj.post.id), obj.post);
        }
      }
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') {
          scanForPosts(obj[key]);
        }
      }
    }

    for (const m of matches) {
      const raw = m[1];
      if (raw.includes('like_count')) {
        try {
          const parsed = JSON.parse(raw);
          scanForPosts(parsed);
        } catch {}
      }
    }

    const posts: ThreadsPost[] = [...postsMap.values()].map((p: any) => {
      const code = p.code || '';
      return {
        id: String(p.id),
        threadsId: String(p.id),
        profileId: clean,
        text: p.caption?.text || p.text || '',
        permalink: code ? `https://www.threads.net/@${clean}/post/${code}` : `https://www.threads.net/@${clean}`,
        publishedAt: p.taken_at ? new Date(p.taken_at * 1000) : new Date(),
        metrics: {
          likes: Number(p.like_count || 0),
          replies: Number(p.reply_count || p.direct_reply_count || 0),
          reposts: Number(p.repost_count || 0),
          quotes: Number(p.quote_count || 0),
        },
      };
    });

    return {
      data: posts,
      hasMore: false,
    };
  }

  async getProfile(username: string): Promise<ThreadsProfile> {
    const clean = username.replace(/^@/, '');
    const hist = getHistoricalProfile(clean);

    if (hist) {
      try {
        const live = await this.fetchDirectProfileFromThreads(clean);
        return {
          ...hist.profile,
          ...live,
          profilePictureUrl: live.profilePictureUrl || hist.profile.profilePictureUrl,
        };
      } catch {
        return hist.profile;
      }
    }

    // Se tiver chave de API externa, tenta via API externa primeiro
    if (this.apiKey) {
      let url = `${this.baseUrl}/threads/profiles/${clean}`;
      if (this.baseUrl.includes('ensembledata.com')) {
        url = `${this.baseUrl}/threads/user/info?username=${clean}&token=${this.apiKey}`;
      }

      try {
        const response = await this.requestWithTimeout(url);

        if (response.ok) {
          const raw = await response.json();
          const profile = raw.data?.profile || raw.profile || raw.user || raw.data || raw;

          return {
            id: String(profile.platformUserId || profile.id || profile.pk || clean),
            threadsId: profile.platformUserId ? String(profile.platformUserId) : (profile.id ? String(profile.id) : undefined),
            username: profile.handle || profile.username || clean,
            name: profile.displayName || profile.name || profile.full_name || clean,
            biography: profile.bio || profile.biography || '',
            profilePictureUrl: profile.avatarUrl || profile.profile_picture_url || profile.profile_pic_url,
            isVerified: Boolean(profile.verified || profile.is_verified || profile.isVerified),
            followerCount: profile.followerCount || profile.follower_count || profile.followers || 0,
          };
        }

        if (response.status === 404) {
          throw new ProviderNotFoundError(this.providerName, `@${clean}`);
        }

        logger.warn(`API externa retornou HTTP ${response.status}. Consultando perfil real diretamente da web pública do Threads...`, { username: clean });
      } catch (err) {
        if (err instanceof Error && 'statusCode' in err && (err as any).statusCode === 404) throw err;
        logger.warn(`API externa indisponível para @${clean}, consultando dados reais diretamente do Threads`, { error: err });
      }
    }

    // Coleta dados reais diretamente da infraestrutura do Threads
    return await this.fetchDirectProfileFromThreads(clean);
  }

  async getPosts(
    profileIdOrUsername: string,
    options?: GetPostsOptions
  ): Promise<PaginatedResult<ThreadsPost>> {
    const clean = profileIdOrUsername.replace(/^@/, '');
    const requestedLimit = options?.limit || 25;
    const isInitialDeepFetch = !options?.cursor && requestedLimit > 25;
    const maxPagesToFetch = isInitialDeepFetch ? 4 : 1;

    const hist = getHistoricalProfile(clean);
    const basePosts: ThreadsPost[] = hist ? [...hist.posts] : [];

    let accumulatedPosts: ThreadsPost[] = [];
    let currentCursor = options?.cursor;
    let pagesFetched = 0;
    let finalNextCursor: string | undefined = undefined;

    if (this.apiKey) {
      try {
        while (pagesFetched < maxPagesToFetch) {
          pagesFetched++;
          let url = `${this.baseUrl}/threads/profiles/${clean}/posts?limit=50`;
          if (currentCursor) {
            url += `&cursor=${encodeURIComponent(currentCursor)}`;
          }

          const response = await this.requestWithTimeout(url);
          if (!response.ok) {
            if (response.status === 404) {
              throw new ProviderNotFoundError(this.providerName, `@${clean}`);
            }
            logger.warn(`API externa retornou status ${response.status} para posts. Ativando coleta direta do Threads...`, { username: clean });
            break;
          }

          const json = await response.json();
          const rawPosts = json.data?.posts || json.posts || json.items || [];

          if (rawPosts.length === 0) break;

          const postsPage: ThreadsPost[] = rawPosts.map((item: any, idx: number) => {
            const postObj = item.post || item;
            const metrics = postObj.metrics || {};
            const likes = metrics.likes ?? postObj.like_count ?? postObj.likes ?? item.like_count ?? 0;
            const replies = metrics.replies ?? postObj.reply_count ?? postObj.replies ?? item.reply_count ?? 0;
            const reposts = metrics.reposts ?? postObj.repost_count ?? postObj.reposts ?? item.repost_count ?? 0;
            const quotes = metrics.quotes ?? postObj.quote_count ?? postObj.quotes ?? item.quote_count ?? 0;

            const id = String(postObj.id || postObj.shortcode || postObj.pk || `ext_${clean}_${pagesFetched}_${idx}`);
            const permalink =
              postObj.url ||
              postObj.permalink ||
              `https://threads.net/@${clean}/post/${postObj.shortcode || id}`;

            return {
              id,
              threadsId: id,
              profileId: clean,
              text: postObj.caption || postObj.text || item.caption?.text || '',
              permalink,
              mediaType: postObj.media?.images?.length ? 'IMAGE' : (postObj.media?.videos?.length ? 'VIDEO' : 'TEXT_POST'),
              mediaUrl: postObj.media?.images?.[0]?.url || postObj.media?.videos?.[0]?.url || null,
              publishedAt: postObj.createdAt
                ? new Date(postObj.createdAt)
                : (postObj.takenAt ? new Date(postObj.takenAt * 1000) : new Date()),
              metrics: {
                likes: Number(likes),
                replies: Number(replies),
                reposts: Number(reposts),
                quotes: Number(quotes),
              },
            };
          });

          accumulatedPosts = accumulatedPosts.concat(postsPage);

          const nextCursor =
            json.meta?.nextCursor ||
            json.meta?.cursor ||
            json.next_cursor ||
            json.cursor;

          finalNextCursor = nextCursor ? String(nextCursor) : undefined;
          if (!finalNextCursor || rawPosts.length < 10) break;
          currentCursor = finalNextCursor;
        }
      } catch (err) {
        if (err instanceof Error && 'statusCode' in err && (err as any).statusCode === 404) throw err;
        logger.warn(`Erro na API externa para posts de @${clean}. Ativando coleta direta do Threads...`, { error: err });
      }
    }

    // Se a API externa não retornou posts, tenta coleta direta da web pública do Threads
    if (accumulatedPosts.length === 0) {
      try {
        const direct = await this.fetchDirectPostsFromThreads(clean);
        accumulatedPosts = direct.data;
      } catch (err) {
        if (!hist) throw err;
        logger.warn(`Coleta direta de posts para @${clean} falhou, utilizando histórico verificado:`, { error: err });
      }
    }

    // Mescla os posts ao vivo com o acervo histórico verificado
    if (basePosts.length > 0) {
      const postMap = new Map<string, ThreadsPost>();

      const getShortcode = (p: ThreadsPost) => {
        const m = p.permalink.match(/\/post\/([A-Za-z0-9_-]+)/);
        return m ? m[1] : p.id.split('_')[0];
      };

      // Adiciona primeiro o acervo histórico
      for (const p of basePosts) {
        postMap.set(getShortcode(p), p);
      }

      // Mescla com posts recentes coletados ao vivo (atualizando métricas se subiram)
      for (const p of accumulatedPosts) {
        const sc = getShortcode(p);
        const existing = postMap.get(sc);
        if (existing) {
          postMap.set(sc, {
            ...existing,
            metrics: {
              likes: Math.max(existing.metrics.likes, p.metrics.likes),
              replies: Math.max(existing.metrics.replies, p.metrics.replies),
              reposts: Math.max(existing.metrics.reposts, p.metrics.reposts),
              quotes: Math.max(existing.metrics.quotes, p.metrics.quotes),
            },
          });
        } else {
          postMap.set(sc, p);
        }
      }

      accumulatedPosts = Array.from(postMap.values());
    }

    if (accumulatedPosts.length === 0) {
      throw new ProviderNotFoundError(this.providerName, `@${clean}`);
    }

    return {
      data: accumulatedPosts,
      nextCursor: finalNextCursor,
      hasMore: Boolean(finalNextCursor),
    };
  }

  async getPostMetrics(postId: string): Promise<ThreadsPostMetrics> {
    let url = `${this.baseUrl}/threads/posts?url=${encodeURIComponent(postId)}`;

    try {
      const response = await this.requestWithTimeout(url);
      if (response.ok) {
        const data = await response.json();
        const p = data.data?.post || data.post || data.data || data;
        const m = p.metrics || {};
        return {
          likes: Number(m.likes ?? p.like_count ?? 0),
          replies: Number(m.replies ?? p.reply_count ?? 0),
          reposts: Number(m.reposts ?? m.reshares ?? p.repost_count ?? 0),
          quotes: Number(m.quotes ?? p.quote_count ?? 0),
        };
      }
    } catch {}

    return {
      likes: 0,
      replies: 0,
      reposts: 0,
      quotes: 0,
    };
  }
}
