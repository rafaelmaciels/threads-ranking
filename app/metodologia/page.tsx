import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, MessageCircle, Repeat, TrendingUp, HelpCircle } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Metodologia de Ranking — Critérios e Fórmulas de Engajamento',
  description:
    'Aprenda como são calculados os rankings de posts do Threads: curtidas, comentários, reposts, citações e taxa de crescimento por hora (growth rate).',
  alternates: {
    canonical: '/metodologia',
  },
  openGraph: {
    title: 'Metodologia de Ranking — Threads Ranking',
    description: 'Explicação detalhada dos cálculos e critérios de ordenação de posts e perfis no Threads.',
    url: '/metodologia',
  },
};

export default function MetodologiaPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Metodologia', url: '/metodologia' },
  ]);

  return (
    <article className="max-w-3xl mx-auto py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <span>/</span>
        <span className="text-neutral-300">Metodologia</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Metodologia de Classificação
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Transparência total sobre como cada métrica é extraída, tratada e ordenada na aplicação.
        </p>
      </header>

      <div className="space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
        <section className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            1. Mais Curtidos (Ordenação Primária)
          </h2>
          <p className="text-neutral-400 mb-2">
            Os posts são ordenados estritamente pela quantidade decrescente de curtidas (<code className="text-neutral-300">like_count DESC</code>). Em caso de empate, a publicação mais recente recebe precedência no ranking.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-sky-400" />
            2. Mais Comentados (Profundidade de Diálogo)
          </h2>
          <p className="text-neutral-400 mb-2">
            Ordenação baseada no número de respostas públicas recebidas pelo post (<code className="text-neutral-300">reply_count DESC</code>). Esta métrica evidencia discussões aprofundadas, debates e interatividade com a comunidade.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Repeat className="w-4 h-4 text-emerald-400" />
            3. Mais Repostados e Mais Citados (Viralidade)
          </h2>
          <p className="text-neutral-400 mb-2">
            Avalia o compartilhamento direto do post nos feeds de outros usuários (<code className="text-neutral-300">repost_count DESC</code>) e citações diretas com comentários adicionais (<code className="text-neutral-300">quote_count DESC</code>), medindo o alcance viral fora da base de seguidores imediatos.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            4. Velocidade de Crescimento (Growth Rate)
          </h2>
          <p className="text-neutral-400 mb-3">
            Identifica posts que estão crescendo rapidamente em proporção ao tempo de vida. A fórmula padronizada calcula a média de curtidas acumuladas por hora desde o momento da publicação:
          </p>
          <div className="p-4 rounded-xl bg-black/50 border border-neutral-800 font-mono text-xs text-neutral-300">
            taxa_por_hora = total_curtidas / max(1, horas_decorridas)
          </div>
        </section>

        <section className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Dúvidas sobre os dados?</span>
          <Link href="/faq" className="text-white hover:underline flex items-center gap-1">
            Consulte o FAQ <HelpCircle className="w-3.5 h-3.5" />
          </Link>
        </section>
      </div>
    </article>
  );
}
