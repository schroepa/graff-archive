import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8056",
        pathname: "/assets/**",
      },
      {
        protocol: "http",
        hostname: "178.104.62.142",
        port: "8056",
        pathname: "/assets/**",
      },
      {
        protocol: "http",
        hostname: "streetfiles.duckdns.org",
        port: "",
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
