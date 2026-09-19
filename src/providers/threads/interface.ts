import { ThreadsProfile } from '@/domain/profiles/types';
import { ThreadsPost, ThreadsPostMetrics } from '@/domain/posts/types';

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface GetPostsOptions {
  cursor?: string;
  limit?: number;
  since?: Date;
}

export interface ThreadsDataProvider {
  readonly providerName: string;

  /**
   * Obtém os metadados do perfil através do username
   */
  getProfile(username: string): Promise<ThreadsProfile>;

  /**
   * Obtém a lista paginada de posts do perfil
   */
  getPosts(
    profileIdOrUsername: string,
    options?: GetPostsOptions
  ): Promise<PaginatedResult<ThreadsPost>>;

  /**
   * Obtém métricas atualizadas de um post específico
   */
  getPostMetrics(postId: string): Promise<ThreadsPostMetrics>;
}
