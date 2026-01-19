import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@prisma/client";

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/register',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnEditor = nextUrl.pathname.startsWith('/editor');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnProfile = nextUrl.pathname.startsWith('/profile');

            if (isOnDashboard || isOnEditor || isOnAdmin || isOnProfile) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
                return Response.redirect(new URL('/', nextUrl));
            }
            return true;
        },
        jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }
            return token;
        },
        session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
