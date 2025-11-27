import { Comic } from "@/lib/types";

// Helper để generate ngày random gần đây
const randomRecentDate = (hoursAgo: number = 24) => {
  const date = new Date();
  date.setHours(date.getHours() - Math.floor(Math. random() * hoursAgo));
  return date.toISOString();
};

export const comics: Comic[] = [
  {
    id: "1",
    title: "Võ Luyện Đỉnh Phong",
    slug: "vo-luyen-dinh-phong",
    thumbnail: "https://picsum.photos/seed/comic1/300/400",
    coverImage: "https://picsum.photos/seed/comic1cover/1200/600",
    authors: ["Momo"],
    status: "Ongoing",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "8", name: "Martial Arts", slug: "martial-arts" },
      { id: "12", name: "Manhua", slug: "manhua" },
    ],
    totalViews: 15234567,
    followers: 234567,
    rating: 4.8,
    description: "Võ đạo chi đỉnh, phá toái hư không.  Một thanh niên bình thường bước vào con đường võ đạo, từng bước một leo lên đỉnh cao của võ học, chinh phục cả thiên hạ.",
    lastUpdated: randomRecentDate(2),
    latestChapters: [
      { id: "ch-2150", number: 2150, slug: "chap-2150", updatedAt: randomRecentDate(2), views: 45000 },
      { id: "ch-2149", number: 2149, slug: "chap-2149", updatedAt: randomRecentDate(5), views: 52000 },
      { id: "ch-2148", number: 2148, slug: "chap-2148", updatedAt: randomRecentDate(8), views: 48000 },
    ],
    updateDay: "MON",
    isHot: true,
  },
  {
    id: "2",
    title: "Solo Leveling",
    slug: "solo-leveling",
    thumbnail: "https://picsum.photos/seed/comic2/300/400",
    coverImage: "https://picsum.photos/seed/comic2cover/1200/600",
    authors: ["Chugong", "DUBU"],
    status: "Completed",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "3", name: "Fantasy", slug: "fantasy" },
      { id: "11", name: "Manhwa", slug: "manhwa" },
    ],
    totalViews: 89234567,
    followers: 1234567,
    rating: 4.9,
    description: "Sung Jin-Woo, một thợ săn E-rank yếu nhất, nhận được hệ thống bí ẩn cho phép anh trở nên mạnh mẽ hơn bất kỳ ai. Anh là thợ săn duy nhất có khả năng level up.",
    lastUpdated: randomRecentDate(24),
    latestChapters: [
      { id: "ch-179", number: 179, name: "Final", slug: "chap-179", updatedAt: randomRecentDate(24), views: 890000 },
      { id: "ch-178", number: 178, slug: "chap-178", updatedAt: randomRecentDate(30), views: 756000 },
      { id: "ch-177", number: 177, slug: "chap-177", updatedAt: randomRecentDate(36), views: 698000 },
    ],
    updateDay: "WED",
    isHot: true,
  },
  {
    id: "3",
    title: "Toàn Chức Pháp Sư",
    slug: "toan-chuc-phap-su",
    thumbnail: "https://picsum.photos/seed/comic3/300/400",
    coverImage: "https://picsum.photos/seed/comic3cover/1200/600",
    authors: ["Loạn"],
    status: "Ongoing",
    genres: [
      { id: "3", name: "Fantasy", slug: "fantasy" },
      { id: "1", name: "Action", slug: "action" },
      { id: "12", name: "Manhua", slug: "manhua" },
    ],
    totalViews: 45678901,
    followers: 456789,
    rating: 4.7,
    description: "Một thế giới nơi ma pháp thay thế khoa học.  Mạc Phàm tỉnh dậy và phát hiện mình đã xuyên không đến thế giới song song, nơi anh phải trở thành pháp sư mạnh nhất.",
    lastUpdated: randomRecentDate(4),
    latestChapters: [
      { id: "ch-890", number: 890, slug: "chap-890", updatedAt: randomRecentDate(4), views: 89000 },
      { id: "ch-889", number: 889, slug: "chap-889", updatedAt: randomRecentDate(10), views: 92000 },
      { id: "ch-888", number: 888, slug: "chap-888", updatedAt: randomRecentDate(16), views: 87000 },
    ],
    updateDay: "TUE",
    isHot: true,
  },
  {
    id: "4",
    title: "Tower of God",
    slug: "tower-of-god",
    thumbnail: "https://picsum.photos/seed/comic4/300/400",
    coverImage: "https://picsum.photos/seed/comic4cover/1200/600",
    authors: ["SIU"],
    status: "Ongoing",
    genres: [
      { id: "3", name: "Fantasy", slug: "fantasy" },
      { id: "10", name: "Adventure", slug: "adventure" },
      { id: "11", name: "Manhwa", slug: "manhwa" },
    ],
    totalViews: 78901234,
    followers: 890123,
    rating: 4.8,
    description: "Baam theo đuổi Rachel, người con gái duy nhất anh biết, vào trong Tháp.  Để tìm cô, anh phải vượt qua mọi thử thách và leo lên đỉnh cao của Tháp Thần.",
    lastUpdated: randomRecentDate(6),
    latestChapters: [
      { id: "ch-580", number: 580, slug: "chap-580", updatedAt: randomRecentDate(6), views: 120000 },
      { id: "ch-579", number: 579, slug: "chap-579", updatedAt: randomRecentDate(13), views: 115000 },
      { id: "ch-578", number: 578, slug: "chap-578", updatedAt: randomRecentDate(20), views: 118000 },
    ],
    updateDay: "SUN",
    isNew: true,
  },
  {
    id: "5",
    title: "The Beginning After The End",
    slug: "the-beginning-after-the-end",
    thumbnail: "https://picsum.photos/seed/comic5/300/400",
    coverImage: "https://picsum.photos/seed/comic5cover/1200/600",
    authors: ["TurtleMe"],
    status: "Ongoing",
    genres: [
      { id: "3", name: "Fantasy", slug: "fantasy" },
      { id: "10", name: "Isekai", slug: "isekai" },
      { id: "11", name: "Manhwa", slug: "manhwa" },
    ],
    totalViews: 56789012,
    followers: 567890,
    rating: 4.9,
    description: "King Grey có sức mạnh, sự giàu có và uy tín vô song trong một thế giới do võ thuật cai trị. Tuy nhiên, sự cô đơn theo kèm những người đứng trên đỉnh cao.",
    lastUpdated: randomRecentDate(3),
    latestChapters: [
      { id: "ch-185", number: 185, slug: "chap-185", updatedAt: randomRecentDate(3), views: 156000 },
      { id: "ch-184", number: 184, slug: "chap-184", updatedAt: randomRecentDate(10), views: 148000 },
      { id: "ch-183", number: 183, slug: "chap-183", updatedAt: randomRecentDate(17), views: 142000 },
    ],
    updateDay: "FRI",
    isHot: true,
  },
  {
    id: "6",
    title: "Omniscient Reader's Viewpoint",
    slug: "omniscient-readers-viewpoint",
    thumbnail: "https://picsum.photos/seed/comic6/300/400",
    coverImage: "https://picsum.photos/seed/comic6cover/1200/600",
    authors: ["Sing Shong"],
    status: "Ongoing",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "3", name: "Fantasy", slug: "fantasy" },
      { id: "11", name: "Manhwa", slug: "manhwa" },
    ],
    totalViews: 67890123,
    followers: 678901,
    rating: 4.9,
    description: "Kim Dokja là độc giả duy nhất đọc hết bộ tiểu thuyết 'Three Ways to Survive in a Ruined World'. Một ngày, thế giới trong tiểu thuyết trở thành hiện thực.",
    lastUpdated: randomRecentDate(1),
    latestChapters: [
      { id: "ch-165", number: 165, slug: "chap-165", updatedAt: randomRecentDate(1), views: 198000 },
      { id: "ch-164", number: 164, slug: "chap-164", updatedAt: randomRecentDate(8), views: 185000 },
      { id: "ch-163", number: 163, slug: "chap-163", updatedAt: randomRecentDate(15), views: 176000 },
    ],
    updateDay: "THU",
    isHot: true,
    isNew: true,
  },
  {
    id: "7",
    title: "Đấu La Đại Lục",
    slug: "dau-la-dai-luc",
    thumbnail: "https://picsum.photos/seed/comic7/300/400",
    coverImage: "https://picsum.photos/seed/comic7cover/1200/600",
    authors: ["Đường Gia Tam Thiếu"],
    status: "Ongoing",
    genres: [
      { id: "3", name: "Fantasy", slug: "fantasy" },
      { id: "8", name: "Martial Arts", slug: "martial-arts" },
      { id: "12", name: "Manhua", slug: "manhua" },
    ],
    totalViews: 34567890,
    followers: 345678,
    rating: 4.6,
    description: "Đường Tam, truyền nhân ngoại môn của Đường Môn, đã nhảy xuống vực sâu sau khi đánh cắp bí kíp nội môn. Chuyển sinh đến thế giới Đấu La.",
    lastUpdated: randomRecentDate(5),
    latestChapters: [
      { id: "ch-456", number: 456, slug: "chap-456", updatedAt: randomRecentDate(5), views: 67000 },
      { id: "ch-455", number: 455, slug: "chap-455", updatedAt: randomRecentDate(12), views: 71000 },
      { id: "ch-454", number: 454, slug: "chap-454", updatedAt: randomRecentDate(19), views: 65000 },
    ],
    updateDay: "SAT",
  },
  {
    id: "8",
    title: "Apotheosis",
    slug: "apotheosis",
    thumbnail: "https://picsum.photos/seed/comic8/300/400",
    coverImage: "https://picsum.photos/seed/comic8cover/1200/600",
    authors: ["Ranzai Studio"],
    status: "Ongoing",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "3", name: "Fantasy", slug: "fantasy" },
      { id: "12", name: "Manhua", slug: "manhua" },
    ],
    totalViews: 23456789,
    followers: 234567,
    rating: 4.5,
    description: "Luo Zheng, cậu chủ tử của một gia tộc cổ xưa, bị biến thành nô lệ sau khi gia tộc sụp đổ. Anh quyết tâm tu luyện để trả thù và khôi phục vinh quang.",
    lastUpdated: randomRecentDate(7),
    latestChapters: [
      { id: "ch-1100", number: 1100, slug: "chap-1100", updatedAt: randomRecentDate(7), views: 45000 },
      { id: "ch-1099", number: 1099, slug: "chap-1099", updatedAt: randomRecentDate(14), views: 48000 },
      { id: "ch-1098", number: 1098, slug: "chap-1098", updatedAt: randomRecentDate(21), views: 43000 },
    ],
    updateDay: "MON",
  },
  {
    id: "9",
    title: "Lookism",
    slug: "lookism",
    thumbnail: "https://picsum.photos/seed/comic9/300/400",
    coverImage: "https://picsum.photos/seed/comic9cover/1200/600",
    authors: ["Park Tae-Joon"],
    status: "Ongoing",
    genres: [
      { id: "5", name: "Drama", slug: "drama" },
      { id: "4", name: "Comedy", slug: "comedy" },
      { id: "11", name: "Manhwa", slug: "manhwa" },
    ],
    totalViews: 45678901,
    followers: 456789,
    rating: 4.7,
    description: "Park Hyung Suk, một học sinh béo phì bị bắt nạt, thức dậy trong một cơ thể hoàn toàn mới - cao, đẹp trai và quyến rũ.  Anh phải sống với hai cơ thể.",
    lastUpdated: randomRecentDate(4),
    latestChapters: [
      { id: "ch-480", number: 480, slug: "chap-480", updatedAt: randomRecentDate(4), views: 89000 },
      { id: "ch-479", number: 479, slug: "chap-479", updatedAt: randomRecentDate(11), views: 92000 },
      { id: "ch-478", number: 478, slug: "chap-478", updatedAt: randomRecentDate(18), views: 85000 },
    ],
    updateDay: "WED",
    isHot: true,
  },
  {
    id: "10",
    title: "Eleceed",
    slug: "eleceed",
    thumbnail: "https://picsum. photos/seed/comic10/300/400",
    coverImage: "https://picsum.photos/seed/comic10cover/1200/600",
    authors: ["Son Jeho", "ZHENA"],
    status: "Ongoing",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "4", name: "Comedy", slug: "comedy" },
      { id: "11", name: "Manhwa", slug: "manhwa" },
    ],
    totalViews: 34567890,
    followers: 345678,
    rating: 4.8,
    description: "Jiwoo là một cậu bé có khả năng đặc biệt và tốc độ phi thường.  Một ngày, anh cứu được một con mèo béo ú - thực ra là một awakener mạnh nhất.",
    lastUpdated: randomRecentDate(2),
    latestChapters: [
      { id: "ch-285", number: 285, slug: "chap-285", updatedAt: randomRecentDate(2), views: 134000 },
      { id: "ch-284", number: 284, slug: "chap-284", updatedAt: randomRecentDate(9), views: 128000 },
      { id: "ch-283", number: 283, slug: "chap-283", updatedAt: randomRecentDate(16), views: 125000 },
    ],
    updateDay: "TUE",
    isNew: true,
  },
  // Thêm comics cho các ngày khác
  {
    id: "11",
    title: "Nano Machine",
    slug: "nano-machine",
    thumbnail: "https://picsum. photos/seed/comic11/300/400",
    authors: ["한중월야"],
    status: "Ongoing",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "8", name: "Martial Arts", slug: "martial-arts" },
    ],
    totalViews: 28901234,
    followers: 289012,
    rating: 4.7,
    description: "Cheon Yeo-Woon, con riêng bị ghét bỏ của Chúa Công Ma Giáo, nhận được nano máy từ hậu duệ tương lai.",
    lastUpdated: randomRecentDate(6),
    latestChapters: [
      { id: "ch-178", number: 178, slug: "chap-178", updatedAt: randomRecentDate(6), views: 98000 },
      { id: "ch-177", number: 177, slug: "chap-177", updatedAt: randomRecentDate(13), views: 95000 },
      { id: "ch-176", number: 176, slug: "chap-176", updatedAt: randomRecentDate(20), views: 92000 },
    ],
    updateDay: "THU",
    isHot: true,
  },
  {
    id: "12",
    title: "Return of the Mount Hua Sect",
    slug: "return-of-the-mount-hua-sect",
    thumbnail: "https://picsum.photos/seed/comic12/300/400",
    authors: ["Biga"],
    status: "Ongoing",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "8", name: "Martial Arts", slug: "martial-arts" },
      { id: "4", name: "Comedy", slug: "comedy" },
    ],
    totalViews: 19012345,
    followers: 190123,
    rating: 4.8,
    description: "Chung Myung, Đệ Nhất Kiếm Dưới Gầm Trời của phái Hoa Sơn, hồi sinh 100 năm sau khi phái Hoa Sơn đã suy tàn.",
    lastUpdated: randomRecentDate(3),
    latestChapters: [
      { id: "ch-145", number: 145, slug: "chap-145", updatedAt: randomRecentDate(3), views: 112000 },
      { id: "ch-144", number: 144, slug: "chap-144", updatedAt: randomRecentDate(10), views: 108000 },
      { id: "ch-143", number: 143, slug: "chap-143", updatedAt: randomRecentDate(17), views: 105000 },
    ],
    updateDay: "FRI",
    isHot: true,
  },
  {
    id: "13",
    title: "Overgeared",
    slug: "overgeared",
    thumbnail: "https://picsum. photos/seed/comic13/300/400",
    authors: ["Park Saenal"],
    status: "Ongoing",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "3", name: "Fantasy", slug: "fantasy" },
      { id: "4", name: "Comedy", slug: "comedy" },
    ],
    totalViews: 22345678,
    followers: 223456,
    rating: 4.6,
    description: "Shin Youngwoo (Grid) là một người chơi bình thường trong game Satisfy.  Một ngày, anh tìm được legendary class duy nhất - Pagma's Successor.",
    lastUpdated: randomRecentDate(5),
    latestChapters: [
      { id: "ch-198", number: 198, slug: "chap-198", updatedAt: randomRecentDate(5), views: 87000 },
      { id: "ch-197", number: 197, slug: "chap-197", updatedAt: randomRecentDate(12), views: 84000 },
      { id: "ch-196", number: 196, slug: "chap-196", updatedAt: randomRecentDate(19), views: 81000 },
    ],
    updateDay: "SAT",
  },
  {
    id: "14",
    title: "Teenage Mercenary",
    slug: "teenage-mercenary",
    thumbnail: "https://picsum.photos/seed/comic14/300/400",
    authors: ["YC"],
    status: "Ongoing",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "5", name: "Drama", slug: "drama" },
    ],
    totalViews: 15678901,
    followers: 156789,
    rating: 4.7,
    description: "Yu Ijin, một cựu lính đánh thuê, quay về Hàn Quốc để sống cuộc sống bình thường của một học sinh trung học.",
    lastUpdated: randomRecentDate(4),
    latestChapters: [
      { id: "ch-156", number: 156, slug: "chap-156", updatedAt: randomRecentDate(4), views: 76000 },
      { id: "ch-155", number: 155, slug: "chap-155", updatedAt: randomRecentDate(11), views: 73000 },
      { id: "ch-154", number: 154, slug: "chap-154", updatedAt: randomRecentDate(18), views: 70000 },
    ],
    updateDay: "SUN",
    isNew: true,
  },
  {
    id: "15",
    title: "Wind Breaker",
    slug: "wind-breaker",
    thumbnail: "https://picsum.photos/seed/comic15/300/400",
    authors: ["Yongseok Jo"],
    status: "Ongoing",
    genres: [
      { id: "1", name: "Action", slug: "action" },
      { id: "5", name: "Drama", slug: "drama" },
      { id: "7", name: "Slice of Life", slug: "slice-of-life" },
    ],
    totalViews: 18901234,
    followers: 189012,
    rating: 4.5,
    description: "Jay là một học sinh chuyển trường ít nói.  Sau khi tham gia vào thế giới đua xe đạp, cuộc sống của anh thay đổi hoàn toàn.",
    lastUpdated: randomRecentDate(7),
    latestChapters: [
      { id: "ch-478", number: 478, slug: "chap-478", updatedAt: randomRecentDate(7), views: 65000 },
      { id: "ch-477", number: 477, slug: "chap-477", updatedAt: randomRecentDate(14), views: 62000 },
      { id: "ch-476", number: 476, slug: "chap-476", updatedAt: randomRecentDate(21), views: 60000 },
    ],
    updateDay: "DAILY",
  },
];

// Helper functions để lấy comics theo ngày
export const getComicsByDay = (day: string): Comic[] => {
  if (day === "DAILY") {
    return comics.filter((c) => c.updateDay === "DAILY");
  }
  return comics.filter((c) => c.updateDay === day);
};

export const getHotComics = (): Comic[] => {
  return comics.filter((c) => c. isHot);
};

export const getNewComics = (): Comic[] => {
  return comics.filter((c) => c.isNew);
};

export const getTopComics = (limit: number = 10): Comic[] => {
  return [... comics].sort((a, b) => b.totalViews - a. totalViews). slice(0, limit);
};

export const getComicBySlug = (slug: string): Comic | undefined => {
  return comics.find((c) => c.slug === slug);
};

export const getRecentUpdates = (limit: number = 20): Comic[] => {
  return [...comics]
    .sort((a, b) => new Date(b.lastUpdated). getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, limit);
};