import { describe, it, expect } from 'vitest';
import { ThreadsPost } from '@/domain/posts/types';

describe('Ranking Sorting Logic', () => {
  const samplePosts: ThreadsPost[] = [
    {
      id: 'post_a',
      threadsId: 'ta',
      profileId: 'p1',
      text: 'Post A',
      permalink: 'https://threads.net/a',
      publishedAt: new Date('2026-01-01'),
      metrics: { likes: 10000, replies: 500, reposts: 300, quotes: 50 },
    },
    {
      id: 'post_b',
      threadsId: 'tb',
      profileId: 'p1',
      text: 'Post B',
      permalink: 'https://threads.net/b',
      publishedAt: new Date('2026-01-02'),
      metrics: { likes: 50000, replies: 1200, reposts: 100, quotes: 20 },
    },
    {
      id: 'post_c',
      threadsId: 'tc',
      profileId: 'p1',
      text: 'Post C',
      permalink: 'https://threads.net/c',
      publishedAt: new Date('2026-01-03'),
      metrics: { likes: 25000, replies: 2500, reposts: 800, quotes: 90 },
    },
  ];

  it('deve ordenar decrescente por likes (Post B -> Post C -> Post A)', () => {
    const sorted = [...samplePosts].sort((a, b) => b.metrics.likes - a.metrics.likes);
    expect(sorted.map((p) => p.id)).toEqual(['post_b', 'post_c', 'post_a']);
  });

  it('deve ordenar decrescente por replies (Post C -> Post B -> Post A)', () => {
    const sorted = [...samplePosts].sort((a, b) => b.metrics.replies - a.metrics.replies);
    expect(sorted.map((p) => p.id)).toEqual(['post_c', 'post_b', 'post_a']);
  });

  it('deve ordenar decrescente por reposts (Post C -> Post A -> Post B)', () => {
    const sorted = [...samplePosts].sort((a, b) => b.metrics.reposts - a.metrics.reposts);
    expect(sorted.map((p) => p.id)).toEqual(['post_c', 'post_a', 'post_b']);
  });

  it('deve ordenar decrescente por quotes (Post C -> Post A -> Post B)', () => {
    const sorted = [...samplePosts].sort((a, b) => b.metrics.quotes - a.metrics.quotes);
    expect(sorted.map((p) => p.id)).toEqual(['post_c', 'post_a', 'post_b']);
  });

  it('deve ordenar decrescente por data recente (Post C -> Post B -> Post A)', () => {
    const sorted = [...samplePosts].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    expect(sorted.map((p) => p.id)).toEqual(['post_c', 'post_b', 'post_a']);
  });
});
