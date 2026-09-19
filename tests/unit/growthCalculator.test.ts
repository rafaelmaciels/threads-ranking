import { describe, it, expect } from 'vitest';
import { calculatePostGrowth } from '@/services/growthCalculator';
import { PostMetricSnapshot } from '@/domain/posts/types';

describe('calculatePostGrowth', () => {
  it('deve calcular corretamente a velocidade de likes por hora entre dois snapshots', () => {
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    const previousSnapshot: PostMetricSnapshot = {
      postId: 'post_1',
      likeCount: 100000,
      replyCount: 1000,
      repostCount: 500,
      quoteCount: 100,
      capturedAt: sixHoursAgo,
    };

    const currentSnapshot: PostMetricSnapshot = {
      postId: 'post_1',
      likeCount: 130000,
      replyCount: 1500,
      repostCount: 800,
      quoteCount: 150,
      capturedAt: now,
    };

    const result = calculatePostGrowth(currentSnapshot, previousSnapshot);

    expect(result.postId).toBe('post_1');
    expect(result.previousLikes).toBe(100000);
    expect(result.currentLikes).toBe(130000);
    expect(result.absoluteGrowth).toBe(30000);
    expect(result.hoursElapsed).toBeCloseTo(6.0, 1);
    expect(result.likesPerHour).toBeCloseTo(5000.0, 1);
  });

  it('não deve gerar valores negativos caso likes diminuam ou haja ruído', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const prev: PostMetricSnapshot = {
      postId: 'post_2',
      likeCount: 500,
      replyCount: 10,
      repostCount: 5,
      quoteCount: 2,
      capturedAt: twoHoursAgo,
    };

    const curr: PostMetricSnapshot = {
      postId: 'post_2',
      likeCount: 450, // Decréscimo
      replyCount: 10,
      repostCount: 5,
      quoteCount: 2,
      capturedAt: now,
    };

    const result = calculatePostGrowth(curr, prev);

    expect(result.absoluteGrowth).toBe(0);
    expect(result.likesPerHour).toBe(0);
  });
});
