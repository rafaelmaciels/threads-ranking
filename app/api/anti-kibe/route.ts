import { NextRequest, NextResponse } from 'next/server';
import { AntiKibeService } from '@/services/antiKibeService';
import { AntiKibeComparisonInput } from '@/domain/antiKibe/types';
import { getHistoricalProfile } from '@/providers/threads/historicalData';

/**
 * Tenta resolver um texto de post a partir de permalink ou texto livre
 */
function resolvePostData(input: any) {
  if (typeof input === 'string') {
    return { text: input, author: 'autor', publishedAt: new Date() };
  }

  let text = input.text || '';
  let author = input.author || 'autor';
  let publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
  const permalink = input.permalink || '';

  // Se o texto estiver vazio mas foi informado um permalink do Threads, tenta buscar no histórico
  if (!text && permalink) {
    const userMatch = permalink.match(/@([A-Za-z0-9_.-]+)/);
    const codeMatch = permalink.match(/\/post\/([A-Za-z0-9_-]+)/);

    if (userMatch) {
      const username = userMatch[1].toLowerCase();
      author = username;
      const hist = getHistoricalProfile(username);
      if (hist) {
        const found = hist.posts.find((p) =>
          codeMatch ? p.permalink.includes(codeMatch[1]) : false
        );
        if (found) {
          text = found.text;
          publishedAt = found.publishedAt;
        }
      }
    }
  }

  return {
    text,
    author,
    publishedAt,
    permalink,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || (!body.postA && !body.textA)) {
      return NextResponse.json(
        {
          error:
            'Parâmetros inválidos. Forneça { postA, postB } ou { textA, textB } no corpo da requisição.',
        },
        { status: 400 }
      );
    }

    const postA = resolvePostData(body.postA || {
      text: body.textA,
      author: body.authorA,
      publishedAt: body.dateA,
      permalink: body.urlA,
    });

    const postB = resolvePostData(body.postB || {
      text: body.textB,
      author: body.authorB,
      publishedAt: body.dateB,
      permalink: body.urlB,
    });

    if (!postA.text || !postB.text) {
      return NextResponse.json(
        {
          error:
            'O texto de ambas as postagens é obrigatório para realizar a análise Anti Kibe.',
        },
        { status: 400 }
      );
    }

    const comparison: AntiKibeComparisonInput = {
      postA,
      postB,
    };

    const result = AntiKibeService.compare(comparison);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar análise Anti Kibe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Anti Kibe API — Detector de Plágio no Threads',
    description:
      'Compare duas publicações de perfis diferentes para identificar indícios de cópia e plágio.',
    usage: {
      method: 'POST',
      body: {
        postA: {
          author: 'rafaelost',
          text: 'PASSOU DA MEIA-NOITE. É PULSO ÚNICO ATÉ DOMINGO...',
          publishedAt: '2026-09-19T03:14:26.000Z',
        },
        postB: {
          author: 'outro_usuario',
          text: 'Passou da meia noite! É pulso único até domingo...',
          publishedAt: '2026-09-20T12:00:00.000Z',
        },
      },
    },
  });
}
