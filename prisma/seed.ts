import { PrismaClient, UserRole, SeriesType, SeriesStatus, Visibility, PageStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Clean up existing data (optional, be careful in prod)
    await prisma.page.deleteMany();
    await prisma.chapter.deleteMany();
    await prisma.series.deleteMany();
    await prisma.user.deleteMany();
    await prisma.genre.deleteMany();

    // 2. Seed Genres
    const genres = [
        { name: 'Action', slug: 'action', description: 'Action-packed adventures' },
        { name: 'Adventure', slug: 'adventure', description: 'Exciting journeys' },
        { name: 'Comedy', slug: 'comedy', description: 'Funny stories' },
        { name: 'Drama', slug: 'drama', description: 'Emotional stories' },
        { name: 'Fantasy', slug: 'fantasy', description: 'Magic and supernatural' },
        { name: 'Isekai', slug: 'isekai', description: 'Transferred to another world' },
        { name: 'Romance', slug: 'romance', description: 'Love stories' },
        { name: 'Slice of Life', slug: 'slice-of-life', description: 'Daily life stories' },
        { name: 'Sci-Fi', slug: 'sci-fi', description: 'Science fiction' },
        { name: 'Horror', slug: 'horror', description: 'Scary stories' },
        { name: 'Mystery', slug: 'mystery', description: 'Solving mysteries' },
        { name: 'Psychological', slug: 'psychological', description: 'Psychological mind games' },
    ];

    console.log(`Creating ${genres.length} genres...`);
    for (const g of genres) {
        await prisma.genre.upsert({
            where: { slug: g.slug },
            update: {},
            create: g,
        });
    }

    // 3. Seed Users
    const adminEmail = 'admin@mangahub.com';
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            username: 'admin',
            role: UserRole.ADMIN,
            // displayName: 'System Admin', // Note: This field is in UserProfile in schema, but User model doesn't have it directly. Wait, let me check schema.
            // Schema: User has displayName checks? No, User has relation to UserProfile.
            // Need to create profile separately or via nested write.
            profile: {
                create: {
                    displayName: 'System Admin',
                    bio: 'The verify boss of MangaHub',
                    avatarUrl: 'https://github.com/shadcn.png',
                }
            },
            wallet: {
                create: {
                    balance: 1000000,
                    currency: 'COIN'
                }
            }
        },
    });
    console.log('Created Admin:', admin.username);

    const uploaderEmail = 'uploader@mangahub.com';
    const uploader = await prisma.user.upsert({
        where: { email: uploaderEmail },
        update: {},
        create: {
            email: uploaderEmail,
            username: 'uploader_san',
            role: UserRole.UPLOADER,
            profile: {
                create: {
                    displayName: 'Uploader San',
                    bio: 'I upload fast!',
                    avatarUrl: 'https://github.com/shadcn.png',
                }
            }
        },
    });

    // 4. Seed Series
    // Series A: One Piece (Manga)
    const onePiece = await prisma.series.upsert({
        where: { slug: 'one-piece' },
        update: {},
        create: {
            title: 'One Piece',
            titleOriginal: 'ワンピース',
            slug: 'one-piece',
            type: SeriesType.MANGA,
            status: SeriesStatus.ONGOING,
            author: 'Eiichiro Oda',
            artist: 'Eiichiro Oda',
            description: 'Monkey D. Luffy refuses to let anyone or anything stand in the way of his quest to become the King of All Pirates.',
            coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx30013-oXTM246e7fKq.jpg', // Placeholder
            bannerUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/banner/30013-7A39j13jK13j.jpg',
            uploaderId: uploader.id,
            visibility: Visibility.PUBLIC,
            genres: {
                create: [
                    { genre: { connect: { slug: 'action' } } },
                    { genre: { connect: { slug: 'adventure' } } },
                    { genre: { connect: { slug: 'fantasy' } } },
                ]
            },
            stats: {
                create: {
                    totalViews: 1000500,
                    ratingAvg: 4.9,
                    followersCount: 5000,
                }
            }
        },
    });
    console.log('Created Series:', onePiece.title);

    // Series B: Solo Leveling (Manhwa)
    const soloLeveling = await prisma.series.upsert({
        where: { slug: 'solo-leveling' },
        update: {},
        create: {
            title: 'Solo Leveling',
            titleOriginal: '나 혼자만 레벨업',
            slug: 'solo-leveling',
            type: SeriesType.MANHWA,
            status: SeriesStatus.COMPLETED,
            author: 'Chugong',
            artist: 'Dubu (Redice Studio)',
            description: 'In a world where hunters, humans who possess magical abilities, must battle deadly monsters to protect the human race from certain annihilation.',
            uploaderId: uploader.id,
            visibility: Visibility.PUBLIC,
            genres: {
                create: [
                    { genre: { connect: { slug: 'action' } } },
                    { genre: { connect: { slug: 'fantasy' } } },
                ]
            },
            stats: {
                create: {
                    totalViews: 2500000,
                    ratingAvg: 4.8,
                    followersCount: 8000,
                }
            }
        },
    });
    console.log('Created Series:', soloLeveling.title);

    // 5. Seed Chapters & Pages
    // Chapter 1 of One Piece
    const opCh1 = await prisma.chapter.upsert({
        where: {
            seriesId_number_language: {
                seriesId: onePiece.id,
                number: 1,
                language: 'vi'
            }
        },
        update: {},
        create: {
            seriesId: onePiece.id,
            number: 1,
            title: 'Romance Dawn',
            slug: 'one-piece-chapter-1',
            pagesCount: 5,
            isPublished: true,
            uploaderId: uploader.id,
            pages: {
                create: [
                    { pageNumber: 1, imagePath: 'https://dummyimage.com/800x1200/2a2a2a/ffffff&text=OP+Ch1+Page+1', width: 800, height: 1200, status: PageStatus.CLEANED },
                    { pageNumber: 2, imagePath: 'https://dummyimage.com/800x1200/2a2a2a/ffffff&text=OP+Ch1+Page+2', width: 800, height: 1200, status: PageStatus.CLEANED },
                    { pageNumber: 3, imagePath: 'https://dummyimage.com/800x1200/2a2a2a/ffffff&text=OP+Ch1+Page+3', width: 800, height: 1200, status: PageStatus.CLEANED },
                    { pageNumber: 4, imagePath: 'https://dummyimage.com/800x1200/2a2a2a/ffffff&text=OP+Ch1+Page+4', width: 800, height: 1200, status: PageStatus.CLEANED },
                    { pageNumber: 5, imagePath: 'https://dummyimage.com/800x1200/2a2a2a/ffffff&text=OP+Ch1+Page+5', width: 800, height: 1200, status: PageStatus.CLEANED },
                ]
            }
        }
    });
    console.log('Created Chapter:', opCh1.slug);

    // 6. Seed Stress Test Series (Test 100+ images)
    const stressSeries = await prisma.series.upsert({
        where: { slug: 'stress-test-series' },
        update: {},
        create: {
            title: 'Performance Test Series (100+ Pages)',
            slug: 'stress-test-series',
            type: SeriesType.MANGA,
            status: SeriesStatus.COMPLETED,
            author: 'Bot',
            artist: 'Bot',
            description: 'A series to test viewer performance with many pages.',
            coverUrl: 'https://dummyimage.com/300x450/2a2a2a/ffffff&text=Stress+Test',
            uploaderId: uploader.id,
            visibility: Visibility.PUBLIC,
            chapters: {
                create: {
                    number: 100,
                    title: 'Heavy Chapter',
                    slug: 'stress-test-chapter-100',
                    pagesCount: 150,
                    language: 'vi',
                    isPublished: true,
                    uploaderId: uploader.id,
                    pages: {
                        create: Array.from({ length: 150 }).map((_, i) => ({
                            pageNumber: i + 1,
                            imagePath: i % 2 === 0
                                ? 'https://dummyimage.com/800x1200/2a2a2a/ffffff&text=Stress+Page+Even'
                                : 'https://dummyimage.com/800x1200/333333/ffffff&text=Stress+Page+Odd', // Reuse images
                            width: 800,
                            height: 1200,
                            status: PageStatus.CLEANED
                        }))
                    }
                }
            }
        }
    });
    console.log('Created Stress Test Series:', stressSeries.title);

    console.log('✅ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
