'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { unfollowSeriesAction } from '../actions';
import { Button, Card, CardHeader, CardTitle, CardContent, useToast } from '@shared/ui';
import { X } from 'lucide-react';

interface FollowedComic {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    status: string;
    chaptersCount: number;
    followedAt: Date;
}

interface FollowedComicsListProps {
    comics: FollowedComic[];
}

export function FollowedComicsList({ comics: initialComics }: FollowedComicsListProps) {
    const [comics, setComics] = useState(initialComics);
    const [isPending, startTransition] = useTransition();
    const { error: toastError, success: toastSuccess } = useToast();

    const handleUnfollow = (seriesId: string, title: string) => {
        if (!confirm(`Bạn có chắc muốn bỏ theo dõi "${title}"?`)) return;

        startTransition(() => {
            unfollowSeriesAction(seriesId).then((res) => {
                if (res?.error) {
                    toastError(res.error);
                } else if (res?.success) {
                    toastSuccess(res.success);
                    setComics(prev => prev.filter(c => c.id !== seriesId));
                }
            });
        });
    };

    if (comics.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Truyện đang theo dõi</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-text-secondary text-center py-8">
                        Bạn chưa theo dõi truyện nào
                    </p>
                    <div className="text-center">
                        <Link
                            href="/tim-kiem"
                            className="inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200"
                        >
                            Khám phá truyện
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Truyện đang theo dõi ({comics.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {comics.map((comic) => (
                        <div
                            key={comic.id}
                            className="flex gap-4 items-center p-3 hover:bg-white/5 rounded-lg transition-colors group"
                        >
                            <Link href={`/truyen/${comic.slug}`} className="flex-shrink-0">
                                <div className="w-14 h-20 bg-gray-800 rounded overflow-hidden">
                                    {comic.coverUrl && (
                                        <img
                                            src={comic.coverUrl}
                                            alt={comic.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </Link>

                            <div className="flex-1 min-w-0">
                                <Link href={`/truyen/${comic.slug}`}>
                                    <h4 className="font-medium truncate hover:text-brand-primary transition-colors">
                                        {comic.title}
                                    </h4>
                                </Link>
                                <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
                                    <span className={`px-2 py-0.5 text-xs rounded ${comic.status === 'COMPLETED'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {comic.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang ra'}
                                    </span>
                                    <span>{comic.chaptersCount} chương</span>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnfollow(comic.id, comic.title)}
                                disabled={isPending}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
