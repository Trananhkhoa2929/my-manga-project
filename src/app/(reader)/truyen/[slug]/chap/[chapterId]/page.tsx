"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ReaderToolbar } from "@/components/features/reader/reader-toolbar";
import { ImageCanvas } from "@/components/features/reader/image-canvas";
import { CommentSection } from "@/components/features/comment/comment-section";
import { ChapterListModal } from "@/components/features/reader/chapter-list-modal";
import { ReaderSettings } from "@/components/features/reader/reader-settings";
import { getComicBySlug } from "@/lib/mock-data/comics";
import { getChapterDetail, generateChapters } from "@/lib/mock-data/chapters";
import { useReadingHistory } from "@/hooks/use-reading-history";

interface Props {
  params: { slug: string; chapterId: string };
}

export default function ReaderPage({ params }: Props) {
  const [showChapterList, setShowChapterList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { addToHistory } = useReadingHistory();

  const comic = getComicBySlug(params. slug);
  const chapterNumber = parseInt(params. chapterId. replace("chap-", ""));
  const totalChapters = comic?. latestChapters[0]?.number || 100;
  const chapter = getChapterDetail(params.slug, chapterNumber, totalChapters);
  const allChapters = generateChapters(params.slug, totalChapters);

  // Save to history on mount
  useEffect(() => {
    if (comic && chapter) {
      addToHistory({
        comicId: comic.id,
        comicSlug: comic.slug,
        comicTitle: comic. title,
        comicThumbnail: comic.thumbnail,
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        lastPage: 1,
      });
    }
  }, [comic, chapter, addToHistory]);

  if (!comic || !chapter) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-secondary">Không tìm thấy chương truyện</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <div className="sticky top-0 z-40 border-b border-border bg-background-surface1/95 backdrop-blur">
        <div className="container mx-auto flex items-center gap-2 px-4 py-3 text-sm">
          <Link href="/" className="text-text-secondary hover:text-accent-brand">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4 text-text-muted" />
          <Link
            href={`/truyen/${comic.slug}`}
            className="max-w-[150px] truncate text-text-secondary hover:text-accent-brand sm:max-w-none"
          >
            {comic.title}
          </Link>
          <ChevronRight className="h-4 w-4 text-text-muted" />
          <span className="text-text-primary">Chapter {chapter.number}</span>
        </div>
      </div>

      {/* Image Canvas */}
      <ImageCanvas
        images={chapter.images}
        onPageChange={(page) => {
          // Update reading progress
          if (comic && chapter) {
            addToHistory({
              comicId: comic.id,
              comicSlug: comic.slug,
              comicTitle: comic.title,
              comicThumbnail: comic.thumbnail,
              chapterId: chapter.id,
              chapterNumber: chapter.number,
              lastPage: page,
            });
          }
        }}
      />

      {/* Next Chapter CTA */}
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-background-surface1 p-6 text-center">
          <p className="text-lg font-semibold text-text-primary">
            Kết thúc Chapter {chapter.number}
          </p>
          {chapter.nextChapterSlug ?  (
            <Link
              href={`/truyen/${comic.slug}/chap/${chapter.nextChapterSlug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-brand/90"
            >
              Đọc Chapter {chapter.number + 1}
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <p className="text-text-secondary">
              Bạn đã đọc đến chương mới nhất!
            </p>
          )}
          <Link
            href={`/truyen/${comic.slug}`}
            className="text-sm text-text-secondary hover:text-accent-brand"
          >
            ← Quay về trang truyện
          </Link>
        </div>
      </div>

      {/* Comments */}
      <div className="mx-auto max-w-[900px] px-4">
        <CommentSection chapterId={chapter. id} />
      </div>

      {/* Reader Toolbar */}
      <ReaderToolbar
        comicSlug={comic.slug}
        comicTitle={comic. title}
        currentChapter={chapter.number}
        totalChapters={totalChapters}
        prevChapterSlug={chapter. prevChapterSlug}
        nextChapterSlug={chapter.nextChapterSlug}
        onOpenChapterList={() => setShowChapterList(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Chapter List Modal */}
      {showChapterList && (
        <ChapterListModal
          chapters={allChapters}
          comicSlug={comic.slug}
          currentChapterNumber={chapter.number}
          onClose={() => setShowChapterList(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <ReaderSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}