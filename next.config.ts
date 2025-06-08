import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from localhost
  images: {
    domains: ["localhost"],
  },
  serverActions: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default nextConfig;
