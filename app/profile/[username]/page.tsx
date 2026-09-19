import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProfileView } from './ProfileView';
import { RankingService } from '@/services/rankingService';
import { generateProfileSchema, generateBreadcrumbSchema, getBaseUrl } from '@/lib/seo';
import { ProfileRankingResult } from '@/domain/rankings/types';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const clean = rawUsername.replace(/^@/, '');

  try {
    const data = await RankingService.getProfileRanking(clean, 'likes', { limit: 20 });
    const profile = data.profile;
    const displayName = profile.name ? `${profile.name} (@${clean})` : `@${clean}`;
    const totalLikes = data.posts.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0);

    const title = `Posts mais curtidos de ${displayName} | Threads Ranking`;
    const description = `Confira os posts mais curtidos e populares de @${clean} no Threads com ${
      totalLikes > 0 ? `${totalLikes.toLocaleString('pt-BR')} curtidas acumuladas e ` : ''
    }${profile.totalPostsIndexed} publicações analisadas.`;

    const hasEnoughContent = data.posts.length > 0;
    const baseUrl = getBaseUrl();

    return {
      title,
      description,
      alternates: {
        canonical: `/@${clean}`,
      },
      robots: {
        index: hasEnoughContent,
        follow: true,
      },
      openGraph: {
        title,
        description,
        url: `${baseUrl}/@${clean}`,
        type: 'profile',
        images: profile.profilePictureUrl
          ? [{ url: profile.profilePictureUrl, alt: `Avatar de @${clean}` }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: profile.profilePictureUrl ? [profile.profilePictureUrl] : [],
      },
    };
  } catch {
    return {
      title: 'Perfil não encontrado | Threads Ranking',
      description: 'O perfil solicitado não foi encontrado no Threads ou não possui publicações públicas disponíveis.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username: rawUsername } = await params;
  const clean = decodeURIComponent(rawUsername).replace(/^@/, '');

  let initialData: ProfileRankingResult | null = null;
  try {
    initialData = await RankingService.getProfileRanking(clean, 'likes', { limit: 20 });
  } catch (err: any) {
    if (
      err?.code === 'PROFILE_NOT_FOUND' ||
      err?.code === 'PROVIDER_NOT_FOUND_ERROR' ||
      err?.statusCode === 404
    ) {
      notFound();
    }
  }

  const profileSchema = initialData?.profile
    ? generateProfileSchema({
        username: clean,
        name: initialData.profile.name,
        biography: initialData.profile.biography,
        profilePictureUrl: initialData.profile.profilePictureUrl,
        posts: initialData.posts,
      })
    : null;

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: 'Início', url: '/' },
    { name: 'Trending', url: '/trending' },
    { name: `@${clean}`, url: `/@${clean}` },
  ]);

  return (
    <>
      {profileSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <ProfileView username={clean} initialData={initialData} />
    </>
  );
}
