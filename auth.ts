import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { getPrimaryRole, isStaff } from "@/lib/permissions";

/**
 * Extend the session type with our custom fields (roles, role, id).
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      roles: Role[];
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    roles: Role[];
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
            roles: true,
            avatar: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        const primaryRole = getPrimaryRole(user.roles);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: primaryRole,
          roles: user.roles,
          image: user.avatar ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as typeof token & {
        id: string;
        role: Role;
        roles: Role[];
      };
      if (user) {
        appToken.id = user.id as string;
        appToken.roles = user.roles ?? ["CLIENT"];
        appToken.role = user.role ?? getPrimaryRole(appToken.roles);
      }
      return appToken;
    },
    async session({ session, token }) {
      const appToken = token as typeof token & {
        id?: string;
        role?: Role;
        roles?: Role[];
      };
      if (token && session.user) {
        session.user.id = appToken.id ?? "";
        session.user.roles = appToken.roles ?? ["CLIENT"];
        session.user.role = appToken.role ?? getPrimaryRole(session.user.roles);
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const roles =
        auth?.user?.roles ?? (auth?.user?.role ? [auth.user.role] : []);
      const { pathname } = request.nextUrl;

      const isDashboard = pathname.startsWith("/dashboard");
      const isAdminRoute = pathname.startsWith("/admin");
      const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      const userIsStaff = isStaff(roles);

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        return userIsStaff;
      }
      if (isDashboard) return isLoggedIn;
      if (isAuthRoute && isLoggedIn) {
        const target = userIsStaff ? "/admin" : "/dashboard";
        return Response.redirect(new URL(target, request.nextUrl));
      }
      return true;
    },
  },
  trustHost: true,
});
