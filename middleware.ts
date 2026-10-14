import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isStaff } from "@/lib/permissions";
import { AUTH_ROUTES, DASHBOARD_ROUTES, ADMIN_ROUTES } from "@/lib/routes";

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const roles =
    req.auth?.user?.roles ?? (req.auth?.user?.role ? [req.auth.user.role] : []);
  const userIsStaff = isStaff(roles);

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
