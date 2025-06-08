import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from localhost
  images: {
    domains: ["localhost", "oowt-server-production.up.railway.app"],
  },
  serverActions: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default nextConfig;
