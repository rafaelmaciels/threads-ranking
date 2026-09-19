import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, TrendingUp, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Perfis e Posts em Alta no Threads — Trending Ranking',
  description:
    'Explore os perfis públicos e posts mais populares, mais comentados e com maior engajamento no Threads Ranking.',
  alternates: {
    canonical: '/trending',
  },
  openGraph: {
    title: 'Trending — Posts e Perfis em Alta no Threads',
    description: 'Explore perfis públicos com alto engajamento no Threads.',
    url: '/trending',
  },
};

const FEATURED_PROFILES = [
  {
    username: 'rafaelost',
    name: 'Rafael Maciel',
    bio: 'Desenvolvedor, criador de conteúdo e entusiasta de tecnologia e dados.',
    highlight: 'Destaque da comunidade',
  },
  {
    username: 'demo',
    name: 'Perfil de Demonstração',
    bio: 'Perfil conceitual com métricas simuladas para validação do sistema.',
    highlight: 'Validação e Testes',
  },
];

export default function TrendingPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Trending', url: '/trending' },
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <span>/</span>
        <span className="text-neutral-300">Trending</span>
      </nav>

      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 mb-4">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          Tendências e Destaques Públicos
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Perfis em Alta no Threads
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl">
          Descubra autores e publicações de grande repercussão. Navegue pelos rankings de curtidas, respostas e velocidade de crescimento.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Perfis Recomendados para Explorar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURED_PROFILES.map((profile) => (
            <div
              key={profile.username}
              className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-[11px] font-medium text-neutral-300">
                    {profile.highlight}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">@{profile.username}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{profile.name}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">{profile.bio}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-neutral-800/80">
                <Link
                  href={`/@${profile.username}`}
                  className="flex-1 px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Ver Ranking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/@${profile.username}?sort=likes`}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  title="Mais Curtidos"
                >
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                </Link>
                <Link
                  href={`/@${profile.username}?sort=replies`}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  title="Mais Comentados"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-[#151515] to-neutral-900 border border-neutral-800">
        <h2 className="text-lg font-bold text-white mb-2">Quer analisar outro criador?</h2>
        <p className="text-xs text-neutral-400 mb-4 max-w-xl">
          Você pode pesquisar qualquer perfil público do Threads diretamente pela barra de pesquisa na página inicial.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white underline underline-offset-4 hover:text-neutral-300"
        >
          Ir para a barra de pesquisa principal →
        </Link>
      </section>
    </div>
  );
}
