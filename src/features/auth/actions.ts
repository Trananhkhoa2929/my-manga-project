'use server';

import { signIn, signOut } from '@shared/config/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { db } from '@shared/lib';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';

import { LoginSchema, RegisterSchema, ForgotPasswordSchema, ResetPasswordSchema } from './schemas';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function loginAction(values: z.infer<typeof LoginSchema>) {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/",
        });
        return { success: "Logged in successfully!" }; // Never reached due to redirect
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email hoặc mật khẩu không chính xác!" };
                default:
                    return { error: "Đã xảy ra lỗi. Vui lòng thử lại!" };
            }
        }
        // Let redirect errors propagate (NEXT_REDIRECT)
        throw error;
    }
}

export async function registerAction(values: z.infer<typeof RegisterSchema>) {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, username } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await db.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return { error: "Email already in use!" };
    }

    const existingUsername = await db.user.findUnique({
        where: { username }
    });

    if (existingUsername) {
        return { error: "Username already taken!" };
    }

    await db.user.create({
        data: {
            username,
            email,
            passwordHash: hashedPassword,
            role: UserRole.READER,
            profile: {
                create: {
                    displayName: username,
                    avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random`
                }
            }
        }
    });

    return { success: "Đăng ký thành công! Vui lòng đăng nhập." };
}

export async function socialLogin(provider: "google") {
    await signIn(provider, { redirectTo: "/" });
}

export async function logoutAction() {
    await signOut({ redirectTo: "/login" });
}

// Password Reset Token Storage (in-memory for demo, use Redis in production)
const resetTokens: Map<string, { email: string; expires: Date }> = new Map();

export async function forgotPasswordAction(values: z.infer<typeof ForgotPasswordSchema>) {
    const validatedFields = ForgotPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Email không hợp lệ!" };
    }

    const { email } = validatedFields.data;

    const user = await db.user.findUnique({
        where: { email }
    });

    // Don't reveal if email exists or not for security
    if (!user) {
        return { success: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu." };
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Store token (in production, store in DB or Redis)
    resetTokens.set(token, { email, expires });

    // In production, send email here
    // await sendEmail({ to: email, subject: 'Reset Password', body: `Token: ${token}` });

    console.log(`[DEV] Password reset token for ${email}: ${token}`);

    return {
        success: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
        // For development only - remove in production
        devToken: token
    };
}

export async function resetPasswordAction(values: z.infer<typeof ResetPasswordSchema>) {
    const validatedFields = ResetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Dữ liệu không hợp lệ!" };
    }

    const { token, password } = validatedFields.data;

    const tokenData = resetTokens.get(token);

    if (!tokenData) {
        return { error: "Token không hợp lệ hoặc đã hết hạn!" };
    }

    if (new Date() > tokenData.expires) {
        resetTokens.delete(token);
        return { error: "Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: { email: tokenData.email },
        data: { passwordHash: hashedPassword }
    });

    resetTokens.delete(token);

    return { success: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập." };
}
