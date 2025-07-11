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
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "oowt-server-production.up.railway.app",
        "res.cloudinary.com",
      ],
      bodySizeLimit: "9mb",
    },
  },
};

export default nextConfig;
