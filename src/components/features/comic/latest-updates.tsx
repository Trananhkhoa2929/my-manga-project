"use client";

import React from "react";
import { ComicCard } from "./comic-card";
import { getRecentUpdates } from "@/lib/mock-data/comics";
import { ChevronRight, Flame } from "lucide-react";
import Link from "next/link";

export function LatestUpdates() {
  const comics = getRecentUpdates(20);

  return (
    <section className="py-6">
      {/* Section Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-primary">
              Truyện Mới Cập Nhật
            </h2>
            <p className="text-sm text-text-muted">Cập nhật mới nhất hôm nay</p>
          </div>
        </div>
        <Link
          href="/tim-kiem"
          className="group flex items-center gap-1 rounded-lg bg-background-surface2 px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-accent-brand hover:text-white"
        >
          Xem tất cả
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {comics.map((comic) => (
          <ComicCard key={comic.id} comic={comic} variant="nettruyen" />
        ))}
      </div>
    </section>
  );
}