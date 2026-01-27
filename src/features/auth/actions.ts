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

    // Auto login after register
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/"
        });
        return { success: "Registered successfully!" }; // Never reached due to redirect
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials after registration!" };
                default:
                    return { error: "Failed to login after registration!" };
            }
        }
        // NextAuth throws NEXT_REDIRECT on success - let it propagate
        throw error;
    }
}

export async function socialLogin(provider: "google") {
    await signIn(provider, { redirectTo: "/" });
}

export async function logoutAction() {
    await signOut({ redirectTo: "/login" });
}
