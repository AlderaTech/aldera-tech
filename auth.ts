import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/**
 * Extend the session type with our custom fields (role, id).
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 /* 30 days */ },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            avatar: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as typeof token & { id: string; role: Role };
      if (user) {
        appToken.id = user.id as string;
        appToken.role = user.role;
      }
      return appToken;
    },
    async session({ session, token }) {
      const appToken = token as typeof token & { id?: string; role?: Role };
      if (token && session.user) {
        session.user.id = appToken.id ?? "";
        session.user.role = appToken.role ?? "CLIENT";
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = request.nextUrl;

      const isDashboard = pathname.startsWith("/dashboard");
      const isAdmin = pathname.startsWith("/admin");
      const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

      // Inline helper, auth.ts runs in proxy, keep imports minimal.
      const isStaffRole = (r?: string) =>
        r === "ADMIN" || r === "DEVELOPER";

      if (isAdmin) {
        if (!isLoggedIn) return false;
        return isStaffRole(role);
      }
      if (isDashboard) return isLoggedIn;
      if (isAuthRoute && isLoggedIn) {
        const target = isStaffRole(role) ? "/admin" : "/dashboard";
        return Response.redirect(new URL(target, request.nextUrl));
      }
      return true;
    },
  },
  trustHost: true,
});
