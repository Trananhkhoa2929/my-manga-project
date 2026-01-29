import { z } from 'zod';

export const UserSettingsSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.enum(['vi', 'en', 'ja']).optional(),
    emailNotifications: z.boolean().optional(),
    chapterNotifications: z.boolean().optional(),
    commentNotifications: z.boolean().optional(),
    readingDirection: z.enum(['ltr', 'rtl', 'vertical']).optional(),
    imageQuality: z.enum(['low', 'medium', 'high', 'original']).optional(),
});

export type UserSettingsInput = z.infer<typeof UserSettingsSchema>;
