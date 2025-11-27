// Genre/Thể loại
export interface Genre {
  id: string;
  name: string;
  slug: string;
}

// Tóm tắt chương (dùng trong danh sách)
export interface ChapterBrief {
  id: string;
  number: number;
  name?: string;
  slug: string;
  updatedAt: string;
  views: number;
}

// Chi tiết chương (để đọc)
export interface ChapterImage {
  page: number;
  src: string;
  backupSrc?: string;
}

export interface ChapterDetail extends ChapterBrief {
  images: ChapterImage[];
  comicId: string;
  prevChapterSlug: string | null;
  nextChapterSlug: string | null;
}

// Truyện
export interface Comic {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  coverImage?: string;
  authors: string[];
  status: "Ongoing" | "Completed" | "Hiatus";
  genres: Genre[];
  totalViews: number;
  followers: number;
  rating: number;
  description: string;
  lastUpdated: string;
  latestChapters: ChapterBrief[];
  updateDay?: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN" | "DAILY";
  isHot?: boolean;
  isNew?: boolean;
}

// Comment
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  userTitle: string;
  userRole: "admin" | "uploader" | "vip" | "member";
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

// Reading History
export interface ReadingHistory {
  comicId: string;
  comicSlug: string;
  comicTitle: string;
  comicThumbnail: string;
  chapterId: string;
  chapterNumber: number;
  lastPage: number;
  timestamp: number;
}