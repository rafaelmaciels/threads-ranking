'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Clock,
  Copy,
  Check,
  GitCompare,
  RotateCcw,
} from 'lucide-react';
import { AntiKibeResult } from '@/domain/antiKibe/types';

interface PresetExample {
  title: string;
  badge: string;
  authorA: string;
  dateA: string;
  textA: string;
  authorB: string;
  dateB: string;
  textB: string;
}

const PRESET_EXAMPLES: PresetExample[] = [
  {
    title: 'Kibe Viral (Nostalgia Discada)',
    badge: '🚨 Cópia Quase Literal',
    authorA: 'rafaelost',
    dateA: '2026-09-19T03:14:26.000Z',
    textA:
      'PASSOU DA MEIA-NOITE.\n\nÉ PULSO ÚNICO ATÉ DOMINGO. \n\nEscolhe seu discador, fecha a porta, torce pra ninguém usar o telefone.\nConecta no mIRC e baixar aquela musica no canal #mp3\n\nSe você sabe exatamente que som que isso fazia, você já está velho.',
    authorB: 'kibador_trend',
    dateB: '2026-09-20T14:20:00.000Z',
    textB:
      'Passou da meia-noite galera!\nÉ pulso único até domingo.\n\nEscolhe o discador, fecha a porta e torce pra ninguém usar o telefone.\nConecta no mIRC e baixa música no canal #mp3\n\nSe vc lembra o som que isso fazia, vc já tá velho demais!',
  },
  {
    title: 'Mesmo Assunto (Inspiração / Tema Comum)',
    badge: '💡 Ideias Semelhantes',
    authorA: 'rafaelost',
    dateA: '2026-09-16T23:33:13.000Z',
    textA:
      'Quem lembra que o MSN tinha um plugin que desbloqueava várias funções? Dava pra tremer a tela sem limite e ver quem te bloqueou.',
    authorB: 'retro_geek',
    dateB: '2026-09-18T10:00:00.000Z',
    textB:
      'Bateu saudades da época de ouro do MSN Messenger com o Plus!. A gente passava a tarde inteira mandando wizz pra irritar os amigos.',
  },
  {
    title: 'Originais (Assuntos Diferentes)',
    badge: '✅ 100% Autênticos',
    authorA: 'dev_maria',
    dateA: '2026-09-21T09:00:00.000Z',
    textA:
      'Hoje migramos nossa infraestrutura para Docker Swarm e reduzimos o tempo de deploy de 20 minutos para apenas 45 segundos. Incrível!',
    authorB: 'chef_carlos',
    dateB: '2026-09-22T11:30:00.000Z',
    textB:
      'O segredo do pão de fermentação natural é a paciência e a temperatura da água. Deixar a massa descansar por 18 horas muda tudo.',
  },
];

export default function AntiKibePage() {
  const [authorA, setAuthorA] = useState('rafaelost');
  const [dateA, setDateA] = useState('2026-09-19T03:14:26');
  const [textA, setTextA] = useState(PRESET_EXAMPLES[0].textA);

  const [authorB, setAuthorB] = useState('kibador_trend');
  const [dateB, setDateB] = useState('2026-09-20T14:20:00');
  const [textB, setTextB] = useState(PRESET_EXAMPLES[0].textB);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AntiKibeResult | null>(null);
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/anti-kibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postA: { author: authorA, text: textA, publishedAt: dateA },
          postB: { author: authorB, text: textB, publishedAt: dateB },
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: PresetExample) => {
    setAuthorA(preset.authorA);
    setDateA(preset.dateA.slice(0, 16));
    setTextA(preset.textA);

    setAuthorB(preset.authorB);
    setDateB(preset.dateB.slice(0, 16));
    setTextB(preset.textB);

    setResult(null);
  };

  const copyToClipboard = (phrase: string) => {
    navigator.clipboard.writeText(phrase);
    setCopiedPhrase(phrase);
    setTimeout(() => setCopiedPhrase(null), 2000);
  };

  const getVerdictStyle = (verdict?: string) => {
    switch (verdict) {
      case 'CONFIRMED_KIBE':
        return {
          bg: 'bg-red-950/60 border-red-800 text-red-300',
          icon: ShieldAlert,
          color: 'text-red-400',
          meter: 'bg-red-500',
        };
      case 'SUSPECT':
        return {
          bg: 'bg-amber-950/60 border-amber-800 text-amber-300',
          icon: AlertTriangle,
          color: 'text-amber-400',
          meter: 'bg-amber-500',
        };
      case 'INSPIRATION':
        return {
          bg: 'bg-sky-950/60 border-sky-800 text-sky-300',
          icon: Lightbulb,
          color: 'text-sky-400',
          meter: 'bg-sky-500',
        };
      case 'ORIGINAL':
      default:
        return {
          bg: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
          icon: ShieldCheck,
          color: 'text-emerald-400',
          meter: 'bg-emerald-500',
        };
    }
  };

  const style = getVerdictStyle(result?.verdict);
  const VerdictIcon = style.icon;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">
          Início
        </Link>
        <span>/</span>
        <span className="text-neutral-300">Anti Kibe</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 mb-4">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          Detector de Plágio e Cópia no Threads
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Função Anti Kibe
        </h1>
        <p className="text-base text-neutral-400 max-w-3xl leading-relaxed">
          Compare duas publicações de perfis diferentes para averiguar indícios de cópia descarada,
          paráfrases não creditadas e verificar a linha do tempo exata de quem postou primeiro.
        </p>
      </header>

      {/* Presets para teste rápido */}
      <section className="mb-8">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Testar com Exemplos Prontos
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_EXAMPLES.map((preset, idx) => (
            <button
              key={idx}
              id={`preset-btn-${idx}`}
              onClick={() => loadPreset(preset)}
              className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 text-left transition-all hover:bg-neutral-900 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-neutral-200">
                  {preset.title}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">{preset.badge}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Painel de Comparação 1 vs 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Post A */}
        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-300">Publicação A (Referência)</span>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-neutral-500">Autor:</label>
                <input
                  id="author-a-input"
                  type="text"
                  value={authorA}
                  onChange={(e) => setAuthorA(e.target.value)}
                  placeholder="ex: rafaelost"
                  className="px-2 py-1 text-xs rounded bg-neutral-800 border border-neutral-700 text-white font-mono focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <label className="text-[11px] text-neutral-400">Data de Publicação:</label>
              <input
                id="date-a-input"
                type="datetime-local"
                value={dateA}
                onChange={(e) => setDateA(e.target.value)}
                className="px-2 py-1 text-xs rounded bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>

            <label className="text-xs text-neutral-400 block mb-1.5 font-medium">Conteúdo do Post A:</label>
            <textarea
              id="text-a-input"
              rows={6}
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              placeholder="Cole o texto da postagem..."
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 resize-none font-sans"
            />
          </div>
        </div>

        {/* Post B */}
        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-300">Publicação B (Suspeita)</span>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-neutral-500">Autor:</label>
                <input
                  id="author-b-input"
                  type="text"
                  value={authorB}
                  onChange={(e) => setAuthorB(e.target.value)}
                  placeholder="ex: outro_perfil"
                  className="px-2 py-1 text-xs rounded bg-neutral-800 border border-neutral-700 text-white font-mono focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <label className="text-[11px] text-neutral-400">Data de Publicação:</label>
              <input
                id="date-b-input"
                type="datetime-local"
                value={dateB}
                onChange={(e) => setDateB(e.target.value)}
                className="px-2 py-1 text-xs rounded bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>

            <label className="text-xs text-neutral-400 block mb-1.5 font-medium">Conteúdo do Post B:</label>
            <textarea
              id="text-b-input"
              rows={6}
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              placeholder="Cole o texto da postagem para comparar..."
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 resize-none font-sans"
            />
          </div>
        </div>
      </div>

      {/* Botão de Ação */}
      <div className="flex items-center justify-center mb-10">
        <button
          id="btn-run-anti-kibe"
          onClick={handleAnalyze}
          disabled={loading || !textA.trim() || !textB.trim()}
          className="px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GitCompare className="w-4 h-4" />
          <span>{loading ? 'Analisando semelhanças...' : 'Executar Análise Anti Kibe'}</span>
        </button>
      </div>

      {/* Resultados da Análise */}
      {result && (
        <section
          id="anti-kibe-results"
          className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 mb-12 animate-fade-in"
        >
          {/* Topo do Laudo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style.bg} flex items-center gap-1.5`}>
                  <VerdictIcon className="w-3.5 h-3.5" />
                  {result.verdictLabel}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  Confiança: {result.confidence}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 max-w-xl leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Medidor do Kibe Score */}
            <div className="w-full sm:w-auto p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center min-w-[160px]">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Kibe Score
              </span>
              <span className={`text-4xl font-black ${style.color}`}>
                {result.kibeScore}%
              </span>
              <div className="w-28 h-2 rounded-full bg-neutral-800 mt-2 overflow-hidden">
                <div
                  className={`h-full ${style.meter} transition-all duration-700`}
                  style={{ width: `${result.kibeScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Linha do Tempo e Autoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Autor Original (Primário)
              </span>
              <div className="text-base font-bold text-white mb-1">
                @{result.original.author}
              </div>
              <div className="text-xs text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                Publicado em: {new Date(result.original.publishedAt).toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                Publicação Posterior (Suspeita)
              </span>
              <div className="text-base font-bold text-white mb-1">
                @{result.suspect.author}
              </div>
              <div className="text-xs text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                {result.timeDeltaHours > 0
                  ? `Postado ${result.timeDeltaHours} horas após o original`
                  : 'Postado praticamente no mesmo instante'}
              </div>
            </div>
          </div>

          {/* Métricas Detalhadas */}
          <div className="mb-6 p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/60">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
              Métricas do Algoritmo Anti Kibe
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Trigramas Comuns</span>
                <span className="text-sm font-bold text-white">
                  {result.metrics.sharedTrigramsCount}
                </span>
              </div>
              <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Bigramas Comuns</span>
                <span className="text-sm font-bold text-white">
                  {result.metrics.sharedBigramsCount}
                </span>
              </div>
              <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Similaridade Jaccard</span>
                <span className="text-sm font-bold text-white">
                  {Math.round(result.metrics.jaccardSimilarity * 100)}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Semelhança Estrutural</span>
                <span className="text-sm font-bold text-white">
                  {Math.round(result.metrics.structuralSimilarity * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Frases Idênticas Compartilhadas */}
          {result.sharedPhrases.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Trechos Idênticos Detectados ({result.sharedPhrases.length})
              </h4>
              <div className="space-y-2">
                {result.sharedPhrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-neutral-950 border border-amber-900/40 text-amber-200/90 text-xs flex items-center justify-between gap-3 font-mono"
                  >
                    <span>“{phrase}”</span>
                    <button
                      onClick={() => copyToClipboard(phrase)}
                      className="p-1 text-neutral-400 hover:text-white transition-colors"
                      title="Copiar trecho"
                    >
                      {copiedPhrase === phrase ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-500 italic">
              Nenhuma frase contínua de 3 ou mais palavras idênticas foi compartilhada entre os dois posts.
            </div>
          )}
        </section>
      )}

      {/* Como Funciona o Anti Kibe */}
      <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Como o Algoritmo do Anti Kibe Opera
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl mb-4">
          O sistema aplica normalização fonética e sintática em língua portuguesa, avalia N-gramas
          (sequências exatas de 2 e 3 palavras), distância de edição de Levenshtein e cruza os horários
          exatos de publicação para definir o autor original e apontar quem copiou quem com embasamento estatístico.
        </p>
        <Link
          href="/como-funciona"
          className="text-xs text-white underline underline-offset-4 hover:text-neutral-300"
        >
          Saiba mais sobre a metodologia do Threads Ranking →
        </Link>
      </section>
    </div>
  );
}
