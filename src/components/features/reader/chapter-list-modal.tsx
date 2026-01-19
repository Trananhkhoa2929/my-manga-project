"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Search } from "lucide-react";
import { ChapterBrief } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChapterListModalProps {
  chapters: ChapterBrief[];
  comicSlug: string;
  currentChapterNumber: number;
  onClose: () => void;
}

export function ChapterListModal({
  chapters,
  comicSlug,
  currentChapterNumber,
  onClose,
}: ChapterListModalProps) {
  const [search, setSearch] = useState("");

  const filteredChapters = chapters.filter((ch) =>
    ch.number.toString().includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-lg bg-background-surface1">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-text-primary">Danh sách chương</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-background-surface2"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Nhập số chương..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Chapter List */}
        <div className="max-h-96 overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-5 gap-2">
            {filteredChapters.map((chapter) => {
              const isCurrent = chapter.number === currentChapterNumber;
              return (
                <Link
                  key={chapter.id}
                  href={`/truyen/${comicSlug}/chap/${chapter.slug}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors",
                    isCurrent
                      ? "bg-accent-brand text-white"
                      : "bg-background-surface2 text-text-secondary hover:bg-accent-brand/20 hover:text-accent-brand"
                  )}
                >
                  {chapter.number}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}