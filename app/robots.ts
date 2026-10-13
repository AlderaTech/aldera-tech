import type { MetadataRoute } from "next";
import {
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
  DASHBOARD_ROUTES,
  AUTH_ROUTES,
} from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: PUBLIC_ROUTES.home,
        disallow: [
          "/api/",
          ADMIN_ROUTES.home,
          `${ADMIN_ROUTES.home}/`,
          DASHBOARD_ROUTES.home,
          `${DASHBOARD_ROUTES.home}/`,
          AUTH_ROUTES.login,
          AUTH_ROUTES.register,
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
