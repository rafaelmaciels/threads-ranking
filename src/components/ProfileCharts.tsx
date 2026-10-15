'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart2,
  PieChart,
  Heart,
  MessageCircle,
  Repeat,
  Quote,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RankedPost, RankingMetric } from '@/domain/rankings/types';

interface ProfileChartsProps {
  posts: RankedPost[];
  activeMetric: RankingMetric;
  username: string;
}

export function ProfileCharts({ posts, activeMetric, username }: ProfileChartsProps) {
  const [collapsed, setCollapsed] = useState(false);

  // 1. Cálculos para o Mix de Engajamento (Donut)
  const totals = useMemo(() => {
    let likes = 0;
    let replies = 0;
    let reposts = 0;
    let quotes = 0;

    for (const post of posts) {
      likes += post.metrics.likes || 0;
      replies += post.metrics.replies || 0;
      reposts += post.metrics.reposts || 0;
      quotes += post.metrics.quotes || 0;
    }

    const grandTotal = likes + replies + reposts + quotes;

    return {
      likes,
      replies,
      reposts,
      quotes,
      grandTotal: Math.max(1, grandTotal),
    };
  }, [posts]);

  // Proporções para o SVG Donut
  const donutSlices = useMemo(() => {
    const { likes, replies, reposts, quotes, grandTotal } = totals;
    const circumference = 2 * Math.PI * 40; // raio 40 => circunferência ~251.32

    const pLikes = (likes / grandTotal) * circumference;
    const pReplies = (replies / grandTotal) * circumference;
    const pReposts = (reposts / grandTotal) * circumference;
    const pQuotes = (quotes / grandTotal) * circumference;

    let offset = 0;
    const sliceLikes = { len: pLikes, offset, color: '#f43f5e', label: 'Curtidas', val: likes, pct: Math.round((likes / grandTotal) * 100) };
    offset += pLikes;
    const sliceReplies = { len: pReplies, offset, color: '#38bdf8', label: 'Comentários', val: replies, pct: Math.round((replies / grandTotal) * 100) };
    offset += pReplies;
    const sliceReposts = { len: pReposts, offset, color: '#34d399', label: 'Reposts', val: reposts, pct: Math.round((reposts / grandTotal) * 100) };
    offset += pReposts;
    const sliceQuotes = { len: pQuotes, offset, color: '#fbbf24', label: 'Citações', val: quotes, pct: Math.round((quotes / grandTotal) * 100) };

    return [sliceLikes, sliceReplies, sliceReposts, sliceQuotes];
  }, [totals]);

  // 2. Top 5 posts para o Gráfico de Barras Horizontais
  const topFive = useMemo(() => {
    return posts.slice(0, 5);
  }, [posts]);

  const maxVal = useMemo(() => {
    if (topFive.length === 0) return 1;
    return Math.max(
      1,
      ...topFive.map((p) => {
        if (activeMetric === 'replies') return p.metrics.replies;
        if (activeMetric === 'reposts') return p.metrics.reposts;
        if (activeMetric === 'quotes') return p.metrics.quotes;
        if (activeMetric === 'growth' && p.growthPerHour !== undefined) return p.growthPerHour;
        return p.metrics.likes;
      })
    );
  }, [topFive, activeMetric]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  };

  const getMetricLabel = () => {
    switch (activeMetric) {
      case 'replies':
        return 'comentários';
      case 'reposts':
        return 'reposts';
      case 'quotes':
        return 'citações';
      case 'growth':
        return 'likes/hora';
      case 'recent':
        return 'likes';
      case 'likes':
      default:
        return 'curtidas';
    }
  };

  const getMetricColor = () => {
    switch (activeMetric) {
      case 'replies':
        return 'from-sky-500 to-sky-400';
      case 'reposts':
        return 'from-emerald-500 to-emerald-400';
      case 'quotes':
        return 'from-amber-500 to-amber-400';
      case 'growth':
        return 'from-purple-500 to-indigo-400';
      case 'likes':
      default:
        return 'from-rose-500 to-rose-400';
    }
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Painel de Visualização de Dados e Estatísticas"
      className="bg-[#121212] border border-[#242424] rounded-2xl p-5 sm:p-6 transition-all shadow-xl"
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#202020]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Análise Visual de Desempenho
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                Data Viz
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Proporções e comparativo de impacto público de @{username}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2c2c2c] transition-colors"
          title={collapsed ? 'Expandir gráficos' : 'Recolher gráficos'}
        >
          <span>{collapsed ? 'Exibir' : 'Ocultar'}</span>
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 animate-fadeIn">
          {/* Gráfico 1: Top 5 Posts (Barras Horizontais) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-neutral-400" />
                Top 5 Posts ({getMetricLabel()})
              </span>
              <span className="text-[11px] text-neutral-500">Classificação relativa</span>
            </div>

            <div className="space-y-3">
              {topFive.map((p, idx) => {
                const val =
                  activeMetric === 'replies'
                    ? p.metrics.replies
                    : activeMetric === 'reposts'
                    ? p.metrics.reposts
                    : activeMetric === 'quotes'
                    ? p.metrics.quotes
                    : activeMetric === 'growth' && p.growthPerHour !== undefined
                    ? Math.round(p.growthPerHour)
                    : p.metrics.likes;

                const percent = Math.max(8, Math.round((val / maxVal) * 100));
                const badge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

                return (
                  <div key={p.id} className="group text-xs">
                    <div className="flex items-center justify-between text-neutral-300 mb-1 gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-xs" aria-hidden="true">{badge}</span>
                        <span className="truncate text-neutral-300 group-hover:text-white transition-colors">
                          {p.text ? p.text.slice(0, 48) + '...' : `Publicação #${p.rank}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-bold text-white font-mono">{formatNumber(val)}</span>
                        <Link
                          href={p.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-500 hover:text-white transition-colors"
                          title="Abrir no Threads"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Barra de Progresso com Gradiente */}
                    <div className="w-full h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#2a2a2a]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${getMetricColor()} transition-all duration-700 ease-out`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico 2: Mix de Engajamento Geral (Donut SVG) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-[#161616] border border-[#252525]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-neutral-400" />
                Mix de Engajamento
              </span>
              <span className="text-[11px] text-neutral-500">Distribuição</span>
            </div>

            <div className="flex items-center justify-center gap-6 py-2">
              {/* SVG Donut */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#222222"
                    strokeWidth="12"
                  />
                  {donutSlices.map((slice, i) => {
                    const circumference = 2 * Math.PI * 40;
                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="12"
                        strokeDasharray={`${slice.len} ${circumference}`}
                        strokeDashoffset={-slice.offset}
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>

                {/* Texto Central */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {formatNumber(totals.grandTotal)}
                  </span>
                  <span className="text-[9px] text-neutral-400 uppercase tracking-wider">Total</span>
                </div>
              </div>

              {/* Legenda do Donut */}
              <div className="space-y-1.5 text-[11px] flex-1">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Curtidas
                  </span>
                  <span className="font-semibold text-white">{donutSlices[0].pct}%</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Respostas
                  </span>
                  <span className="font-semibold text-white">{donutSlices[1].pct}%</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Reposts
                  </span>
                  <span className="font-semibold text-white">{donutSlices[2].pct}%</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Citações
                  </span>
                  <span className="font-semibold text-white">{donutSlices[3].pct}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
