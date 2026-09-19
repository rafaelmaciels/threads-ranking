import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpa registros anteriores para garantir idempotência do seed
  await prisma.syncJob.deleteMany();
  await prisma.postMetricSnapshot.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();

  // 1. Perfil Demo Principal
  const profileDemo = await prisma.profile.create({
    data: {
      username: 'demo',
      name: 'Demonstração Oficial',
      biography: 'Perfil de teste para o Threads Ranking. Mostrando os posts mais curtidos da plataforma.',
      profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isVerified: true,
      lastSyncedAt: new Date(),
    },
  });

  console.log(`✅ Perfil criado: @${profileDemo.username}`);

  // Posts do perfil @demo
  const postsData = [
    {
      threadsId: 'demo_post_1',
      profileId: profileDemo.id,
      text: 'O Threads Ranking é uma ferramenta incrível e open source! Descubra quais são os posts com maior número de curtidas na rede.',
      permalink: 'https://threads.net/@demo/post/demo_post_1',
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
      likeCount: 125430,
      replyCount: 3420,
      repostCount: 8900,
      quoteCount: 1200,
    },
    {
      threadsId: 'demo_post_2',
      profileId: profileDemo.id,
      text: 'Arquitetura limpa, banco relacional PostgreSQL, cache Redis e Next.js moderno. É assim que se constrói software de alta performance.',
      permalink: 'https://threads.net/@demo/post/demo_post_2',
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
      likeCount: 98210,
      replyCount: 1840,
      repostCount: 4500,
      quoteCount: 890,
    },
    {
      threadsId: 'demo_post_3',
      profileId: profileDemo.id,
      text: 'Lembrando dos tempos do Favstars no Twitter antigo! Essa nostalgia com dados em tempo real é sensacional.',
      permalink: 'https://threads.net/@demo/post/demo_post_3',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
      likeCount: 76840,
      replyCount: 950,
      repostCount: 3100,
      quoteCount: 450,
    },
    {
      threadsId: 'demo_post_4',
      profileId: profileDemo.id,
      text: 'Qual o post com maior engajamento que você já publicou no Threads? Deixe aqui nos comentários!',
      permalink: 'https://threads.net/@demo/post/demo_post_4',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      likeCount: 54120,
      replyCount: 5200, // Alto em replies
      repostCount: 1200,
      quoteCount: 600,
    },
    {
      threadsId: 'demo_post_5',
      profileId: profileDemo.id,
      text: 'Post recente viralizando agora! Observem a taxa de crescimento por hora nos gráficos do ranking.',
      permalink: 'https://threads.net/@demo/post/demo_post_5',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      likeCount: 32000,
      replyCount: 850,
      repostCount: 4100,
      quoteCount: 350,
    },
    {
      threadsId: 'demo_post_6',
      profileId: profileDemo.id,
      text: 'Dica rápida de TypeScript: utilize Discriminated Unions e Zod para validar payloads em runtime sem perder segurança de tipos.',
      permalink: 'https://threads.net/@demo/post/demo_post_6',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      likeCount: 18900,
      replyCount: 310,
      repostCount: 1540,
      quoteCount: 120,
    },
  ];

  for (const post of postsData) {
    const createdPost = await prisma.post.create({ data: post });

    // Cria snapshots de métricas históricos para simular crescimento
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const now = new Date();

    // Snapshot anterior (com menos likes)
    await prisma.postMetricSnapshot.create({
      data: {
        postId: createdPost.id,
        likeCount: Math.floor(post.likeCount * 0.75),
        replyCount: Math.floor(post.replyCount * 0.8),
        repostCount: Math.floor(post.repostCount * 0.7),
        quoteCount: Math.floor(post.quoteCount * 0.7),
        capturedAt: sixHoursAgo,
      },
    });

    // Snapshot atual
    await prisma.postMetricSnapshot.create({
      data: {
        postId: createdPost.id,
        likeCount: post.likeCount,
        replyCount: post.replyCount,
        repostCount: post.repostCount,
        quoteCount: post.quoteCount,
        capturedAt: now,
      },
    });
  }

  // 2. Perfil @zuck
  const profileZuck = await prisma.profile.create({
    data: {
      username: 'zuck',
      name: 'Mark Zuckerberg',
      biography: 'Building Meta and open source AI.',
      profilePictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      isVerified: true,
      lastSyncedAt: new Date(),
    },
  });

  const zuckPosts = [
    {
      threadsId: 'zuck_post_1',
      profileId: profileZuck.id,
      text: 'Threads reached 200M monthly active users today. Thank you all for making this community vibrant!',
      permalink: 'https://threads.net/@zuck/post/zuck_post_1',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      likeCount: 450000,
      replyCount: 28000,
      repostCount: 35000,
      quoteCount: 12000,
    },
    {
      threadsId: 'zuck_post_2',
      profileId: profileZuck.id,
      text: 'Working on next generation open source frontier models. More coming soon.',
      permalink: 'https://threads.net/@zuck/post/zuck_post_2',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      likeCount: 310000,
      replyCount: 15400,
      repostCount: 22000,
      quoteCount: 6500,
    },
  ];

  for (const post of zuckPosts) {
    const created = await prisma.post.create({ data: post });
    await prisma.postMetricSnapshot.create({
      data: {
        postId: created.id,
        likeCount: post.likeCount,
        replyCount: post.replyCount,
        repostCount: post.repostCount,
        quoteCount: post.quoteCount,
        capturedAt: new Date(),
      },
    });
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
