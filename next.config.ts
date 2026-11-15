import { API_ROUTES } from "./lib/routes";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Allow serving images from public/uploads served by Next's built-in static handling.
    // Remote patterns are empty, all images served are local for now.
    remotePatterns: [],
    qualities: [50, 75, 90, 100],
  },
  experimental: {
    agentUpgrade: "security",
    serverActions: {
      // Allow file uploads up to 20 MB via server actions.
      bodySizeLimit: "20mb",
    },
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: API_ROUTES.uploadsPattern,
          destination: API_ROUTES.legacyFilePattern,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      {
        source: "/admin/team",
        destination: "/admin/users?role=DEVELOPER&view=workload",
        permanent: true,
      },
      {
        source: "/calculator",
        destination: "/pricing#calculator",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
