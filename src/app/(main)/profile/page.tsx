import { auth, signOut } from '@shared/config/auth';
import { db } from '@shared/lib';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@shared/ui';
import { redirect } from 'next/navigation';
import { ProfileActions } from '@features/profile/ui/profile-actions';
import { FollowedComicsList } from '@features/profile/ui/followed-comics-list';
import { getFollowedComics } from '@features/profile/actions';

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

    // Fetch followed comics
    const { data: followedComics } = await getFollowedComics();

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
                            {/* Bio */}
                            {user.profile?.bio && (
                                <p className="text-sm text-text-secondary text-center">
                                    {user.profile.bio}
                                </p>
                            )}

                            {/* Website */}
                            {user.profile?.website && (
                                <a
                                    href={user.profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-brand-primary hover:underline text-center"
                                >
                                    {user.profile.website}
                                </a>
                            )}

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

                            {/* Edit Profile Button */}
                            <ProfileActions profile={{
                                displayName: user.profile?.displayName,
                                bio: user.profile?.bio,
                                website: user.profile?.website,
                            }} />

                            {/* Navigation Links */}
                            <div className="space-y-2 pt-2 border-t border-gray-700">
                                <a
                                    href="/profile/history"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Lịch sử đọc
                                </a>
                                <a
                                    href="/profile/settings"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Cài đặt
                                </a>
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

                    {/* Followed Comics */}
                    <FollowedComicsList comics={followedComics || []} />

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
