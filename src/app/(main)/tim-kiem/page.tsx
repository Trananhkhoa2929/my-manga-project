"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, X, Check } from "lucide-react";
import { ComicCard } from "@/components/features/comic/comic-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GENRES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { api } from "@shared/api";
import { Comic } from "@/lib/types";

type FilterState = "include" | "exclude" | "none";
type SortOption = "latest" | "views" | "followers" | "rating";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilters, setGenreFilters] = useState<Record<string, FilterState>>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [showFilters, setShowFilters] = useState(true);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch comics from API
  useEffect(() => {
    const fetchComics = async () => {
      try {
        setLoading(true);
        let url = `/comics?sort=${sortBy}&limit=100`;
        if (searchQuery) {
          url += `&q=${encodeURIComponent(searchQuery)}`;
        }
        if (statusFilter !== "all") {
          url += `&status=${statusFilter}`;
        }
        const response = await api.get<{ data: Comic[] }>(url);
        setComics(response.data.data);
      } catch (error) {
        console.error('Failed to fetch comics:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchComics, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, sortBy, statusFilter]);

  // Toggle genre filter (tri-state: none -> include -> exclude -> none)
  const toggleGenreFilter = (genreId: string) => {
    setGenreFilters((prev) => {
      const current = prev[genreId] || "none";
      let next: FilterState;
      if (current === "none") next = "include";
      else if (current === "include") next = "exclude";
      else next = "none";

      if (next === "none") {
        const { [genreId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [genreId]: next };
    });
  };

  const getFilterIcon = (state: FilterState) => {
    if (state === "include") return <Check className="h-3 w-3" />;
    if (state === "exclude") return <X className="h-3 w-3" />;
    return null;
  };

  const getFilterColor = (state: FilterState) => {
    if (state === "include") return "bg-accent-brand text-white border-accent-brand";
    if (state === "exclude") return "bg-accent-hot text-white border-accent-hot";
    return "bg-background-surface2 text-text-secondary border-border hover:border-text-muted";
  };

  // Client-side genre filtering
  const filteredComics = useMemo(() => {
    let result = [...comics];

    // Genre filters (client-side for now)
    const includeGenres = Object.entries(genreFilters)
      .filter(([_, state]) => state === "include")
      .map(([id]) => id);
    const excludeGenres = Object.entries(genreFilters)
      .filter(([_, state]) => state === "exclude")
      .map(([id]) => id);

    if (includeGenres.length > 0) {
      result = result.filter((comic) =>
        includeGenres.every((genreId) =>
          comic.genres?.some((g) => g.id === genreId || g.slug === genreId)
        )
      );
    }

    if (excludeGenres.length > 0) {
      result = result.filter((comic) =>
        !excludeGenres.some((genreId) =>
          comic.genres?.some((g) => g.id === genreId || g.slug === genreId)
        )
      );
    }

    return result;
  }, [comics, genreFilters]);

  const clearFilters = () => {
    setGenreFilters({});
    setStatusFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    Object.keys(genreFilters).length > 0 ||
    statusFilter !== "all" ||
    searchQuery !== "";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">
        🔍 Tìm Kiếm Nâng Cao
      </h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters Sidebar */}
        <aside
          className={cn(
            "w-full shrink-0 lg:w-72",
            !showFilters && "hidden lg:block"
          )}
        >
          <div className="sticky top-20 space-y-6 rounded-lg bg-background-surface1 p-4">
            {/* Search Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Tên truyện / Tác giả
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  type="text"
                  placeholder="Nhập từ khóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Thể loại
              </label>
              <p className="mb-3 text-xs text-text-muted">
                Click 1 lần: Bao gồm (xanh) | 2 lần: Loại trừ (đỏ) | 3 lần: Bỏ chọn
              </p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => {
                  const state = genreFilters[genre.id] || "none";
                  return (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenreFilter(genre.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        getFilterColor(state)
                      )}
                    >
                      {getFilterIcon(state)}
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Tình trạng
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "ONGOING", label: "Đang tiến hành" },
                  { key: "COMPLETED", label: "Hoàn thành" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setStatusFilter(opt.key)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      statusFilter === opt.key
                        ? "border-accent-brand bg-accent-brand/10 text-accent-brand"
                        : "border-border text-text-secondary hover:border-accent-brand/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Sắp xếp theo
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full rounded-lg border border-border bg-background-surface2 px-3 py-2 text-sm text-text-primary focus:border-accent-brand focus:outline-none"
              >
                <option value="latest">Ngày cập nhật</option>
                <option value="views">Lượt xem</option>
                <option value="followers">Lượt theo dõi</option>
                <option value="rating">Đánh giá</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Mobile Filter Toggle */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>
            <span className="text-sm text-text-secondary">
              {filteredComics.length} kết quả
            </span>
          </div>

          {/* Results Header */}
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <h2 className="text-lg font-semibold text-text-primary">
              Kết quả ({filteredComics.length} truyện)
            </h2>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-lg bg-background-surface2" />
                  <div className="mt-2 h-4 rounded bg-background-surface2" />
                </div>
              ))}
            </div>
          ) : filteredComics.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filteredComics.map((comic) => (
                <ComicCard key={comic.id} comic={comic} variant="nettruyen" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg bg-background-surface1 py-16 text-center">
              <Search className="mb-4 h-12 w-12 text-text-muted" />
              <p className="text-lg font-medium text-text-primary">
                Không tìm thấy truyện
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}