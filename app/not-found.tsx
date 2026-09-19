import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Página Não Encontrada (404) | Threads Ranking',
  description: 'A página ou perfil que você está procurando não foi encontrado ou não está disponível publicamente.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-2xl font-bold text-neutral-400 mb-6">
        404
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Página não encontrada</h1>
      <p className="text-neutral-400 max-w-md text-sm mb-6">
        O perfil ou endereço solicitado não existe, é privado ou não possui publicações indexadas.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold text-sm rounded-full transition-colors"
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
}
