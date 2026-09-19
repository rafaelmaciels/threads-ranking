'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center text-2xl font-bold text-red-400 mb-6">
        !
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Algo deu errado</h1>
      <p className="text-neutral-400 max-w-md text-sm mb-6">
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente ou retorne à página inicial.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-sm rounded-full transition-colors"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold text-sm rounded-full transition-colors"
        >
          Página inicial
        </Link>
      </div>
    </div>
  );
}
