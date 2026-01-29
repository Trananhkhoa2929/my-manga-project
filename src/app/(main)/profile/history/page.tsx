import { auth } from '@shared/config/auth';
import { db } from '@shared/lib';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HistoryPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // Fetch reading history with pagination
    const readingHistory = await db.readingHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { startedAt: 'desc' },
        take: 50,
        include: {
            chapter: {
                include: {
                    series: true
                }
            }
        }
    });

    // Group by date
    const groupedHistory = readingHistory.reduce((acc, item) => {
        const date = item.startedAt.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {} as Record<string, typeof readingHistory>);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/profile"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                >
                    ← Quay lại hồ sơ
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">Lịch sử đọc truyện</h1>

            {Object.keys(groupedHistory).length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-text-secondary mb-4">Bạn chưa đọc truyện nào</p>
                        <Link
                            href="/tim-kiem"
                            className="inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-200"
                        >
                            Khám phá truyện
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedHistory).map(([date, items]) => (
                        <Card key={date}>
                            <CardHeader>
                                <CardTitle className="text-lg">{date}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {items.map((history) => (
                                        <div
                                            key={history.id}
                                            className="flex gap-4 items-center p-3 hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <Link
                                                href={`/truyen/${history.chapter.series.slug}`}
                                                className="flex-shrink-0"
                                            >
                                                <div className="w-14 h-20 bg-gray-800 rounded overflow-hidden">
                                                    {history.chapter.series.coverUrl && (
                                                        <img
                                                            src={history.chapter.series.coverUrl}
                                                            alt={history.chapter.series.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <Link href={`/truyen/${history.chapter.series.slug}`}>
                                                    <h4 className="font-medium truncate hover:text-brand-primary transition-colors">
                                                        {history.chapter.series.title}
                                                    </h4>
                                                </Link>
                                                <p className="text-sm text-text-secondary">
                                                    {history.chapter.title || `Chương ${history.chapter.number}`}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                                                    <span>{history.pagesRead} trang đã đọc</span>
                                                    <span>•</span>
                                                    <span>
                                                        {history.startedAt.toLocaleTimeString('vi-VN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/truyen/${history.chapter.series.slug}/chap/${history.chapter.slug}`}
                                                className="px-3 py-1.5 text-sm border border-gray-600 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white transition-colors"
                                            >
                                                Đọc tiếp
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
