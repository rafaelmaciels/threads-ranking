import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Footer } from '@/components/Footer';
import './globals.css';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Threads Ranking — Posts Mais Populares e Curtidos do Threads',
    template: '%s | Threads Ranking',
  },
  description:
    'Descubra e analise os posts mais curtidos, comentados e com maior engajamento de perfis públicos do Threads (Meta). Rankings históricos inspirados no Favstars.',
  keywords: [
    'threads',
    'threads ranking',
    'posts mais curtidos threads',
    'threads populares',
    'favstars threads',
    'analytics threads',
    'engajamento threads',
  ],
  authors: [{ name: 'Threads Ranking Contributors' }],
  creator: 'Threads Ranking',
  publisher: 'Threads Ranking',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Threads Ranking — Posts Mais Populares do Threads',
    description:
      'Descubra os posts mais populares de perfis públicos do Threads em segundos. Estatísticas de curtidas, comentários e velocidade de crescimento.',
    url: baseUrl,
    siteName: 'Threads Ranking',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Threads Ranking — Posts Mais Populares do Threads',
    description: 'Descubra os posts mais populares de perfis públicos do Threads em segundos.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen flex flex-col bg-[#101010] text-[#f3f5f7] antialiased">
        {/* Google Analytics 4 (quando configurado via NEXT_PUBLIC_GA_MEASUREMENT_ID) */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Header / Navbar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#101010]/90 border-b border-[#262626]">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Ir para a página inicial do Threads Ranking">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-extrabold text-lg tracking-tighter group-hover:scale-105 transition-transform">
                @
              </div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-neutral-300 transition-colors">
                Threads <span className="text-neutral-400 font-normal">Ranking</span>
              </span>
            </Link>

            <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium text-neutral-400" aria-label="Navegação principal">
              <Link href="/trending" className="hover:text-white transition-colors">
                Trending
              </Link>
              <Link href="/como-funciona" className="hidden sm:inline hover:text-white transition-colors">
                Como Funciona
              </Link>
              <Link href="/metodologia" className="hidden sm:inline hover:text-white transition-colors">
                Metodologia
              </Link>
              <Link href="/@rafaelost" className="hover:text-white transition-colors">
                Exemplo
              </Link>
            </nav>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
