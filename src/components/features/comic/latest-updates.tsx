"use client";

import React, { useEffect, useState } from "react";
import { ComicCard } from "./comic-card";
import { ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import { api } from "@shared/api";
import { Comic } from "@/lib/types";

export function LatestUpdates() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<{ data: Comic[] }>('/comics?sort=latest&limit=20');
        setComics(response.data.data);
      } catch (error) {
        console.error('Failed to fetch latest updates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-primary">
                Truyện Mới Cập Nhật
              </h2>
              <p className="text-sm text-text-muted">Đang tải...</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-lg bg-background-surface2" />
              <div className="mt-2 h-4 rounded bg-background-surface2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (comics.length === 0) {
    return (
      <section className="py-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-primary">
                Truyện Mới Cập Nhật
              </h2>
              <p className="text-sm text-text-muted">Chưa có truyện nào</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-background-surface1 py-12 text-center">
          <p className="text-text-secondary">Chưa có truyện nào trong hệ thống</p>
          <p className="mt-2 text-sm text-text-muted">Hãy thêm truyện vào database để bắt đầu</p>
        </div>
      </section>
    );
  }

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