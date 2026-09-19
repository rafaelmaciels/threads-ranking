import { NextRequest, NextResponse } from 'next/server';
import { RankingService } from '@/services/rankingService';
import { RankingMetric } from '@/domain/rankings/types';
import { CacheService } from '@/cache/cacheService';
import { AppError } from '@/utils/errors';
import { env } from '@/config/env';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateCheck = await CacheService.checkRateLimit(`ranking_api:${ip}`, env.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Limite de requisições excedido.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetInSeconds) } }
      );
    }

    const metric = (searchParams.get('metric') || 'likes') as RankingMetric;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const ranking = await RankingService.getProfileRanking(username, metric, {
      limit,
      offset,
      autoSyncIfStale: true,
    });

    return NextResponse.json(ranking);
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    return NextResponse.json(
      { error: 'Falha ao processar ranking de posts.' },
      { status: 500 }
    );
  }
}
