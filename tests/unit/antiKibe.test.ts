import { describe, it, expect } from 'vitest';
import { AntiKibeService } from '@/services/antiKibeService';

describe('AntiKibeService — Detector de Plágio do Threads', () => {
  const originalPost = {
    author: 'rafaelost',
    text: 'PASSOU DA MEIA-NOITE.\n\nÉ PULSO ÚNICO ATÉ DOMINGO. \n\nEscolhe seu discador, fecha a porta, torce pra ninguém usar o telefone.\nConecta no mIRC e baixar aquela musica no canal #mp3\n\nSe você sabe exatamente que som que isso fazia, você já está velho.',
    publishedAt: new Date('2026-09-19T03:14:26.000Z'),
    permalink: 'https://www.threads.com/@rafaelost/post/DddBTBxgC5o',
  };

  it('deve detectar cópia literal idêntica como CONFIRMED_KIBE com score 100', () => {
    const kibedPost = {
      author: 'kibador_oficial',
      text: originalPost.text,
      publishedAt: new Date('2026-09-19T14:30:00.000Z'), // 11 horas depois
      permalink: 'https://www.threads.com/@kibador_oficial/post/Xyz123',
    };

    const result = AntiKibeService.compare({
      postA: originalPost,
      postB: kibedPost,
    });

    expect(result.kibeScore).toBe(100);
    expect(result.verdict).toBe('CONFIRMED_KIBE');
    expect(result.original.author).toBe('rafaelost');
    expect(result.suspect.author).toBe('kibador_oficial');
    expect(result.timeDeltaHours).toBeCloseTo(11.3, 1);
    expect(result.sharedPhrases.length).toBeGreaterThan(0);
  });

  it('deve identificar cópia com pequenas alterações e gírias como CONFIRMED_KIBE ou SUSPECT', () => {
    const paraphrasedKibe = {
      author: 'perfil_copiador',
      text: 'Passou da meia-noite galera!\nÉ pulso único até domingo.\n\nEscolhe o discador, fecha a porta e torce pra ninguém usar o telefone.\nConecta no mirc e baixa música no canal #mp3\n\nSe vc lembra o som q isso fazia vc ta velho demais kkkk',
      publishedAt: new Date('2026-09-20T08:00:00.000Z'),
    };

    const result = AntiKibeService.compare({
      postA: originalPost,
      postB: paraphrasedKibe,
    });

    expect(result.kibeScore).toBeGreaterThanOrEqual(60);
    expect(['CONFIRMED_KIBE', 'SUSPECT']).toContain(result.verdict);
    expect(result.metrics.sharedTrigramsCount).toBeGreaterThan(0);
    expect(result.sharedPhrases.length).toBeGreaterThan(0);
  });

  it('deve classificar posts sobre mesmo tema sem cópia textual como INSPIRATION ou ORIGINAL', () => {
    const inspirationPost = {
      author: 'tech_nostalgia',
      text: 'Bons tempos da internet discada dos anos 2000. Lembro que eu passava a madrugada inteira acordado jogando Tibia e conversando no MSN Messenger com a galera da escola.',
      publishedAt: new Date('2026-09-21T10:00:00.000Z'),
    };

    const result = AntiKibeService.compare({
      postA: originalPost,
      postB: inspirationPost,
    });

    expect(result.kibeScore).toBeLessThan(50);
    expect(['INSPIRATION', 'ORIGINAL']).toContain(result.verdict);
  });

  it('deve classificar posts totalmente diferentes com score próximo a 0 e ORIGINAL', () => {
    const unrelatedPost = {
      author: 'receitas_faceis',
      text: 'Receita rápida de bolo de cenoura com cobertura crocante de chocolate meio amargo. Em 40 minutos está pronto!',
      publishedAt: new Date('2026-09-22T12:00:00.000Z'),
    };

    const result = AntiKibeService.compare({
      postA: originalPost,
      postB: unrelatedPost,
    });

    expect(result.kibeScore).toBeLessThan(20);
    expect(result.verdict).toBe('ORIGINAL');
  });

  it('deve identificar a ordem cronológica correta mesmo quando fornecido em ordem invertida', () => {
    const postNovo = {
      author: 'autor_novo',
      text: 'Texto publicado mais tarde hoje.',
      publishedAt: new Date('2026-09-22T10:00:00.000Z'),
    };

    const postAntigo = {
      author: 'autor_antigo',
      text: 'Texto publicado mais cedo hoje.',
      publishedAt: new Date('2026-09-22T08:00:00.000Z'),
    };

    // Passamos o novo como postA e o antigo como postB
    const result = AntiKibeService.compare({
      postA: postNovo,
      postB: postAntigo,
    });

    expect(result.original.author).toBe('autor_antigo');
    expect(result.suspect.author).toBe('autor_novo');
    expect(result.timeDeltaHours).toBe(2);
  });
});
