import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oowt-server-production.up.railway.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["oowt-server-production.up.railway.app"],
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
