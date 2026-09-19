import { ThreadsProfile } from '@/domain/profiles/types';
import { ThreadsPost } from '@/domain/posts/types';
import historicalJson from './historicalData.json';

interface HistoricalProfileBundle {
  profile: ThreadsProfile;
  posts: ThreadsPost[];
}

// Repositório de dados históricos reais verificados
export const HISTORICAL_PROFILES: Record<string, HistoricalProfileBundle> = {};

for (const [key, value] of Object.entries(historicalJson as Record<string, any>)) {
  const p = value.profile;
  const posts: ThreadsPost[] = (value.posts || []).map((post: any) => ({
    id: String(post.id),
    threadsId: String(post.threadsId || post.id),
    profileId: String(post.profileId || p.username),
    text: String(post.text || ''),
    permalink: String(post.permalink || `https://www.threads.net/@${p.username}`),
    mediaType: post.mediaType || 'TEXT_POST',
    mediaUrl: post.mediaUrl || null,
    publishedAt: new Date(post.publishedAt),
    metrics: {
      likes: Number(post.metrics?.likes || 0),
      replies: Number(post.metrics?.replies || 0),
      reposts: Number(post.metrics?.reposts || 0),
      quotes: Number(post.metrics?.quotes || 0),
    },
  }));

  HISTORICAL_PROFILES[key.toLowerCase()] = {
    profile: {
      id: String(p.id),
      threadsId: String(p.threadsId || p.id),
      username: String(p.username),
      name: String(p.name || p.username),
      biography: String(p.biography || ''),
      profilePictureUrl: p.profilePictureUrl || null,
      isVerified: Boolean(p.isVerified),
      followerCount: Number(p.followerCount || 0),
    },
    posts,
  };
}

export function getHistoricalProfile(username: string): HistoricalProfileBundle | null {
  const clean = username.toLowerCase().replace(/^@/, '');
  return HISTORICAL_PROFILES[clean] || null;
}
