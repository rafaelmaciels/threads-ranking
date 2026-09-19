import type { Metadata } from 'next';
import Link from 'next/link';
import { generateBreadcrumbSchema, generateFaqSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes (FAQ) — Threads Ranking',
  description:
    'Tire suas dúvidas sobre o Threads Ranking: como as métricas são atualizadas, privacidade, exclusão de dados e como indexar novos perfis.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Perguntas Frequentes (FAQ) — Threads Ranking',
    description: 'Respostas claras sobre privacidade, dados públicos e funcionamento da plataforma.',
    url: '/faq',
  },
};

const FAQS = [
  {
    question: 'O Threads Ranking é afiliado à Meta Platforms ou ao Threads?',
    answer:
      'Não. O Threads Ranking é um projeto open source independente, sem vínculo comercial ou afiliação oficial com a Meta Platforms, Inc. ou o aplicativo Threads.',
  },
  {
    question: 'De onde vêm os dados dos posts e das curtidas?',
    answer:
      'Todos os dados exibidos são obtidos exclusivamente de perfis abertos e públicos da rede social Threads através de APIs e conectores autorizados de agregação pública de dados.',
  },
  {
    question: 'Com que frequência as métricas dos perfis são atualizadas?',
    answer:
      'Perfis em monitoramento ativo são recalculados periodicamente a cada 24 horas. Qualquer usuário pode também solicitar uma sincronização imediata através do botão "Atualizar Dados" na página do perfil.',
  },
  {
    question: 'Por que a contagem de curtidas pode apresentar pequenas variações?',
    answer:
      'As redes sociais de grande porte utilizam consistência eventual para contadores massivos. Podem ocorrer pequenas defasagens entre o momento da consulta no Threads e a atualização no nosso cache.',
  },
  {
    question: 'Como faço para remover meu perfil do Threads Ranking?',
    answer:
      'Respeitamos integralmente a preferência dos criadores. Caso seja o proprietário de um perfil público e prefira não ter suas métricas indexadas aqui, basta abrir uma issue ou solicitar a exclusão através do nosso repositório no GitHub.',
  },
];

export default function FaqPage() {
  const breadcrumbsJson = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ]);

  const faqJson = generateFaqSchema(FAQS);

  return (
    <article className="max-w-3xl mx-auto py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <span>/</span>
        <span className="text-neutral-300">Perguntas Frequentes</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Perguntas Frequentes (FAQ)
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Respostas diretas e transparentes sobre o funcionamento, coleta e privacidade do Threads Ranking.
        </p>
      </header>

      <div className="space-y-6">
        {FAQS.map((faq, index) => (
          <section key={index} className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">
              {faq.question}
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {faq.answer}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
