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
    serverActions: {
      // Allow file uploads up to 20 MB via server actions.
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
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
      {
        source: "/dashboard/calculator",
        destination: "/pricing#calculator",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
