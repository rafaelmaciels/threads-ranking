'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, TrendingUp, ShieldCheck, Flame, BookOpen } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { generateWebsiteSchema } from '@/lib/seo';

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const websiteSchema = generateWebsiteSchema();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().replace(/^@/, '');
    if (!clean) return;

    trackEvent('search_profile', { username: clean });
    setLoading(true);
    router.push(`/@${clean}`);
  };

  return (
    <div className="flex flex-col items-center justify-center pt-12 sm:pt-20 pb-16 text-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Badge Superior */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e1e1e] border border-[#2d2d2d] text-xs font-medium text-neutral-300 mb-8 animate-fadeIn">
        <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
        Inspirado conceitualmente no lendário Favstars
      </div>

      {/* Título Principal */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-2xl leading-tight mb-4 animate-fadeIn">
        THREADS <span className="text-neutral-500 font-light">RANKING</span>
      </h1>

      <p className="text-base sm:text-lg text-neutral-400 max-w-xl mb-10 leading-relaxed animate-fadeIn">
        Descubra os posts mais populares de qualquer perfil público do Threads.
        Ordene por curtidas, comentários, reposts e velocidade de crescimento.
      </p>

      {/* Formulário de Busca Semântico */}
      <form
        role="search"
        aria-label="Buscar perfil do Threads"
        onSubmit={handleSubmit}
        className="w-full max-w-lg flex flex-col sm:flex-row gap-3 mb-10 animate-fadeIn"
      >
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-base font-semibold">
            @
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            disabled={loading}
            aria-label="Digite o nome de usuário do perfil no Threads"
            className="w-full pl-9 pr-4 py-3.5 bg-[#181818] border border-[#2c2c2c] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-base"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="px-6 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>PESQUISAR</span>
            </>
          )}
        </button>
      </form>

      {/* Perfis Rápidos de Exemplo */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 mb-16 animate-fadeIn">
        <span>Exemplos em destaque:</span>
        <Link
          href="/@demo"
          className="px-2.5 py-1 rounded-md bg-[#1c1c1c] border border-[#2b2b2b] text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
        >
          @demo
        </Link>
        <Link
          href="/@rafaelost"
          className="px-2.5 py-1 rounded-md bg-[#1c1c1c] border border-[#2b2b2b] text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
        >
          @rafaelost
        </Link>
        <Link
          href="/trending"
          className="px-2.5 py-1 rounded-md bg-[#1c1c1c] border border-neutral-700 text-neutral-200 hover:border-white hover:text-white transition-colors flex items-center gap-1"
        >
          <Flame className="w-3 h-3 text-amber-400" />
          <span>Ver todos os destaques</span>
        </Link>
      </div>

      {/* Grid de Features Semântica */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left pt-6 border-t border-[#222222]">
        <div className="p-5 rounded-xl bg-[#141414] border border-[#222222]">
          <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center text-white mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-sm font-semibold text-white mb-1">Métricas Históricas</h2>
          <p className="text-xs text-neutral-400 leading-normal">
            Analisamos o histórico de publicações públicas para encontrar os recordes de engajamento da conta.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#141414] border border-[#222222]">
          <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center text-white mb-3">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <h2 className="text-sm font-semibold text-white mb-1">100% Público & Aberto</h2>
          <p className="text-xs text-neutral-400 leading-normal">
            Sem login ou credenciais privadas necessárias. Respeito integral à privacidade e aos dados abertos.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#141414] border border-[#222222]">
          <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center text-white mb-3">
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-sm font-semibold text-white mb-1">Metodologia Clara</h2>
          <p className="text-xs text-neutral-400 leading-normal">
            Fórmulas transparentes de cálculo para curtidas, comentários, reposts e taxas de crescimento.
          </p>
        </div>
      </div>
    </div>
  );
}
