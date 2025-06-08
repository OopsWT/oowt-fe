import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow images from localhost
  pageExtensions: [
    "page.tsx",
    "page.ts",
    // FIXME: Next.js has a bug which does not resolve not-found.page.tsx correctly
    // Instead, use `not-found.ts` as a workaround
    // "ts" is required to resolve `not-found.ts`
    // https://github.com/vercel/next.js/issues/65447
    "ts",
  ],
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
