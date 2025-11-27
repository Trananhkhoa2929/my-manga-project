"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, Eye, Heart, Star, TrendingUp } from "lucide-react";
import { getTopComics } from "@/lib/mock-data/comics";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

type RankingTab = "views" | "followers" | "rating";
type TimeRange = "day" | "week" | "month" | "all";

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<RankingTab>("views");
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  const topComics = getTopComics(50);

  const tabs: { key: RankingTab; label: string; icon: React.ReactNode }[] = [
    { key: "views", label: "Lượt xem", icon: <Eye className="h-4 w-4" /> },
    { key: "followers", label: "Theo dõi", icon: <Heart className="h-4 w-4" /> },
    { key: "rating", label: "Đánh giá", icon: <Star className="h-4 w-4" /> },
  ];

  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: "day", label: "Ngày" },
    { key: "week", label: "Tuần" },
    { key: "month", label: "Tháng" },
    { key: "all", label: "Tất cả" },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-white">
          1
        </span>
      );
    if (rank === 2)
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-sm font-bold text-white">
          2
        </span>
      );
    if (rank === 3)
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
          3
        </span>
      );
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background-surface2 text-sm font-medium text-text-secondary">
        {rank}
      </span>
    );
  };

  const getStatValue = (comic: (typeof topComics)[0]) => {
    switch (activeTab) {
      case "views":
        return formatNumber(comic.totalViews);
      case "followers":
        return formatNumber(comic.followers);
      case "rating":
        return comic.rating. toFixed(1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent-utility/20 px-4 py-1 text-sm font-medium text-accent-utility">
          <Trophy className="h-4 w-4" />
          Bảng Xếp Hạng
        </div>
        <h1 className="text-3xl font-bold text-text-primary">
          Top Truyện Tranh Hot Nhất
        </h1>
        <p className="mt-2 text-text-secondary">
          Xem thống kê và khám phá các bộ truyện được yêu thích nhất
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex rounded-lg bg-background-surface1 p-1">
          {tabs. map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab. key
                  ?  "bg-accent-brand text-white"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg bg-background-surface1 p-1">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key)}
              className={cn(
                "rounded-md px-3 py-1. 5 text-sm font-medium transition-colors",
                timeRange === range.key
                  ? "bg-accent-utility text-white"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking List */}
      <div className="rounded-lg bg-background-surface1">
        {/* Top 3 Featured */}
        <div className="grid gap-4 border-b border-border p-6 md:grid-cols-3">
          {topComics.slice(0, 3).map((comic, index) => (
            <Link
              key={comic.id}
              href={`/truyen/${comic.slug}`}
              className={cn(
                "group relative overflow-hidden rounded-xl p-4 transition-all hover:scale-[1.02]",
                index === 0
                  ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 md:col-span-1"
                  : index === 1
                  ? "bg-gradient-to-br from-gray-400/20 to-gray-500/10"
                  : "bg-gradient-to-br from-amber-600/20 to-amber-700/10"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={comic.thumbnail}
                    alt={comic.title}
                    className="h-24 w-18 rounded-lg object-cover"
                  />
                  <div className="absolute -left-2 -top-2">
                    {getRankBadge(index + 1)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary group-hover:text-accent-brand">
                    {comic.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {comic.authors.join(", ")}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-sm font-medium text-accent-brand">
                    <TrendingUp className="h-4 w-4" />
                    {getStatValue(comic)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Rest of the list */}
        <div className="divide-y divide-border">
          {topComics.slice(3).map((comic, index) => (
            <Link
              key={comic.id}
              href={`/truyen/${comic.slug}`}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-background-surface2"
            >
              {getRankBadge(index + 4)}
              <img
                src={comic.thumbnail}
                alt={comic.title}
                className="h-16 w-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium text-text-primary">
                  {comic.title}
                </h4>
                <p className="text-sm text-text-secondary">
                  {comic.genres.slice(0, 2).map((g) => g.name).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-accent-brand">
                  {getStatValue(comic)}
                </p>
                <p className="text-xs text-text-muted">
                  {activeTab === "views"
                    ? "lượt xem"
                    : activeTab === "followers"
                    ? "theo dõi"
                    : "điểm"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}