import { MetadataRoute } from 'next';
import { prisma } from '@/database/prisma';
import { env } from '@/config/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();

  // Rotas institucionais e editoriais de alto valor
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/como-funciona`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/metodologia`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    // Apenas perfis reais com posts indexados (garantia contra thin content no sitemap)
    const profiles = await prisma.profile.findMany({
      where: {
        posts: {
          some: {},
        },
      },
      select: { username: true, updatedAt: true },
      take: 1000,
      orderBy: { updatedAt: 'desc' },
    });

    const profileRoutes: MetadataRoute.Sitemap = profiles.map((p) => ({
      url: `${baseUrl}/@${p.username}`,
      lastModified: p.updatedAt || now,
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    return [...staticRoutes, ...profileRoutes];
  } catch {
    // Fallback gracioso com perfis padrão caso banco de dados esteja offline
    const fallbackProfiles: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/@rafaelost`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/@demo`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ];
    return [...staticRoutes, ...fallbackProfiles];
  }
}
