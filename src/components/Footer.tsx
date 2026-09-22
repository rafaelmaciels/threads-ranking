import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#262626] bg-[#101010]/80 backdrop-blur-sm py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 flex flex-col gap-5 text-xs text-neutral-400">
        {/* Links Internos de SEO e Conteúdo */}
        <nav className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-neutral-400 text-xs" aria-label="Links institucionais">
          <Link href="/sobre" className="hover:text-white transition-colors">
            Sobre
          </Link>
          <Link href="/como-funciona" className="hover:text-white transition-colors">
            Como Funciona
          </Link>
          <Link href="/metodologia" className="hover:text-white transition-colors">
            Metodologia
          </Link>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/trending" className="hover:text-white transition-colors">
            Perfis em Alta
          </Link>
          <Link href="/anti-kibe" className="hover:text-white transition-colors">
            Anti Kibe
          </Link>
          <Link href="https://github.com/rafaelmaciels/threads-ranking" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            GitHub
          </Link>
        </nav>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1e1e1e]">
          <p className="text-center sm:text-left">
            Desenvolvido por{' '}
            <a
              href="https://rafaelmaciel.net/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website pessoal de Rafael Maciel (abre em nova aba)"
              className="font-medium text-neutral-200 hover:text-white underline underline-offset-4 decoration-[#383838] hover:decoration-neutral-300 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-sm"
            >
              Rafael Maciel
            </a>
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-1 text-neutral-500 text-[11px]">
            <span>© {currentYear} Threads Ranking</span>
            <span>•</span>
            <span>Open Source (MIT)</span>
            <span>•</span>
            <span className="text-neutral-600">Não afiliado à Meta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
