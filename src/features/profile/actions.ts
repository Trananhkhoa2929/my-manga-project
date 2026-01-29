'use server';

import { db } from '@shared/lib';
import { auth } from '@shared/config/auth';
import { revalidatePath } from 'next/cache';
import { UpdateProfileSchema, UpdateProfileInput } from './schemas';

// Actions
export async function updateProfileAction(values: UpdateProfileInput) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Bạn cần đăng nhập để thực hiện thao tác này!" };
    }

    const validatedFields = UpdateProfileSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Dữ liệu không hợp lệ!" };
    }

    const { displayName, bio, website } = validatedFields.data;

    await db.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
            displayName,
            bio,
            website: website || null,
        },
        create: {
            userId: session.user.id,
            displayName: displayName || session.user.name || 'User',
            bio,
            website: website || null,
        }
    });

    revalidatePath('/profile');

    return { success: "Cập nhật hồ sơ thành công!" };
}

export async function getFollowedComics() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Bạn cần đăng nhập!", data: [] };
    }

    const follows = await db.seriesFollow.findMany({
        where: { userId: session.user.id },
        include: {
            series: {
                include: {
                    stats: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return {
        data: follows.map(f => ({
            id: f.series.id,
            title: f.series.title,
            slug: f.series.slug,
            coverUrl: f.series.coverUrl,
            status: f.series.status,
            chaptersCount: f.series.stats?.chaptersCount || 0,
            followedAt: f.createdAt,
        }))
    };
}

export async function unfollowSeriesAction(seriesId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Bạn cần đăng nhập!" };
    }

    await db.seriesFollow.delete({
        where: {
            userId_seriesId: {
                userId: session.user.id,
                seriesId,
            }
        }
    });

    // Update followers count
    await db.seriesStats.update({
        where: { seriesId },
        data: { followersCount: { decrement: 1 } }
    });

    revalidatePath('/profile');

    return { success: "Đã bỏ theo dõi truyện!" };
}
