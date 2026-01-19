"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import { ReaderToolbar } from "@/components/features/reader/reader-toolbar";
import { ImageCanvas } from "@/components/features/reader/image-canvas";
import { CommentSection } from "@/components/features/comment/comment-section";
import { ChapterListModal } from "@/components/features/reader/chapter-list-modal";
import { ReaderSettings } from "@/components/features/reader/reader-settings";
// import { getComicBySlug } from "@/lib/mock-data/comics"; // REMOVED
// import { getChapterDetail, generateChapters } from "@/lib/mock-data/chapters"; // REMOVED
import { useReadingHistory } from "@/hooks/use-reading-history";
import { api } from "@shared/api";
import { Spinner, Button } from "@shared/ui";

interface Props {
  params: Promise<{ slug: string; chapterId: string }>;
}

// Define types locally for now or import from shared types
interface ChapterData {
  id: string;
  number: number;
  title: string | null;
  slug: string;
  images: {
    id: string;
    page: number;
    src: string;
    width: number;
    height: number;
  }[];
  nextChapterSlug: string | null;
  prevChapterSlug: string | null;
  series: {
    id: string;
    slug: string;
    title: string;
    thumbnail: string | null;
  };
}

export default function ReaderPage({ params }: Props) {
  const { slug, chapterId } = use(params);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { addToHistory } = useReadingHistory();

  // Data state
  const [data, setData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Using our new API route
        const response = await api.get<ChapterData>(`/comics/${slug}/chapters/${chapterId}`);
        setData(response.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "Failed to load chapter");
        } else {
          setError("Failed to load chapter");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, chapterId]);

  // Save to history
  useEffect(() => {
    if (data) {
      addToHistory({
        comicId: data.series.id,
        comicSlug: data.series.slug,
        comicTitle: data.series.title,
        comicThumbnail: data.series.thumbnail || "",
        chapterId: data.id,
        chapterNumber: data.number,
        lastPage: 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-text-secondary">{error || "Không tìm thấy chương truyện"}</p>
        <Link href={`/truyen/${slug}`}>
          <Button variant="outline">Quay về trang truyện</Button>
        </Link>
      </div>
    );
  }

  // Helper for allChapters (mock for now because we didn't implement getAllChapters in this route)
  // But we can open the modal to load them on demand.
  // For now, pass empty array to modal or implement a separate fetch.
  // The toolbar expects totalChapters.
  const totalChapters = 0; // TODO: Fetch or get from series detail

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
            href={`/truyen/${data.series.slug}`}
            className="max-w-[150px] truncate text-text-secondary hover:text-accent-brand sm:max-w-none"
          >
            {data.series.title}
          </Link>
          <ChevronRight className="h-4 w-4 text-text-muted" />
          <span className="text-text-primary">Chapter {data.number}</span>
        </div>
      </div>

      {/* Image Canvas */}
      <ImageCanvas
        images={data.images}
        onPageChange={(page) => {
          // Update reading progress
          if (data) {
            addToHistory({
              comicId: data.series.id,
              comicSlug: data.series.slug,
              comicTitle: data.series.title,
              comicThumbnail: data.series.thumbnail || "",
              chapterId: data.id,
              chapterNumber: data.number,
              lastPage: page,
            });
          }
        }}
      />

      {/* Next Chapter CTA */}
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-background-surface1 p-6 text-center">
          <p className="text-lg font-semibold text-text-primary">
            Kết thúc Chapter {data.number}
          </p>
          {data.nextChapterSlug ? (
            <Link
              href={`/truyen/${data.series.slug}/chap/${data.nextChapterSlug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-brand/90"
            >
              Đọc Chapter {Math.floor(data.number) !== data.number ? data.number + 0.5 : data.number + 1}
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <p className="text-text-secondary">
              Bạn đã đọc đến chương mới nhất!
            </p>
          )}
          <Link
            href={`/truyen/${data.series.slug}`}
            className="text-sm text-text-secondary hover:text-accent-brand"
          >
            ← Quay về trang truyện
          </Link>
        </div>
      </div>

      {/* Comments */}
      <div className="mx-auto max-w-[900px] px-4">
        <CommentSection chapterId={data.id} />
      </div>

      {/* Reader Toolbar */}
      <ReaderToolbar
        comicSlug={data.series.slug}
        comicTitle={data.series.title}
        currentChapter={data.number}
        totalChapters={totalChapters}
        prevChapterSlug={data.prevChapterSlug || null}
        nextChapterSlug={data.nextChapterSlug || null}
        onOpenChapterList={() => setShowChapterList(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Chapter List Modal - TODO: Fetch real chapters */}
      {showChapterList && (
        <ChapterListModal
          chapters={[]} // Passing empty for now as we don't fetch all chapters here
          comicSlug={data.series.slug}
          currentChapterNumber={data.number}
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
