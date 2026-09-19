import { MetadataRoute } from 'next';
import { env } from '@/config/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/@*',
          '/trending',
          '/sobre',
          '/como-funciona',
          '/metodologia',
          '/faq',
        ],
        disallow: [
          '/api/',
          '/profile/', // Evita indexação duplicada da rota de rewrite interna (canônica é /@username)
          '/_next/',
          '/admin/',
          '/internal/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
