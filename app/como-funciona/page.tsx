import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, Database, Search, Cpu } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Como Funciona — Coleta, Indexação e Atualização de Posts',
  description:
    'Entenda o processo técnico de busca, coleta e ordenação de posts públicos do Threads no Threads Ranking. Frequência de sincronização e integridade dos dados.',
  alternates: {
    canonical: '/como-funciona',
  },
  openGraph: {
    title: 'Como Funciona o Threads Ranking',
    description: 'Processo técnico de indexação, coleta e atualização de dados de perfis públicos do Threads.',
    url: '/como-funciona',
  },
};

export default function ComoFuncionaPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Como Funciona', url: '/como-funciona' },
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
        <span className="text-neutral-300">Como Funciona</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Como Funciona o Threads Ranking
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Do momento em que você digita um nome de usuário até a exibição do ranking instantâneo, conheça o fluxo operacional por trás da plataforma.
        </p>
      </header>

      <div className="space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-white mb-3">
              <Search className="w-4 h-4 text-sky-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1.5">1. Consulta e Descoberta</h2>
            <p className="text-xs text-neutral-400 leading-normal">
              Quando você busca um nome de usuário (ex: <code className="text-neutral-300">@rafaelost</code>), o sistema valida a sintaxe e localiza o identificador correspondente através das APIs públicas.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-white mb-3">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1.5">2. Paginação Profunda</h2>
            <p className="text-xs text-neutral-400 leading-normal">
              Para encontrar os posts mais curtidos de toda a história do perfil, o coletor itera automaticamente sobre múltiplos lotes cronológicos de posts através de cursores de paginação.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-white mb-3">
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1.5">3. Ordenação e Cálculo</h2>
            <p className="text-xs text-neutral-400 leading-normal">
              As métricas de engajamento (curtidas, comentários, reposts, citações) são organizadas e calculadas matematicamente para gerar os pódios e posições de destaque.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-white mb-3">
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1.5">4. Cache Inteligente</h2>
            <p className="text-xs text-neutral-400 leading-normal">
              Para garantir respostas em menos de 100ms e evitar sobrecarga nos provedores, os resultados consolidados são mantidos em cache com atualização automática periódica.
            </p>
          </div>
        </div>

        <section className="pt-4 border-t border-neutral-800">
          <h2 className="text-xl font-bold text-white mb-3">Frequência de Atualização</h2>
          <p className="mb-3">
            Perfis populares com consultas frequentes são sincronizados automaticamente a cada 24 horas. Usuários também podem clicar no botão &quot;Atualizar Dados&quot; diretamente na página do perfil para solicitar uma nova varredura de métricas em tempo real quando desejado.
          </p>
          <p className="text-neutral-400 text-xs">
            Quer entender a fórmula exata de cada ranking? Consulte nossa página de <Link href="/metodologia" className="text-white underline underline-offset-4">Metodologia</Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
