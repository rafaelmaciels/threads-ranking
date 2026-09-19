export interface ThreadsPostMetrics {
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  views?: number;
}

export interface ThreadsPost {
  id: string;
  threadsId: string;
  profileId: string;
  text?: string | null;
  permalink: string;
  mediaType?: string | null;
  mediaUrl?: string | null;
  publishedAt: Date;
  metrics: ThreadsPostMetrics;
  createdAt?: Date;
  updatedAt?: Date;
  lastSyncedAt?: Date | null;
}

export interface PostMetricSnapshot {
  id?: string;
  postId: string;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  quoteCount: number;
  capturedAt: Date;
}

export interface PostGrowthCalculation {
  postId: string;
  currentLikes: number;
  previousLikes: number;
  absoluteGrowth: number;
  hoursElapsed: number;
  likesPerHour: number;
}
