"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  List,
  ChevronLeft,
  ChevronRight,
  Settings,
  Heart,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

interface ReaderToolbarProps {
  comicSlug: string;
  comicTitle: string;
  currentChapter: number;
  totalChapters: number;
  prevChapterSlug: string | null;
  nextChapterSlug: string | null;
  onOpenChapterList: () => void;
  onOpenSettings: () => void;
}

export function ReaderToolbar({
  comicSlug,
  comicTitle,
  currentChapter,
  totalChapters,
  prevChapterSlug,
  nextChapterSlug,
  onOpenChapterList,
  onOpenSettings,
}: ReaderToolbarProps) {
  const { scrollDirection, scrollToTop, scrollToBottom, scrollProgress } = useScrollSpy();
  const [isVisible, setIsVisible] = useState(true);

  // Auto hide on scroll down
  useEffect(() => {
    if (scrollDirection === "down") {
      setIsVisible(false);
    } else if (scrollDirection === "up") {
      setIsVisible(true);
    }
  }, [scrollDirection]);

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-background-surface1">
        <div
          className="h-full bg-accent-brand transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Bottom Toolbar - Floating */}
      <div
        className={cn(
          "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 transition-all duration-300",
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background-surface1/95 px-4 py-3 shadow-xl backdrop-blur">
          {/* Home */}
          <Link href="/">
            <Button variant="ghost" size="icon" title="Trang chủ">
              <Home className="h-5 w-5" />
            </Button>
          </Link>

          {/* Chapter List */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenChapterList}
            title="Danh sách chương"
          >
            <List className="h-5 w-5" />
          </Button>

          <div className="mx-2 h-6 w-px bg-border" />

          {/* Prev Chapter */}
          <Link
            href={prevChapterSlug ?  `/truyen/${comicSlug}/chap/${prevChapterSlug}` : "#"}
            className={cn(! prevChapterSlug && "pointer-events-none opacity-50")}
          >
            <Button variant="secondary" size="icon" title="Chương trước">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>

          {/* Current Chapter Info */}
          <button
            onClick={onOpenChapterList}
            className="min-w-[100px] rounded-lg bg-background-surface2 px-3 py-2 text-center text-sm font-medium text-text-primary hover:bg-background-surface2/80"
          >
            {currentChapter}/{totalChapters}
          </button>

          {/* Next Chapter */}
          <Link
            href={nextChapterSlug ? `/truyen/${comicSlug}/chap/${nextChapterSlug}` : "#"}
            className={cn(! nextChapterSlug && "pointer-events-none opacity-50")}
          >
            <Button variant="default" size="icon" title="Chương sau">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>

          <div className="mx-2 h-6 w-px bg-border" />

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            title="Cài đặt"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Bookmark */}
          <Button variant="ghost" size="icon" title="Theo dõi">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToTop}
          title="Lên đầu trang"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => {
            document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
          }}
          title="Bình luận"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToBottom}
          title="Cuối trang"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" title="Báo lỗi">
          <AlertTriangle className="h-5 w-5" />
        </Button>
      </div>

      {/* Click to show toolbar */}
      {! isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-accent-brand px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          Hiện thanh công cụ
        </button>
      )}
    </>
  );
}