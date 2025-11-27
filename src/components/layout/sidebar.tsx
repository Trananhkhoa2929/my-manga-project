"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Clock, Flame, TrendingUp, X } from "lucide-react";
import { getTopComics } from "@/lib/mock-data/comics";
import { formatNumber } from "@/lib/utils";
import { useReadingHistory } from "@/hooks/use-reading-history";

type RankingTab = "day" | "week" | "month";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<RankingTab>("day");
  const { history, removeFromHistory, clearHistory } = useReadingHistory();
  const topComics = getTopComics(10);

  const tabs: { key: RankingTab; label: string }[] = [
    { key: "day", label: "Ngày" },
    { key: "week", label: "Tuần" },
    { key: "month", label: "Tháng" },
  ];

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-yellow-500";
    if (index === 1) return "bg-gray-400";
    if (index === 2) return "bg-amber-600";
    return "bg-background-surface2";
  };

  return (
    <aside className="space-y-6">
      {/* Reading History Widget */}
      {history.length > 0 && (
        <div className="rounded-lg bg-background-surface1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-text-primary">
              <Clock className="h-4 w-4 text-accent-brand" />
              Lịch Sử Đọc
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-text-muted hover:text-accent-hot"
            >
              Xóa tất cả
            </button>
          </div>
          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.comicId}
                className="group flex items-center gap-3"
              >
                <Link
                  href={`/truyen/${item.comicSlug}`}
                  className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded"
                >
                  <img
                    src={item.comicThumbnail}
                    alt={item.comicTitle}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/truyen/${item.comicSlug}`}
                    className="block truncate text-sm font-medium text-text-primary hover:text-accent-brand"
                  >
                    {item.comicTitle}
                  </Link>
                  <Link
                    href={`/truyen/${item.comicSlug}/chap/${item.chapterId}`}
                    className="text-xs text-text-secondary hover:text-accent-brand"
                  >
                    Chap {item. chapterNumber}
                  </Link>
                </div>
                <button
                  onClick={() => removeFromHistory(item.comicId)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-text-muted hover:text-accent-hot" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking Widget */}
      <div className="rounded-lg bg-background-surface1 p-4">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-text-primary">
          <Trophy className="h-4 w-4 text-accent-utility" />
          Bảng Xếp Hạng
        </h3>

        {/* Tabs */}
        <div className="mb-4 flex rounded-lg bg-background-surface2 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab. key)}
              className={`flex-1 rounded-md px-3 py-1. 5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-accent-brand text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ranking List */}
        <div className="space-y-3">
          {topComics.map((comic, index) => (
            <Link
              key={comic.id}
              href={`/truyen/${comic.slug}`}
              className="flex items-center gap-3 group"
            >
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-white ${getRankColor(
                  index
                )}`}
              >
                {index + 1}
              </span>
              <div className="relative h-10 w-8 flex-shrink-0 overflow-hidden rounded">
                <img
                  src={comic.thumbnail}
                  alt={comic.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary group-hover:text-accent-brand">
                  {comic. title}
                </p>
                <p className="flex items-center gap-1 text-xs text-text-muted">
                  <TrendingUp className="h-3 w-3" />
                  {formatNumber(comic.totalViews)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}