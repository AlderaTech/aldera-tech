import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import { getPrimaryRole } from "@/lib/permissions";

/**
 * Edge-compatible NextAuth configuration.
 * Contains only lightweight config (jwt, session, pages, trustHost) without
 * heavy database adapters or Node.js native dependencies (Prisma, bcrypt, crypto).
 * Used by middleware.ts on the Edge Runtime.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 /* 30 days */ },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], // Configured with credentials & database in auth.ts
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
  },
  trustHost: true,
} satisfies NextAuthConfig;

export default authConfig;
