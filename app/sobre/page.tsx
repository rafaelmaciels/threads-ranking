import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Shield, Heart, Code2 } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Sobre o Projeto — O que é o Threads Ranking?',
  description:
    'Conheça a história, o propósito e a filosofia por trás do Threads Ranking, uma plataforma aberta inspirada no Favstars para descobrir os melhores posts do Threads.',
  alternates: {
    canonical: '/sobre',
  },
  openGraph: {
    title: 'Sobre o Threads Ranking',
    description: 'A história, a filosofia e a tecnologia por trás do Threads Ranking.',
    url: '/sobre',
  },
};

export default function SobrePage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Sobre', url: '/sobre' },
  ]);

  return (
    <article className="max-w-3xl mx-auto py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />

      {/* Breadcrumb Visual */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <span>/</span>
        <span className="text-neutral-300">Sobre</span>
      </nav>

      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-400 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          Código Aberto & Transparência
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Sobre o Threads Ranking
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Uma ferramenta pública e transparente criada para organizar, destacar e preservar as melhores publicações de criadores e pensadores na rede social Threads.
        </p>
      </header>

      <div className="space-y-10 text-neutral-300 leading-relaxed text-sm sm:text-base">
        <section className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-red-400" />
            A Inspiração no Favstars
          </h2>
          <p className="mb-3">
            Nos primeiros anos das redes sociais abertas, serviços como o <em>Favstars</em> revolucionaram a descoberta de conteúdo de qualidade ao permitir que qualquer pessoa visualizasse os pensamentos, piadas e análises mais apreciadas de qualquer autor, sem a dependência de algoritmos opacos de recomendação.
          </p>
          <p>
            O <strong>Threads Ranking</strong> traz esse conceito clássico para o ecossistema moderno do Threads (Meta), permitindo explorar rankings transparentes por curtidas, comentários, reposts e taxas de crescimento com total clareza.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-emerald-400" />
            Privacidade e Dados Exclusivamente Públicos
          </h2>
          <p className="mb-3">
            O Threads Ranking indexa exclusivamente publicações e perfis que seus próprios autores optaram por disponibilizar de forma pública na internet. Não acessamos mensagens diretas, posts de contas privadas ou dados confidenciais.
          </p>
          <p>
            Acreditamos na soberania do usuário: caso você seja autor de uma conta e deseje que suas estatísticas agregadas não sejam apresentadas publicamente, basta nos enviar uma solicitação através do nosso FAQ.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-blue-400" />
            Stack Moderna e Arquitetura Aberta
          </h2>
          <p className="mb-3">
            O projeto é construído sobre tecnologias de alta performance:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Next.js 15 (App Router):</strong> Renderização híbrida no servidor (SSR) para velocidade e excelente SEO.</li>
            <li><strong className="text-white">TypeScript & Tailwind CSS:</strong> Tipagem estrita de contratos de dados e design minimalista consistente.</li>
            <li><strong className="text-white">PostgreSQL & Redis:</strong> Armazenamento de séries temporais de métricas e cache de baixa latência.</li>
            <li><strong className="text-white">SocialFetch API:</strong> Camada robusta de dados em tempo real da rede Threads.</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
