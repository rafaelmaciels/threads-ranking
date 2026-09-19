import { describe, it, expect } from 'vitest';
import {
  generateWebsiteSchema,
  generateProfileSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  getBaseUrl,
} from '@/lib/seo';
import robots from '../../app/robots';
import sitemap from '../../app/sitemap';
import { generateMetadata as generateProfileMetadata } from '../../app/profile/[username]/page';

describe('SEO Architecture & Automated Integrity Tests', () => {
  describe('Schema.org JSON-LD Generators', () => {
    it('deve gerar WebSite Schema válido com SearchAction', () => {
      const schema = generateWebsiteSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('Threads Ranking');
      expect(schema.url).toBe(getBaseUrl());
      expect(schema.potentialAction['@type']).toBe('SearchAction');
      expect(schema.potentialAction.target).toContain('/@{search_term_string}');
    });

    it('deve gerar ProfilePage Schema com Person e SocialMediaPosting', () => {
      const mockPosts = [
        {
          id: 'post-1',
          externalId: 'ext-1',
          caption: 'Primeiro post de teste',
          text: 'Primeiro post de teste',
          likeCount: 500,
          replyCount: 50,
          repostCount: 20,
          quoteCount: 5,
          publishedAt: new Date('2026-01-01T12:00:00Z'),
          rank: 1,
          permalink: 'https://threads.net/post/1',
          metrics: { likes: 500, replies: 50, reposts: 20, quotes: 5 },
        },
      ];

      const schema = generateProfileSchema({
        username: 'rafaelost',
        name: 'Rafael Maciel',
        biography: 'Bio de teste',
        profilePictureUrl: 'https://cdn.example.com/avatar.jpg',
        posts: mockPosts as any,
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('ProfilePage');
      expect(schema.mainEntity['@type']).toBe('Person');
      expect(schema.mainEntity.name).toBe('Rafael Maciel');
      expect(schema.mainEntity.identifier).toBe('rafaelost');
      expect(schema.mainEntity.sameAs).toContain('https://www.threads.net/@rafaelost');

      expect(schema.hasPart).toHaveLength(1);
      expect(schema.hasPart[0]['@type']).toBe('SocialMediaPosting');
      expect(schema.hasPart[0].headline).toBe('Primeiro post de teste');
      expect(schema.hasPart[0].interactionStatistic[0].userInteractionCount).toBe(500);
    });

    it('deve gerar BreadcrumbList Schema hierárquico correto', () => {
      const schema = generateBreadcrumbSchema([
        { name: 'Início', url: '/' },
        { name: 'Trending', url: '/trending' },
        { name: '@rafaelost', url: '/@rafaelost' },
      ]);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[2].item).toContain('/@rafaelost');
    });

    it('deve gerar FAQPage Schema válido', () => {
      const schema = generateFaqSchema([
        { question: 'Pergunta 1?', answer: 'Resposta 1.' },
      ]);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity[0].name).toBe('Pergunta 1?');
      expect(schema.mainEntity[0].acceptedAnswer.text).toBe('Resposta 1.');
    });
  });

  describe('Robots.txt Directives', () => {
    it('deve permitir páginas públicas e bloquear /api/ e rotas internas', () => {
      const result = robots();
      const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;

      expect(rules.allow).toContain('/');
      expect(rules.allow).toContain('/trending');
      expect(rules.allow).toContain('/metodologia');

      expect(rules.disallow).toContain('/api/');
      expect(rules.disallow).toContain('/profile/');
      expect(result.sitemap).toContain('/sitemap.xml');
    });
  });

  describe('Sitemap Integrity', () => {
    it('deve conter rotas institucionais e canônicas sem duplicatas', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      // Nenhuma URL duplicada
      const uniqueUrls = new Set(urls);
      expect(uniqueUrls.size).toBe(urls.length);

      // Deve conter rotas essenciais
      const baseUrl = getBaseUrl();
      expect(urls).toContain(`${baseUrl}/`);
      expect(urls).toContain(`${baseUrl}/trending`);
      expect(urls).toContain(`${baseUrl}/sobre`);
      expect(urls).toContain(`${baseUrl}/como-funciona`);
      expect(urls).toContain(`${baseUrl}/metodologia`);
      expect(urls).toContain(`${baseUrl}/faq`);

      // Nenhuma URL deve conter query params ou /api/
      for (const url of urls) {
        expect(url).not.toContain('?');
        expect(url).not.toContain('/api/');
      }
    });
  });

  describe('Dynamic Profile Metadata & Canonical', () => {
    it('deve gerar title único, description relevante e canonical estrita', async () => {
      const meta = await generateProfileMetadata({
        params: Promise.resolve({ username: 'demo' }),
      });

      expect(meta.title).toBeDefined();
      expect(typeof meta.title).toBe('string');
      expect(meta.title).toContain('Posts mais curtidos');

      expect(meta.description).toBeDefined();
      expect(typeof meta.description).toBe('string');
      expect((meta.description as string).length).toBeGreaterThan(20);

      // Canonical sem parâmetros ou query string
      expect(meta.alternates?.canonical).toBe('/@demo');

      // Open Graph e Twitter Cards
      expect(meta.openGraph?.title).toBeDefined();
      expect((meta.twitter as any)?.card).toBe('summary_large_image');
    });
  });
});
