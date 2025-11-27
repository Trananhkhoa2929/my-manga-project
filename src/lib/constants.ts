export const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN", "DAILY"] as const;

export const DAY_LABELS: Record<string, string> = {
  MON: "T2",
  TUE: "T3",
  WED: "T4",
  THU: "T5",
  FRI: "T6",
  SAT: "T7",
  SUN: "CN",
  DAILY: "Daily",
};

export const GENRES = [
  { id: "1", name: "Action", slug: "action" },
  { id: "2", name: "Romance", slug: "romance" },
  { id: "3", name: "Fantasy", slug: "fantasy" },
  { id: "4", name: "Comedy", slug: "comedy" },
  { id: "5", name: "Drama", slug: "drama" },
  { id: "6", name: "Horror", slug: "horror" },
  { id: "7", name: "Slice of Life", slug: "slice-of-life" },
  { id: "8", name: "Sci-Fi", slug: "sci-fi" },
  { id: "9", name: "Mystery", slug: "mystery" },
  { id: "10", name: "Adventure", slug: "adventure" },
  { id: "11", name: "Martial Arts", slug: "martial-arts" },
  { id: "12", name: "Supernatural", slug: "supernatural" },
  { id: "13", name: "School Life", slug: "school-life" },
  { id: "14", name: "Isekai", slug: "isekai" },
  { id: "15", name: "Manhua", slug: "manhua" },
  { id: "16", name: "Manhwa", slug: "manhwa" },
  { id: "17", name: "Manga", slug: "manga" },
  { id: "18", name: "Webtoon", slug: "webtoon" },
];

export const USER_TITLES: Record<number, string> = {
  1: "Luyện Khí",
  10: "Trúc Cơ",
  20: "Kim Đan",
  30: "Nguyên Anh",
  50: "Hóa Thần",
  70: "Luyện Hư",
  90: "Đại Thừa",
  100: "Độ Kiếp",
};

export const NAV_LINKS = [
  { href: "/", label: "Trang Chủ" },
  { href: "/tim-kiem", label: "Thể Loại" },
  { href: "/bang-xep-hang", label: "Xếp Hạng" },
  { href: "/tim-kiem? gender=male", label: "Con Trai" },
  { href: "/tim-kiem?gender=female", label: "Con Gái" },
];