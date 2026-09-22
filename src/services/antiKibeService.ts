import {
  AntiKibeComparisonInput,
  AntiKibeResult,
  KibeVerdict,
  AntiKibePostInput,
} from '@/domain/antiKibe/types';

// Stopwords essenciais da língua portuguesa para filtragem opcional
const PT_STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'para',
  'com', 'e', 'ou', 'mas', 'que', 'se', 'ja', 'so', 'me', 'te', 'lhe', 'nos', 'vos',
  'lhes', 'meu', 'minha', 'seu', 'sua', 'ele', 'ela', 'eles', 'elas', 'esse', 'essa',
  'este', 'esta', 'isso', 'isto', 'aquele', 'aquela', 'aquilo', 'muito', 'muita',
  'mais', 'menos', 'quem', 'qual', 'quando', 'onde', 'como', 'porque', 'por que',
]);

export class AntiKibeService {
  /**
   * Normaliza um texto para comparação fonética e lexical
   */
  static normalizeText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      // Remove links/URLs
      .replace(/https?:\/\/\S+/gi, '')
      // Remove menções de usuários
      .replace(/@\w+/g, '')
      // Remove acentos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Remove caracteres especiais exceto pontuação de linha
      .replace(/[^a-z0-9\s\n]/gi, ' ')
      // Normaliza espaços contínuos
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * Extrai tokens/palavras relevantes do texto normalizado
   */
  static tokenize(text: string, removeStopwords = false): string[] {
    const normalized = this.normalizeText(text);
    const tokens = normalized.split(/\s+/).filter((t) => t.length > 0);
    if (!removeStopwords) return tokens;
    return tokens.filter((t) => !PT_STOPWORDS.has(t) && t.length > 1);
  }

  /**
   * Gera N-gramas de palavras (ex: n=2 para bigramas, n=3 para trigramas)
   */
  static generateNGrams(tokens: string[], n: number): string[] {
    if (tokens.length < n) return [];
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  /**
   * Calcula o índice de Jaccard entre dois conjuntos de strings
   */
  static jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 && setB.size === 0) return 1.0;
    if (setA.size === 0 || setB.size === 0) return 0.0;

    let intersectionSize = 0;
    for (const item of setA) {
      if (setB.has(item)) {
        intersectionSize++;
      }
    }

    const unionSize = setA.size + setB.size - intersectionSize;
    return unionSize === 0 ? 0 : Math.round((intersectionSize / unionSize) * 1000) / 1000;
  }

  /**
   * Distância de Levenshtein aproximada e normalizada para frases/palavras
   */
  static levenshteinSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (!s1.length || !s2.length) return 0.0;

    // Se as strings forem muito longas, comparamos vetor de palavras para manter performance
    if (s1.length > 300 || s2.length > 300) {
      const wordsA = new Set(this.tokenize(s1));
      const wordsB = new Set(this.tokenize(s2));
      return this.jaccardSimilarity(wordsA, wordsB);
    }

    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // exclusão
          dp[i][j - 1] + 1, // inserção
          dp[i - 1][j - 1] + cost // substituição
        );
      }
    }

    const distance = dp[m][n];
    const maxLen = Math.max(m, n);
    return Math.max(0, Math.round((1 - distance / maxLen) * 1000) / 1000);
  }

  /**
   * Extrai trechos idênticos contínuos (frases de 3 ou mais palavras)
   */
  static extractSharedPhrases(textA: string, textB: string): string[] {
    const tokensA = this.tokenize(textA);
    const tokensB = this.tokenize(textB);

    if (tokensA.length < 3 || tokensB.length < 3) {
      const normA = this.normalizeText(textA);
      const normB = this.normalizeText(textB);
      if (normA && normB && (normA === normB || normA.includes(normB) || normB.includes(normA))) {
        return [normA.length < normB.length ? normA : normB];
      }
      return [];
    }

    const setBTrigrams = new Set(this.generateNGrams(tokensB, 3));
    const phrases: string[] = [];

    let currentMatch: string[] = [];
    for (let i = 0; i <= tokensA.length - 3; i++) {
      const trigram = `${tokensA[i]} ${tokensA[i + 1]} ${tokensA[i + 2]}`;
      if (setBTrigrams.has(trigram)) {
        if (currentMatch.length === 0) {
          currentMatch.push(tokensA[i], tokensA[i + 1], tokensA[i + 2]);
        } else {
          currentMatch.push(tokensA[i + 2]);
        }
      } else {
        if (currentMatch.length >= 3) {
          phrases.push(currentMatch.join(' '));
        }
        currentMatch = [];
      }
    }

    if (currentMatch.length >= 3) {
      phrases.push(currentMatch.join(' '));
    }

    // Remove duplicatas e substrings redundantes
    const unique = [...new Set(phrases)];
    return unique.filter((p, _, arr) => !arr.some((other) => other !== p && other.includes(p)));
  }

  /**
   * Compara dois posts e emite o laudo completo com Kibe Score e classificação
   */
  static compare(input: AntiKibeComparisonInput): AntiKibeResult {
    const rawPostA = input.postA;
    const rawPostB = input.postB;

    const dateA = rawPostA.publishedAt ? new Date(rawPostA.publishedAt) : new Date(0);
    const dateB = rawPostB.publishedAt ? new Date(rawPostB.publishedAt) : new Date(Date.now());

    // O post mais antigo é considerado o post original de referência
    const isAPrior = dateA.getTime() <= dateB.getTime();
    const originalInput = isAPrior ? rawPostA : rawPostB;
    const suspectInput = isAPrior ? rawPostB : rawPostA;
    const originalDate = isAPrior ? dateA : dateB;
    const suspectDate = isAPrior ? dateB : dateA;

    const normOriginal = this.normalizeText(originalInput.text);
    const normSuspect = this.normalizeText(suspectInput.text);

    // 1. Tokens e N-Gramas
    const tokensOriginal = this.tokenize(originalInput.text);
    const tokensSuspect = this.tokenize(suspectInput.text);

    const tokensContentOriginal = new Set(this.tokenize(originalInput.text, true));
    const tokensContentSuspect = new Set(this.tokenize(suspectInput.text, true));

    const bigramsOriginal = new Set(this.generateNGrams(tokensOriginal, 2));
    const bigramsSuspect = new Set(this.generateNGrams(tokensSuspect, 2));

    const trigramsOriginal = new Set(this.generateNGrams(tokensOriginal, 3));
    const trigramsSuspect = new Set(this.generateNGrams(tokensSuspect, 3));

    // 2. Métricas
    const jaccardWords = this.jaccardSimilarity(tokensContentOriginal, tokensContentSuspect);
    const jaccardBigrams = this.jaccardSimilarity(bigramsOriginal, bigramsSuspect);
    const jaccardTrigrams = this.jaccardSimilarity(trigramsOriginal, trigramsSuspect);
    const levSim = this.levenshteinSimilarity(normOriginal, normSuspect);

    // Similaridade estrutural (proporção de caracteres e quebras de linha)
    const lenRatio =
      Math.min(normOriginal.length, normSuspect.length) /
      Math.max(1, Math.max(normOriginal.length, normSuspect.length));
    const linesOriginal = (originalInput.text.match(/\n/g) || []).length;
    const linesSuspect = (suspectInput.text.match(/\n/g) || []).length;
    const lineRatio = 1 - Math.abs(linesOriginal - linesSuspect) / Math.max(1, linesOriginal + linesSuspect);
    const structuralSimilarity = Math.round(((lenRatio * 0.7 + lineRatio * 0.3)) * 100) / 100;

    // 3. Contagem de N-gramas compartilhados
    let sharedBigrams = 0;
    for (const bg of bigramsSuspect) {
      if (bigramsOriginal.has(bg)) sharedBigrams++;
    }

    let sharedTrigrams = 0;
    for (const tg of trigramsSuspect) {
      if (trigramsOriginal.has(tg)) sharedTrigrams++;
    }

    const sharedPhrases = this.extractSharedPhrases(originalInput.text, suspectInput.text);

    // 4. Cálculo ponderado do Kibe Score (0 a 100)
    let score = 0;

    if (normOriginal === normSuspect && normOriginal.length > 0) {
      score = 100;
    } else {
      // Ponderação:
      // 40% Trigramas (sequências contínuas de 3 palavras)
      // 25% Bigramas (pares de palavras)
      // 20% Levenshtein / Vocabulário
      // 15% Similaridade estrutural e de tamanho
      const weighted =
        jaccardTrigrams * 40 +
        jaccardBigrams * 25 +
        Math.max(jaccardWords, levSim) * 20 +
        structuralSimilarity * 15;

      score = Math.round(Math.min(100, Math.max(0, weighted)));

      // Bônus se tiver mais de 2 frases idênticas compartilhadas
      if (sharedPhrases.length >= 2 && score < 85) {
        score = Math.min(100, score + 10);
      }
    }

    // 5. Diferença de tempo
    const timeDeltaMs = Math.max(0, suspectDate.getTime() - originalDate.getTime());
    const timeDeltaHours = Math.round((timeDeltaMs / 3600000) * 10) / 10;

    // 6. Veredito e Classificação
    let verdict: KibeVerdict = 'ORIGINAL';
    let verdictLabel = 'Original';
    let confidence: 'BAIXA' | 'MÉDIA' | 'ALTA' = 'ALTA';
    let summary = '';

    if (score >= 80) {
      verdict = 'CONFIRMED_KIBE';
      verdictLabel = '🚨 Kibe Confirmado';
      confidence = 'ALTA';
      summary = `Detectada reprodução quase idêntica do texto original. O autor @${suspectInput.author || 'suspeito'} utilizou as mesmas frases e estrutura publicadas anteriormente por @${originalInput.author || 'original'}.`;
    } else if (score >= 60) {
      verdict = 'SUSPECT';
      verdictLabel = '⚠️ Suspeita Elevada';
      confidence = 'MÉDIA';
      summary = `Identificados indícios consistentes de plágio ou paráfrase direta. Estrutura e expressões marcantes foram replicadas após a publicação original.`;
    } else if (score >= 30) {
      verdict = 'INSPIRATION';
      verdictLabel = '💡 Inspiração Provável';
      confidence = 'MÉDIA';
      summary = `Ambos os posts tratam do mesmo assunto ou trending topic, compartilhando palavras-chave em comum, mas com redação parcialmente própria.`;
    } else {
      verdict = 'ORIGINAL';
      verdictLabel = '✅ Publicações Originais';
      confidence = 'ALTA';
      summary = `Baixíssima correlação textual. As publicações possuem abordagens e construções sintáticas completamente distintas.`;
    }

    return {
      original: {
        author: originalInput.author || 'autor_1',
        text: originalInput.text,
        publishedAt: originalDate,
        permalink: originalInput.permalink,
      },
      suspect: {
        author: suspectInput.author || 'autor_2',
        text: suspectInput.text,
        publishedAt: suspectDate,
        permalink: suspectInput.permalink,
      },
      kibeScore: score,
      verdict,
      verdictLabel,
      confidence,
      timeDeltaHours,
      metrics: {
        jaccardSimilarity: jaccardWords,
        levenshteinSimilarity: levSim,
        structuralSimilarity,
        sharedBigramsCount: sharedBigrams,
        sharedTrigramsCount: sharedTrigrams,
      },
      sharedPhrases,
      summary,
    };
  }
}
