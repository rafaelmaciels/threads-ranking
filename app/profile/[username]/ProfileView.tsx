'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Repeat,
  Quote,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { RankingMetric, ProfileRankingResult, RankedPost } from '@/domain/rankings/types';
import { trackEvent } from '@/lib/analytics';

const METRIC_TABS: { id: RankingMetric; label: string; icon: any }[] = [
  { id: 'likes', label: 'Mais curtidos', icon: Heart },
  { id: 'replies', label: 'Mais comentados', icon: MessageCircle },
  { id: 'reposts', label: 'Mais repostados', icon: Repeat },
  { id: 'quotes', label: 'Mais citados', icon: Quote },
  { id: 'recent', label: 'Mais recentes', icon: Clock },
  { id: 'growth', label: 'Maior crescimento', icon: TrendingUp },
];

function PostMediaImage({ src, alt }: { src?: string | null; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return null;
  }

  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    return null;
  }

  return (
    <div className="relative w-full max-h-[500px] overflow-hidden rounded-xl bg-[#101010] border border-[#222222] mb-4 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-auto max-h-[500px] object-cover rounded-xl transition-opacity duration-300"
      />
    </div>
  );
}

export function ProfileView({
  username,
  initialData,
}: {
  username: string;
  initialData?: ProfileRankingResult | null;
}) {
  const [metric, setMetric] = useState<RankingMetric>(initialData?.metric || 'likes');
  const [data, setData] = useState<ProfileRankingResult | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const [posts, setPosts] = useState<RankedPost[]>(initialData?.posts || []);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(initialData?.pagination.hasMore ?? false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isInitialMount = useRef(true);

  const fetchRanking = useCallback(
    async (targetMetric: RankingMetric, targetOffset = 0, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        const res = await fetch(
          `/api/profiles/${username}/ranking?metric=${targetMetric}&limit=20&offset=${targetOffset}`
        );
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || 'Falha ao buscar ranking do perfil');
        }

        setData(result);
        if (append) {
          setPosts((prev) => [...prev, ...result.posts]);
        } else {
          setPosts(result.posts);
        }
        setHasMore(result.pagination.hasMore);
        setOffset(targetOffset);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [username]
  );

  useEffect(() => {
    // Se recebemos dados do SSR no mount inicial para a mesma métrica, não refazemos fetch redundante
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (initialData && metric === (initialData.metric || 'likes')) {
        trackEvent('view_profile', { username, postsCount: initialData.posts.length });
        return;
      }
    }
    fetchRanking(metric, 0, false);
    trackEvent('ranking_filter', { username, metric });
  }, [metric, fetchRanking, initialData, username]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      trackEvent('refresh_profile', { username });
      const res = await fetch(`/api/profiles/${username}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deepSync: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Falha ao sincronizar perfil');
      }
      await fetchRanking(metric, 0, false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextOffset = offset + 20;
      fetchRanking(metric, nextOffset, true);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatDate = (dateString: Date | string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const currentProfile = data?.profile;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Breadcrumb Visual */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <span>/</span>
        <Link href="/trending" className="hover:text-white transition-colors">Perfis</Link>
        <span>/</span>
        <span className="text-neutral-300">@{username}</span>
      </nav>

      {/* Título Semântico H1 da Página */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {metric === 'replies'
            ? `Posts mais comentados de @${username}`
            : metric === 'reposts'
            ? `Posts mais repostados de @${username}`
            : metric === 'quotes'
            ? `Posts mais citados de @${username}`
            : metric === 'recent'
            ? `Posts mais recentes de @${username}`
            : metric === 'growth'
            ? `Posts com maior crescimento de @${username}`
            : `Posts mais curtidos de @${username}`}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {metric === 'replies'
            ? `Classificação histórica de postagens com maior volume de comentários de @${username}.`
            : metric === 'reposts'
            ? `Classificação das publicações mais compartilhadas e repostadas de @${username}.`
            : metric === 'quotes'
            ? `Classificação de publicações com maior número de citações de @${username}.`
            : metric === 'recent'
            ? `Linha do tempo das publicações mais recentes publicadas por @${username}.`
            : metric === 'growth'
            ? `Publicações com maior velocidade de crescimento de engajamento por hora de @${username}.`
            : `Classificação histórica de engajamento público, curtidas e repercussão no Threads.`}
        </p>
      </header>

      {/* Card do Perfil */}
      {currentProfile && (
        <section aria-label="Informações do Perfil" className="bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-neutral-800 border border-[#333333] flex-shrink-0">
              {currentProfile.profilePictureUrl && !imgError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={
                    currentProfile.profilePictureUrl.startsWith('http')
                      ? `/api/proxy/avatar?url=${encodeURIComponent(currentProfile.profilePictureUrl)}`
                      : currentProfile.profilePictureUrl
                  }
                  alt={`Avatar oficial de @${currentProfile.username}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={() => {
                    setImgError(true);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-neutral-400 bg-neutral-800">
                  {currentProfile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentProfile.name || currentProfile.username}
                </h2>
                {currentProfile.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" aria-label="Perfil Verificado" />
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <span className="font-semibold text-neutral-300">@{currentProfile.username}</span>
                <span>•</span>
                <Link
                  href={`https://threads.net/@${currentProfile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('click_threads', { username: currentProfile.username })}
                  className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Abrir no Threads <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {currentProfile.biography && (
                <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-xl leading-relaxed">
                  {currentProfile.biography}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mt-3">
                <span>{formatNumber(currentProfile.totalPostsIndexed)} posts indexados</span>
                {currentProfile.lastSyncedAt && (
                  <>
                    <span>•</span>
                    <span>Atualizado em: {new Date(currentProfile.lastSyncedAt).toLocaleString('pt-BR')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#202020] border border-[#333333] hover:border-neutral-500 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Atualizando...' : 'Atualizar Dados'}</span>
          </button>
        </section>
      )}

      {/* Tabs / Filtros de Métricas */}
      <section aria-label="Filtros de Métricas">
        <h2 className="sr-only">Filtros de Métricas</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#222222]">
          {METRIC_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = metric === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMetric(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#181818]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tratamento de Erros */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Não foi possível carregar o ranking</p>
            <p className="text-xs text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de Posts Rankeados */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-[#151515] border border-[#222222] animate-pulseSubtle"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 bg-[#141414] border border-[#222222] rounded-2xl">
          <p className="text-sm">Nenhum post indexado para este perfil ainda.</p>
          <button
            onClick={handleSync}
            className="mt-4 px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Sincronizar agora
          </button>
        </div>
      ) : (
        <section aria-label="Ranking de Publicações" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Posts ordenados por {METRIC_TABS.find((t) => t.id === metric)?.label.toLowerCase()}
            </h2>
            <span>Exibindo {posts.length} posts</span>
          </div>

          {posts.map((post) => {
            const isFirst = post.rank === 1;
            const isSecond = post.rank === 2;
            const isThird = post.rank === 3;

            const badgeIcon = isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `${post.rank}º`;

            return (
              <article
                key={post.id}
                className="group p-6 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#3a3a3a] transition-all"
              >
                {/* Título semântico oculto para robôs e leitores de tela */}
                <h3 className="sr-only">
                  {`Post #${post.rank} de @${username} - ${
                    metric === 'replies'
                      ? `${post.metrics.replies} comentários`
                      : metric === 'reposts'
                      ? `${post.metrics.reposts} reposts`
                      : metric === 'quotes'
                      ? `${post.metrics.quotes} citações`
                      : metric === 'recent'
                      ? `publicado em ${formatDate(post.publishedAt)}`
                      : metric === 'growth'
                      ? `crescimento de ${post.growthPerHour} likes por hora`
                      : `${post.metrics.likes} curtidas`
                  }`}
                </h3>

                {/* Cabeçalho do Post */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold" aria-hidden="true">{badgeIcon}</span>
                    <span className="text-lg font-extrabold text-white tracking-tight">
                      {metric === 'replies'
                        ? `${formatNumber(post.metrics.replies)} comentários`
                        : metric === 'reposts'
                        ? `${formatNumber(post.metrics.reposts)} reposts`
                        : metric === 'quotes'
                        ? `${formatNumber(post.metrics.quotes)} ${post.metrics.quotes === 1 ? 'citação' : 'citações'}`
                        : metric === 'growth' && post.growthPerHour !== undefined
                        ? `+${formatNumber(Math.round(post.growthPerHour))} likes/hora`
                        : metric === 'recent'
                        ? `Postado em ${formatDate(post.publishedAt)}`
                        : `${formatNumber(post.metrics.likes)} curtidas`}
                    </span>
                  </div>

                  <Link
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('view_post', { username, postId: post.id })}
                    className="text-xs text-neutral-500 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    Ver no Threads <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Texto do Post */}
                {post.text && (
                  <p className="text-sm text-neutral-200 leading-relaxed mb-4 whitespace-pre-line">
                    {post.text}
                  </p>
                )}

                {/* Imagem do Post (renderizada exclusivamente se possuir imagem e carregar com sucesso) */}
                {post.mediaUrl && (
                  <PostMediaImage
                    src={post.mediaUrl}
                    alt={
                      post.text
                        ? `Imagem da publicação: ${post.text.slice(0, 80)}`
                        : `Imagem do post #${post.rank} de @${username}`
                    }
                  />
                )}

                {/* Rodapé do Post */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#1f1f1f] text-xs text-neutral-400">
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center gap-1 transition-colors ${metric === 'likes' ? 'text-white font-bold' : ''}`} title="Curtidas">
                      <Heart className={`w-3.5 h-3.5 ${metric === 'likes' ? 'text-rose-500 fill-rose-500' : 'text-neutral-500'}`} />
                      {formatNumber(post.metrics.likes)}
                    </span>
                    <span className={`inline-flex items-center gap-1 transition-colors ${metric === 'replies' ? 'text-white font-bold' : ''}`} title="Respostas">
                      <MessageCircle className={`w-3.5 h-3.5 ${metric === 'replies' ? 'text-sky-400 fill-sky-400/20' : 'text-neutral-500'}`} />
                      {formatNumber(post.metrics.replies)}
                    </span>
                    <span className={`inline-flex items-center gap-1 transition-colors ${metric === 'reposts' ? 'text-white font-bold' : ''}`} title="Reposts">
                      <Repeat className={`w-3.5 h-3.5 ${metric === 'reposts' ? 'text-emerald-400' : 'text-neutral-500'}`} />
                      {formatNumber(post.metrics.reposts)}
                    </span>
                    <span className={`inline-flex items-center gap-1 transition-colors ${metric === 'quotes' ? 'text-white font-bold' : ''}`} title="Citações">
                      <Quote className={`w-3.5 h-3.5 ${metric === 'quotes' ? 'text-amber-400 fill-amber-400/20' : 'text-neutral-500'}`} />
                      {formatNumber(post.metrics.quotes)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Calendar className="w-3 h-3" />
                    <time dateTime={new Date(post.publishedAt).toISOString()}>{formatDate(post.publishedAt)}</time>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Botão Carregar Mais */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 rounded-xl bg-[#181818] border border-[#282828] hover:border-neutral-500 text-xs font-semibold text-white transition-all disabled:opacity-50"
              >
                {loadingMore ? 'Carregando mais...' : 'Carregar mais posts'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Metodologia e Links Relacionados */}
      <section className="pt-8 border-t border-neutral-800/80 text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p>
            Dados coletados de forma pública. Saiba mais na nossa{' '}
            <Link href="/metodologia" className="text-neutral-200 underline hover:text-white">
              Metodologia de Classificação
            </Link>.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/trending" className="text-neutral-300 hover:text-white transition-colors">
            Explorar outros perfis →
          </Link>
          <Link href="/faq" className="text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1">
            FAQ <HelpCircle className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
