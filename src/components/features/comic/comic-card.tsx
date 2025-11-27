"use client";

import React from "react";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { Comic } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatTimeAgo } from "@/lib/utils";

interface ComicCardProps {
  comic: Comic;
  variant?: "webtoon" | "nettruyen";
}

export function ComicCard({ comic, variant = "nettruyen" }: ComicCardProps) {
  if (variant === "webtoon") {
    return <WebtoonCard comic={comic} />;
  }
  return <NettruyenCard comic={comic} />;
}

// Webtoon Style Card (cho Daily Schedule)
function WebtoonCard({ comic }: { comic: Comic }) {
  return (
    <Link href={`/truyen/${comic.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-background-surface2">
        <img
          src={comic. thumbnail}
          alt={comic.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* UP Badge */}
        {comic.latestChapters[0] && (
          <div className="absolute left-2 top-2">
            <Badge variant="update" className="animate-pulse">
              UP
            </Badge>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Info */}
      <div className="mt-2 space-y-1">
        <p className="text-xs font-semibold uppercase text-accent-brand">
          {comic.genres[0]?.name || "Manga"}
        </p>
        <h3 className="line-clamp-1 text-sm font-bold text-text-primary group-hover:text-accent-brand">
          {comic.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Heart className="h-3 w-3 fill-current text-pink-500" />
          <span>{formatNumber(comic.followers)}</span>
        </div>
      </div>
    </Link>
  );
}

// Nettruyen Style Card (cho Latest Updates)
function NettruyenCard({ comic }: { comic: Comic }) {
  return (
    <div className="group">
      <Link
        href={`/truyen/${comic. slug}`}
        className="relative block aspect-[2/3] overflow-hidden rounded-lg bg-background-surface2"
      >
        <img
          src={comic. thumbnail}
          alt={comic.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {comic.isHot && <Badge variant="hot">HOT</Badge>}
          {comic. isNew && <Badge variant="new">NEW</Badge>}
        </div>

        {/* Chapter Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2">
          <p className="text-xs font-medium text-white">
            Chapter {comic.latestChapters[0]?.number || "? "}
          </p>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Eye className="h-10 w-10 text-white" />
        </div>
      </Link>

      {/* Title */}
      <Link
        href={`/truyen/${comic.slug}`}
        className="mt-2 block"
      >
        <h3 className="line-clamp-2 text-sm font-medium text-text-primary group-hover:text-accent-brand">
          {comic. title}
        </h3>
      </Link>

      {/* Latest Chapters */}
      <div className="mt-1 space-y-0.5">
        {comic.latestChapters.slice(0, 3).map((chapter) => (
          <Link
            key={chapter.id}
            href={`/truyen/${comic.slug}/chap/${chapter.slug}`}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-text-secondary hover:text-accent-brand">
              Chap {chapter. number}
            </span>
            <span className="text-text-muted">
              {formatTimeAgo(chapter. updatedAt)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}