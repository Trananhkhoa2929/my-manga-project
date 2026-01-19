/**
 * MangaHub Database Seed Script
 * 
 * Hướng dẫn sử dụng:
 * 1. Chạy Docker: docker-compose -f docker-compose.dev.yml up -d postgres
 * 2. Chạy migration: npx prisma db push
 * 3. Chỉnh sửa data bên dưới theo truyện bạn muốn thêm
 * 4. Chạy seed: npx prisma db seed
 * 
 * Cấu trúc data giống như các trang truyện tranh như Webtoon, Nettruyen:
 * - Genres (thể loại): Action, Fantasy, Romance, ...
 * - Series (bộ truyện): Có title, cover, author, description, ...
 * - Chapters (chương): Mỗi bộ truyện có nhiều chương
 * - Pages (trang): Mỗi chương có nhiều trang ảnh
 */

import { PrismaClient, SeriesStatus, SeriesType, Visibility, PageStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// STEP 1: Định nghĩa các thể loại (Genres)
// ============================================
const genres = [
    { name: 'Action', slug: 'action', description: 'Truyện hành động, chiến đấu' },
    { name: 'Fantasy', slug: 'fantasy', description: 'Truyện thế giới phép thuật, kỳ ảo' },
    { name: 'Romance', slug: 'romance', description: 'Truyện tình cảm, lãng mạn' },
    { name: 'Comedy', slug: 'comedy', description: 'Truyện hài hước' },
    { name: 'Drama', slug: 'drama', description: 'Truyện kịch tính, cảm xúc' },
    { name: 'Horror', slug: 'horror', description: 'Truyện kinh dị' },
    { name: 'Slice of Life', slug: 'slice-of-life', description: 'Truyện đời thường' },
    { name: 'Martial Arts', slug: 'martial-arts', description: 'Truyện võ thuật' },
    { name: 'Isekai', slug: 'isekai', description: 'Truyện xuyên không' },
    { name: 'Adventure', slug: 'adventure', description: 'Truyện phiêu lưu' },
    { name: 'Manhwa', slug: 'manhwa', description: 'Truyện tranh Hàn Quốc' },
    { name: 'Manhua', slug: 'manhua', description: 'Truyện tranh Trung Quốc' },
    { name: 'Manga', slug: 'manga', description: 'Truyện tranh Nhật Bản' },
    { name: 'School Life', slug: 'school-life', description: 'Truyện học đường' },
    { name: 'Supernatural', slug: 'supernatural', description: 'Truyện siêu nhiên' },
];

// ============================================
// STEP 2: Định nghĩa các bộ truyện (Series)
// Thay đổi data ở đây theo truyện bạn muốn thêm
// ============================================
const seriesList = [
    {
        title: 'Solo Leveling',
        slug: 'solo-leveling',
        type: SeriesType.MANHWA,
        status: SeriesStatus.COMPLETED,
        country: 'KR',
        author: 'Chugong',
        artist: 'DUBU',
        description: 'Sung Jin-Woo, một thợ săn E-rank yếu nhất, nhận được hệ thống bí ẩn cho phép anh trở nên mạnh mẽ hơn bất kỳ ai. Anh là thợ săn duy nhất có khả năng level up.',
        coverUrl: 'https://example.com/solo-leveling-cover.jpg', // Thay bằng URL ảnh thật
        bannerUrl: 'https://example.com/solo-leveling-banner.jpg',
        genres: ['action', 'fantasy', 'manhwa'],
        chapters: [
            { number: 1, title: 'Thợ Săn Yếu Nhất', pages: 25 },
            { number: 2, title: 'Cổng Ngầm', pages: 22 },
            { number: 3, title: 'Sự Thức Tỉnh', pages: 28 },
        ],
    },
    {
        title: 'Tower of God',
        slug: 'tower-of-god',
        type: SeriesType.MANHWA,
        status: SeriesStatus.ONGOING,
        country: 'KR',
        author: 'SIU',
        artist: 'SIU',
        description: 'Baam leo lên Tháp để tìm Rachel, người bạn duy nhất của anh. Trên hành trình, anh gặp vô số thử thách và bí ẩn.',
        coverUrl: 'https://example.com/tower-of-god-cover.jpg',
        genres: ['fantasy', 'adventure', 'manhwa'],
        chapters: [
            { number: 1, title: 'Bóng Tối', pages: 30 },
            { number: 2, title: 'Bước Vào Tháp', pages: 28 },
        ],
    },
    {
        title: 'Võ Luyện Đỉnh Phong',
        slug: 'vo-luyen-dinh-phong',
        type: SeriesType.MANHUA,
        status: SeriesStatus.ONGOING,
        country: 'CN',
        author: 'Momo',
        description: 'Một thanh niên bước vào con đường võ đạo, từng bước một leo lên đỉnh cao của võ học.',
        coverUrl: 'https://example.com/vo-luyen-cover.jpg',
        genres: ['action', 'martial-arts', 'manhua'],
        chapters: [
            { number: 1, title: 'Khởi Đầu', pages: 20 },
        ],
    },
];

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function main() {
    console.log('🌱 Bắt đầu seed database...');

    // 1. Tạo Genres
    console.log('📚 Tạo thể loại...');
    for (const genre of genres) {
        await prisma.genre.upsert({
            where: { slug: genre.slug },
            update: {},
            create: genre,
        });
    }
    console.log(`   ✅ Đã tạo ${genres.length} thể loại`);

    // 2. Tạo Series
    console.log('📖 Tạo bộ truyện...');
    for (const series of seriesList) {
        // Get genre IDs
        const genreRecords = await prisma.genre.findMany({
            where: { slug: { in: series.genres } },
        });

        // Create series
        const createdSeries = await prisma.series.upsert({
            where: { slug: series.slug },
            update: {
                title: series.title,
                description: series.description,
                coverUrl: series.coverUrl,
                bannerUrl: series.bannerUrl,
                author: series.author,
                status: series.status,
            },
            create: {
                title: series.title,
                slug: series.slug,
                type: series.type,
                status: series.status,
                country: series.country,
                author: series.author,
                artist: series.artist,
                description: series.description,
                coverUrl: series.coverUrl,
                bannerUrl: series.bannerUrl,
                visibility: Visibility.PUBLIC,
                publishedAt: new Date(),
            },
        });

        // Link genres
        for (const genre of genreRecords) {
            await prisma.seriesGenre.upsert({
                where: {
                    seriesId_genreId: {
                        seriesId: createdSeries.id,
                        genreId: genre.id,
                    },
                },
                update: {},
                create: {
                    seriesId: createdSeries.id,
                    genreId: genre.id,
                },
            });
        }

        // Create series stats
        await prisma.seriesStats.upsert({
            where: { seriesId: createdSeries.id },
            update: {},
            create: {
                seriesId: createdSeries.id,
                totalViews: BigInt(Math.floor(Math.random() * 1000000)),
                weeklyViews: Math.floor(Math.random() * 50000),
                monthlyViews: Math.floor(Math.random() * 200000),
                followersCount: Math.floor(Math.random() * 10000),
                chaptersCount: series.chapters.length,
                ratingAvg: Number((Math.random() * 2 + 3).toFixed(2)), // 3.0 - 5.0
                ratingCount: Math.floor(Math.random() * 1000),
            },
        });

        // Create chapters
        for (const chapter of series.chapters) {
            const createdChapter = await prisma.chapter.upsert({
                where: {
                    seriesId_number_language: {
                        seriesId: createdSeries.id,
                        number: chapter.number,
                        language: 'vi',
                    },
                },
                update: {},
                create: {
                    seriesId: createdSeries.id,
                    number: chapter.number,
                    title: chapter.title,
                    slug: `chap-${chapter.number}`,
                    language: 'vi',
                    pagesCount: chapter.pages,
                    isPublished: true,
                    publishedAt: new Date(),
                },
            });

            // Create chapter stats
            await prisma.chapterStats.upsert({
                where: { chapterId: createdChapter.id },
                update: {},
                create: {
                    chapterId: createdChapter.id,
                    viewsCount: BigInt(Math.floor(Math.random() * 100000)),
                },
            });

            // Create pages (placeholder - bạn cần thay bằng URL ảnh thật)
            for (let i = 1; i <= chapter.pages; i++) {
                await prisma.page.upsert({
                    where: {
                        chapterId_pageNumber: {
                            chapterId: createdChapter.id,
                            pageNumber: i,
                        },
                    },
                    update: {},
                    create: {
                        chapterId: createdChapter.id,
                        pageNumber: i,
                        // Thay URL này bằng URL ảnh thật của bạn
                        imagePath: `series/${createdSeries.id}/chapters/${createdChapter.id}/${String(i).padStart(3, '0')}.webp`,
                        width: 800,
                        height: 1200,
                        status: PageStatus.FINAL,
                    },
                });
            }
        }

        console.log(`   ✅ ${series.title} - ${series.chapters.length} chương`);
    }

    console.log('\n🎉 Seed hoàn tất!');
    console.log('\n📌 Các bước tiếp theo:');
    console.log('   1. Chỉnh sửa coverUrl, bannerUrl trong seed.ts thành URL ảnh thật');
    console.log('   2. Upload ảnh các trang truyện lên MinIO hoặc storage');
    console.log('   3. Cập nhật imagePath trong pages với đường dẫn thật');
    console.log('   4. Chạy lại: npx prisma db seed');
}

main()
    .catch((e) => {
        console.error('❌ Lỗi khi seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
