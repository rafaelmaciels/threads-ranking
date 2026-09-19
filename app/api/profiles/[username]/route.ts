import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/database/prisma';
import { UsernameSchema } from '@/domain/profiles/types';
import { CacheService } from '@/cache/cacheService';
import { AppError } from '@/utils/errors';
import { env } from '@/config/env';

let dbUnavailableUntil = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await params;
    const username = UsernameSchema.parse(rawUsername);

    // Rate limiting por IP/identificador
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateCheck = await CacheService.checkRateLimit(`api:${ip}`, env.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Limite de requisições excedido. Tente novamente mais tarde.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetInSeconds) } }
      );
    }

    let profile: any = null;
    if (Date.now() >= dbUnavailableUntil) {
      try {
        profile = await prisma.profile.findUnique({
          where: { username },
          include: {
            _count: {
              select: { posts: true },
            },
          },
        });
      } catch {
        dbUnavailableUntil = Date.now() + 60000;
      }
    }

    if (!profile) {
      // Tenta resolver via provider
      const { getThreadsProvider } = await import('@/providers/threads');
      const provider = getThreadsProvider();
      const mockProfile = await provider.getProfile(username);
      const mockPosts = await provider.getPosts(username);

      return NextResponse.json({
        id: mockProfile.id,
        threadsId: mockProfile.threadsId,
        username: mockProfile.username,
        name: mockProfile.name,
        biography: mockProfile.biography,
        profilePictureUrl: mockProfile.profilePictureUrl,
        isVerified: mockProfile.isVerified,
        totalPostsIndexed: mockPosts.data.length,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      id: profile.id,
      threadsId: profile.threadsId,
      username: profile.username,
      name: profile.name,
      biography: profile.biography,
      profilePictureUrl: profile.profilePictureUrl,
      isVerified: profile.isVerified,
      totalPostsIndexed: profile._count.posts,
      lastSyncedAt: profile.lastSyncedAt,
      createdAt: profile.createdAt,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    return NextResponse.json(
      { error: 'Erro interno ao consultar perfil.' },
      { status: 500 }
    );
  }
}
