export type KibeVerdict = 'ORIGINAL' | 'INSPIRATION' | 'SUSPECT' | 'CONFIRMED_KIBE';

export interface AntiKibePostInput {
  text: string;
  author?: string;
  publishedAt?: Date | string;
  permalink?: string;
}

export interface AntiKibeComparisonInput {
  postA: AntiKibePostInput;
  postB: AntiKibePostInput;
}

export interface SharedPhraseMatch {
  phrase: string;
  wordCount: number;
}

export interface AntiKibeScoreMetrics {
  jaccardSimilarity: number;
  levenshteinSimilarity: number;
  structuralSimilarity: number;
  sharedBigramsCount: number;
  sharedTrigramsCount: number;
}

export interface AntiKibePostSummary {
  author: string;
  text: string;
  publishedAt: Date;
  permalink?: string;
}

export interface AntiKibeResult {
  original: AntiKibePostSummary;
  suspect: AntiKibePostSummary;
  kibeScore: number; // 0 a 100
  verdict: KibeVerdict;
  verdictLabel: string;
  confidence: 'BAIXA' | 'MÉDIA' | 'ALTA';
  timeDeltaHours: number;
  metrics: AntiKibeScoreMetrics;
  sharedPhrases: string[];
  summary: string;
}
