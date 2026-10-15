import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { isStaff, isAdmin } from "@/lib/permissions";
import { AUTH_ROUTES, DASHBOARD_ROUTES, ADMIN_ROUTES } from "@/lib/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Normalize pathname to collapse multiple slashes: e.g. /admin//ai-relay -> /admin/ai-relay
  const rawPathname = req.nextUrl.pathname;
  const pathname = rawPathname.replace(/\/+/g, "/");
  const { search } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const roles =
    req.auth?.user?.roles ?? (req.auth?.user?.role ? [req.auth.user.role] : []);
  const userIsStaff = isStaff(roles);
  const userIsAdmin = isAdmin(roles);

  // 1a. Guard AI Relay Admin API routes: strictly ADMIN only (reject DEVELOPER and CLIENT)
  if (pathname.startsWith("/api/admin/ai-relay")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // 1. Guard API Admin routes: return JSON 401 / 403
  if (pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!userIsStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // 2a. Guard AI Relay Admin dashboard pages: strictly ADMIN only (reject DEVELOPER and CLIENT)
  if (pathname.startsWith("/admin/ai-relay")) {
    if (!isLoggedIn) {
      const loginUrl = new URL(AUTH_ROUTES.login, req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    if (!userIsAdmin) {
      const fallbackTarget = userIsStaff
        ? ADMIN_ROUTES.home
        : DASHBOARD_ROUTES.home;
      return NextResponse.redirect(new URL(fallbackTarget, req.nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Guard Admin dashboard pages: redirect to login or dashboard
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL(AUTH_ROUTES.login, req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    if (!userIsStaff) {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTES.home, req.nextUrl));
    }
    return NextResponse.next();
  }

  // 3. Guard Client dashboard pages: redirect to login
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const loginUrl = new URL(AUTH_ROUTES.login, req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Redirect authenticated users visiting /login or /register
  const isAuthRoute =
    pathname.startsWith(AUTH_ROUTES.login) ||
    pathname.startsWith(AUTH_ROUTES.register);
  if (isAuthRoute && isLoggedIn) {
    const target = userIsStaff ? ADMIN_ROUTES.home : DASHBOARD_ROUTES.home;
    return NextResponse.redirect(new URL(target, req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/login",
    "/register",
  ],
};
