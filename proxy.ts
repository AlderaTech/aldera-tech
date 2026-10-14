/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`, see
 * https://nextjs.org/docs/app/guides/upgrading/version-16.
 * Runtime is always Node.js (not edge), so bcrypt-based auth
 * can be used here directly.
 */
import { auth } from "@/auth";

export const proxy = auth;

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static
     *  - _next/image
     *  - favicon.ico, /uploads, /api/auth (auth.js handles its own)
     *  - common image/asset extensions
     */
    "/((?!api/auth|_next/static|_next/image|uploads|logo|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf)).*)",
  ],
};
