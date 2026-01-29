'use server';

import { db } from '@shared/lib';
import { auth } from '@shared/config/auth';
import { revalidatePath } from 'next/cache';
import { UserSettingsSchema, UserSettingsInput } from './schemas';

// Actions
export async function getUserSettings() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Bạn cần đăng nhập!", data: null };
    }

    const profile = await db.userProfile.findUnique({
        where: { userId: session.user.id },
        select: { preferences: true }
    });

    // Default settings
    const defaultSettings: UserSettingsInput = {
        theme: 'dark',
        language: 'vi',
        emailNotifications: true,
        chapterNotifications: true,
        commentNotifications: true,
        readingDirection: 'ltr',
        imageQuality: 'high',
    };

    return {
        data: {
            ...defaultSettings,
            ...(profile?.preferences as UserSettingsInput || {})
        }
    };
}

export async function updateUserSettings(values: UserSettingsInput) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Bạn cần đăng nhập!" };
    }

    const validatedFields = UserSettingsSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Dữ liệu không hợp lệ!" };
    }

    // Get current preferences
    const profile = await db.userProfile.findUnique({
        where: { userId: session.user.id },
        select: { preferences: true }
    });

    const currentPrefs = (profile?.preferences as object) || {};
    const newPrefs = { ...currentPrefs, ...validatedFields.data };

    await db.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
            preferences: newPrefs,
        },
        create: {
            userId: session.user.id,
            displayName: session.user.name || 'User',
            preferences: newPrefs,
        }
    });

    revalidatePath('/profile/settings');

    return { success: "Cập nhật cài đặt thành công!" };
}

export async function clearReadingHistory() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Bạn cần đăng nhập!" };
    }

    await db.readingHistory.deleteMany({
        where: { userId: session.user.id }
    });

    revalidatePath('/profile/history');

    return { success: "Đã xóa lịch sử đọc!" };
}

export async function deleteAccount() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Bạn cần đăng nhập!" };
    }

    // This will cascade delete all related data due to Prisma schema
    await db.user.delete({
        where: { id: session.user.id }
    });

    return { success: "Đã xóa tài khoản!" };
}
