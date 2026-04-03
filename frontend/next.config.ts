import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
  // eslint-Option wurde in Next.js 16 entfernt
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
