"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Clock, TrendingUp, X, Crown, Medal, Award, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useReadingHistory } from "@/hooks/use-reading-history";
import { cn } from "@/lib/utils";
import { api } from "@shared/api";

interface TopComic {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  totalViews: number;
}

type RankingTab = "day" | "week" | "month";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<RankingTab>("day");
  const { history, removeFromHistory, clearHistory } = useReadingHistory();
  const [topComics, setTopComics] = useState<TopComic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopComics = async () => {
      try {
        const response = await api.get<{ data: TopComic[] }>('/comics?sort=views&limit=10');
        setTopComics(response.data.data);
      } catch (error) {
        console.error('Failed to fetch top comics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopComics();
  }, []);

  const tabs: { key: RankingTab; label: string; icon: React.ReactNode }[] = [
    { key: "day", label: "Ngày", icon: "📅" },
    { key: "week", label: "Tuần", icon: "📆" },
    { key: "month", label: "Tháng", icon: "🗓️" },
  ];

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-4 w-4 text-yellow-400" />;
    if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Award className="h-4 w-4 text-amber-600" />;
    return null;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30";
    if (index === 1) return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30";
    if (index === 2) return "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30";
    return "bg-background-surface2 text-text-muted";
  };

  return (
    <aside className="space-y-6">
      {/* Reading History Widget */}
      {history.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-background-surface1 to-background-surface1/50 backdrop-blur-sm">
          <div className="border-b border-border bg-background-surface2/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-text-primary">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                Lịch Sử Đọc
              </h3>
              <button
                onClick={clearHistory}
                className="rounded-lg px-2 py-1 text-xs text-text-muted transition-colors hover:bg-red-500/20 hover:text-red-400"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.comicId}
                className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-background-surface2"
              >
                <Link
                  href={`/truyen/${item.comicSlug}`}
                  className="relative h-14 w-11 flex-shrink-0 overflow-hidden rounded-lg shadow-lg"
                >
                  <img
                    src={item.comicThumbnail}
                    alt={item.comicTitle}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/truyen/${item.comicSlug}`}
                    className="block truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-brand"
                  >
                    {item.comicTitle}
                  </Link>
                  <Link
                    href={`/truyen/${item.comicSlug}/chap/${item.chapterId}`}
                    className="inline-flex items-center gap-1 rounded-md bg-accent-brand/10 px-2 py-0.5 text-xs font-medium text-accent-brand"
                  >
                    Chap {item.chapterNumber}
                  </Link>
                </div>
                <button
                  onClick={() => removeFromHistory(item.comicId)}
                  className="rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4 text-text-muted hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking Widget */}
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-background-surface1 to-background-surface1/50 backdrop-blur-sm">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-3">
          <h3 className="flex items-center gap-2 font-bold text-text-primary">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Bảng Xếp Hạng
            </span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </h3>
        </div>

        {/* Tabs */}
        <div className="border-b border-border p-2">
          <div className="flex rounded-xl bg-background-surface2 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-text-secondary hover:text-text-primary hover:bg-background-surface1"
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ranking List */}
        <div className="p-4 space-y-2">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-background-surface2" />
                <div className="h-12 w-10 rounded-lg bg-background-surface2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-background-surface2" />
                  <div className="h-3 w-1/2 rounded bg-background-surface2" />
                </div>
              </div>
            ))
          ) : topComics.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <p>Chưa có truyện nào</p>
            </div>
          ) : (
            topComics.map((comic, index) => (
              <Link
                key={comic.id}
                href={`/truyen/${comic.slug}`}
                className="group flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-background-surface2"
              >
                {/* Rank Badge */}
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                    getRankStyle(index)
                  )}
                >
                  {index < 3 ? (
                    getRankIcon(index)
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Thumbnail */}
                <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
                  <img
                    src={comic.thumbnail}
                    alt={comic.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-brand">
                    {comic.title}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-text-muted">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-green-400 font-medium">{formatNumber(comic.totalViews)}</span>
                    <span>lượt xem</span>
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}