import { env } from '@/config/env';
import { RankedPost } from '@/domain/rankings/types';

export function getBaseUrl(): string {
  return (env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/**
 * Schema.org WebSite com busca interativa (SearchAction)
 */
export function generateWebsiteSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Threads Ranking',
    url: baseUrl,
    description: 'Descubra os posts mais populares de qualquer perfil público do Threads.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/@{search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Schema.org ProfilePage + Person + SocialMediaPosting
 */
export function generateProfileSchema(profile: {
  username: string;
  name?: string | null;
  biography?: string | null;
  profilePictureUrl?: string | null;
  posts: RankedPost[];
}) {
  const baseUrl = getBaseUrl();
  const profileUrl = `${baseUrl}/@${profile.username}`;
  const originalThreadsUrl = `https://www.threads.net/@${profile.username}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.name || profile.username,
      alternateName: `@${profile.username}`,
      identifier: profile.username,
      description: profile.biography || `Perfil público de @${profile.username} no Threads`,
      image: profile.profilePictureUrl || undefined,
      url: profileUrl,
      sameAs: [originalThreadsUrl],
      interactionStatistic: [
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/LikeAction',
          userInteractionCount: profile.posts.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0),
        },
      ],
    },
    hasPart: profile.posts.slice(0, 10).map((post) => ({
      '@type': 'SocialMediaPosting',
      headline: post.text ? post.text.substring(0, 100) : `Post de @${profile.username}`,
      articleBody: post.text || '',
      datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      url: post.permalink || `${originalThreadsUrl}/post/${post.id}`,
      interactionStatistic: [
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/LikeAction',
          userInteractionCount: post.metrics?.likes || 0,
        },
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/CommentAction',
          userInteractionCount: post.metrics?.replies || 0,
        },
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/ShareAction',
          userInteractionCount: post.metrics?.reposts || 0,
        },
      ],
    })),
  };
}

/**
 * Schema.org BreadcrumbList
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Schema.org FAQPage
 */
export function generateFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
