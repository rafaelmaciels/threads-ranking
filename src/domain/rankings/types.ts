import { ThreadsPost } from '../posts/types';

export type RankingMetric =
  | 'likes'
  | 'replies'
  | 'reposts'
  | 'quotes'
  | 'recent'
  | 'growth';

export interface RankingOptions {
  metric: RankingMetric;
  limit?: number;
  offset?: number;
}

export interface RankedPost extends ThreadsPost {
  rank: number;
  growthPerHour?: number;
  metricValue: number;
}

export interface ProfileRankingResult {
  profile: {
    id: string;
    username: string;
    name?: string;
    biography?: string;
    profilePictureUrl?: string;
    isVerified?: boolean;
    lastSyncedAt?: Date | null;
    totalPostsIndexed: number;
  };
  metric: RankingMetric;
  posts: RankedPost[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
