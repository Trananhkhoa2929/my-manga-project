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
                    return { error: "Invalid credentials!" };
                default:
                    return { error: "Something went wrong!" };
            }
        }
        // Re-throw redirect errors (NextAuth uses this for redirects)
        throw error;
    }
    // Redirect will happen, so this won't be reached
    return { success: "Logged in!" };
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

    // Auto login after register? Or redirect to login?
    // Let's redirect to login for now or auto login.
    // To auto login we have to call signIn.
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/"
        });
    } catch (error) {
        if (error instanceof AuthError) {
            throw error; // Let NextAuth handle redirect throw
        }
        // If sign in fails but register created, redirect manually?
    }

    return { success: "User created!" };
}

export async function socialLogin(provider: "google") {
    await signIn(provider, { redirectTo: "/" });
}

export async function logoutAction() {
    await signOut({ redirectTo: "/login" });
}
