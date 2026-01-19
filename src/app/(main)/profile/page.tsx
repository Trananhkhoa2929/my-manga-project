import { auth, signOut } from '@shared/config/auth';
import { db } from '@shared/lib';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@shared/ui';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // Fetch full user profile with stats
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            profile: true,
            stats: true,
            readingHistory: {
                take: 5,
                orderBy: { startedAt: 'desc' },
                include: {
                    chapter: {
                        include: {
                            series: true
                        }
                    }
                }
            }
        }
    });

    if (!user) return <div>User not found</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full mb-4 overflow-hidden">
                                {user.profile?.avatarUrl && (
                                    <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <CardTitle>{user.profile?.displayName || user.username}</CardTitle>
                            <p className="text-sm text-text-secondary">@{user.username}</p>
                            <div className="mt-2 inline-block px-2 py-1 text-xs rounded bg-brand-primary/20 text-brand-primary">
                                {user.role}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 text-center text-sm">
                                <div>
                                    <div className="font-bold text-lg">{user.stats?.followersCount || 0}</div>
                                    <div className="text-text-secondary">Followers</div>
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{user.stats?.followingCount || 0}</div>
                                    <div className="text-text-secondary">Following</div>
                                </div>
                            </div>

                            <form action={async () => {
                                'use server';
                                await signOut({ redirectTo: "/" });
                            }}>
                                <Button variant="danger" className="w-full">Đăng xuất</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card padding="sm">
                            <div className="text-sm text-text-secondary">Level</div>
                            <div className="text-xl font-bold text-brand-primary">Lvl. {user.stats?.level || 1}</div>
                        </Card>
                        <Card padding="sm">
                            <div className="text-sm text-text-secondary">Exp</div>
                            <div className="text-xl font-bold text-yellow-500">{user.stats?.expPoints || 0} XP</div>
                        </Card>
                        <Card padding="sm">
                            <div className="text-sm text-text-secondary">Lượt đọc</div>
                            <div className="text-xl font-bold text-blue-500">{Number(user.stats?.totalViews || 0)}</div>
                        </Card>
                    </div>

                    {/* Reading History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch sử đọc gần đây</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.readingHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {user.readingHistory.map(history => (
                                        <div key={history.id} className="flex gap-4 items-center p-2 hover:bg-white/5 rounded-lg transition-colors">
                                            <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                                {history.chapter.series.coverUrl && (
                                                    <img src={history.chapter.series.coverUrl} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{history.chapter.series.title}</h4>
                                                <p className="text-sm text-text-secondary">
                                                    {history.chapter.title || `Chapter ${history.chapter.number}`}
                                                </p>
                                                <span className="text-xs text-text-muted">
                                                    {history.startedAt.toLocaleDateString()}
                                                </span>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/truyen/${history.chapter.series.slug}/chap/${history.chapter.slug}`}>Đọc tiếp</a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-secondary text-center py-8">Chưa có lịch sử đọc</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
