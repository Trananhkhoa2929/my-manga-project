'use server';

import { signIn, signOut } from '@shared/config/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { db } from '@shared/lib';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

import { LoginSchema, RegisterSchema } from './schemas';

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
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email hoặc mật khẩu không chính xác!" };
                default:
                    return { error: "Đã xảy ra lỗi. Vui lòng thử lại!" };
            }
        }
        // Re-throw redirect errors (NextAuth uses NEXT_REDIRECT for successful redirects)
        throw error;
    }
    // If no redirect occurred (edge case), return success
    return { success: "Đăng nhập thành công!" };
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

    // Auto login after register
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/"
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Không thể đăng nhập sau khi đăng ký!" };
                default:
                    return { error: "Đăng ký thành công nhưng không thể tự động đăng nhập!" };
            }
        }
        // Re-throw redirect errors (NextAuth uses NEXT_REDIRECT for successful redirects)
        throw error;
    }

    return { success: "Đăng ký thành công!" };
}

export async function socialLogin(provider: "google") {
    await signIn(provider, { redirectTo: "/" });
}

export async function logoutAction() {
    await signOut({ redirectTo: "/login" });
}
