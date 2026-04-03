import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Lokal (dev)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8056",
        pathname: "/assets/**",
      },
      // Hetzner (prod) – Port 8056 (docker-compose: 8056:8055)
      {
        protocol: "http",
        hostname: "178.104.62.142",
        port: "8056",
        pathname: "/assets/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
