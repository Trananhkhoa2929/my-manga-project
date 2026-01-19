import { ChapterDetail, ChapterBrief } from "@/lib/types";

// Generate chapters cho một truyện
export const generateChapters = (comicId: string, totalChapters: number): ChapterBrief[] => {
  const chapters: ChapterBrief[] = [];
  const now = new Date();

  for (let i = totalChapters; i >= 1; i--) {
    const hoursAgo = (totalChapters - i) * 24 + Math.floor(Math.random() * 12);
    const date = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    chapters.push({
      id: `${comicId}-ch-${i}`,
      number: i,
      slug: `chap-${i}`,
      updatedAt: date.toISOString(),
      views: Math.floor(Math.random() * 100000) + 10000,
    });
  }

  return chapters;
};

// Chi tiết chương với ảnh placeholder
export const getChapterDetail = (
  comicId: string,
  chapterNumber: number,
  totalChapters: number = 100
): ChapterDetail => {
  const totalPages = Math.floor(Math.random() * 30) + 20; // 20-50 pages
  const images = Array.from({ length: totalPages }, (_, i) => ({
    page: i + 1,
    src: `https://picsum.photos/seed/${comicId}-${chapterNumber}-${i}/800/1200`,
    backupSrc: `https://via.placeholder.com/800x1200?text=Page+${i + 1}`,
  }));

  return {
    id: `${comicId}-ch-${chapterNumber}`,
    number: chapterNumber,
    slug: `chap-${chapterNumber}`,
    updatedAt: new Date().toISOString(),
    views: Math.floor(Math.random() * 100000) + 10000,
    images,
    comicId,
    prevChapterSlug: chapterNumber > 1 ? `chap-${chapterNumber - 1}` : null,
    nextChapterSlug: chapterNumber < totalChapters ? `chap-${chapterNumber + 1}` : null,
  };
};

// Mock chapters cho một số truyện cụ thể
export const comicChapters: Record<string, ChapterBrief[]> = {
  "vo-luyen-dinh-phong": generateChapters("vo-luyen-dinh-phong", 2150),
  "solo-leveling": generateChapters("solo-leveling", 179),
  "toan-chuc-phap-su": generateChapters("toan-chuc-phap-su", 890),
  "tower-of-god": generateChapters("tower-of-god", 580),
  "the-beginning-after-the-end": generateChapters("the-beginning-after-the-end", 185),
  "omniscient-readers-viewpoint": generateChapters("omniscient-readers-viewpoint", 165),
};