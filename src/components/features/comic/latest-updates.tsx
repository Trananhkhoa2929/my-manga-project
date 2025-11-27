"use client";

import React from "react";
import { ComicCard } from "./comic-card";
import { getRecentUpdates } from "@/lib/mock-data/comics";

export function LatestUpdates() {
  const comics = getRecentUpdates(20);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          🔥 Truyện Mới Cập Nhật
        </h2>
        <a
          href="/tim-kiem"
          className="text-sm text-accent-brand hover:underline"
        >
          Xem tất cả →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {comics.map((comic) => (
          <ComicCard key={comic.id} comic={comic} variant="nettruyen" />
        ))}
      </div>
    </section>
  );
}