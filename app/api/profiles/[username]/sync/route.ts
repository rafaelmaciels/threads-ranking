import { NextRequest, NextResponse } from 'next/server';
import { ProfileSyncService } from '@/services/profileSyncService';
import { CacheService } from '@/cache/cacheService';
import { AppError } from '@/utils/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Rate limiting para sincronização: máximo de 5 sincronizações por minuto por IP
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateCheck = await CacheService.checkRateLimit(`sync_api:${ip}`, 5, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Muitas solicitações de sincronização. Aguarde alguns instantes.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetInSeconds) } }
      );
    }

    const result = await ProfileSyncService.syncProfile(username, {
      maxPages: 5,
      pageSize: 25,
    });

    return NextResponse.json({
      success: true,
      message: `Perfil @${username} sincronizado com sucesso!`,
      data: result,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    return NextResponse.json(
      { error: 'Falha ao sincronizar dados do perfil.' },
      { status: 500 }
    );
  }
}
