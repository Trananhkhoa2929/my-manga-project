"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Eye, Clock } from "lucide-react";
import { ChapterBrief } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { formatNumber, formatTimeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChapterListProps {
  chapters: ChapterBrief[];
  comicSlug: string;
  readChapters?: string[]; // IDs of read chapters
}

export function ChapterList({
  chapters,
  comicSlug,
  readChapters = [],
}: ChapterListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredChapters = useMemo(() => {
    let result = [... chapters];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery. toLowerCase();
      result = result.filter(
        (ch) =>
          ch.number.toString().includes(query) ||
          ch. name?. toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) =>
      sortOrder === "desc" ? b.number - a.number : a.number - b.number
    );

    return result;
  }, [chapters, searchQuery, sortOrder]);

  return (
    <div className="rounded-lg bg-background-surface1 p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-text-primary">
          Danh sách chương ({chapters.length})
        </h3>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Tìm chương..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e. target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="rounded-lg bg-background-surface2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
          >
            {sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
          </button>
        </div>
      </div>

      {/* Chapter List */}
      <div className="max-h-96 space-y-1 overflow-y-auto scrollbar-hide">
        {filteredChapters.map((chapter) => {
          const isRead = readChapters. includes(chapter.id);

          return (
            <Link
              key={chapter.id}
              href={`/truyen/${comicSlug}/chap/${chapter.slug}`}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
                isRead
                  ? "bg-transparent text-text-muted"
                  : "bg-background-surface2 text-text-primary hover:bg-accent-brand/10"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("font-medium", isRead && "line-through")}>
                  Chapter {chapter.number}
                </span>
                {chapter.name && (
                  <span className="text-sm text-text-secondary">
                    - {chapter.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(chapter.views)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(chapter.updatedAt)}
                </span>
              </div>
            </Link>
          );
        })}

        {filteredChapters.length === 0 && (
          <div className="py-8 text-center text-text-secondary">
            Không tìm thấy chương phù hợp
          </div>
        )}
      </div>
    </div>
  );
}