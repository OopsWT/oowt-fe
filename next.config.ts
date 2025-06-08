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
  serverActions: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default nextConfig;
