import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The generated Prisma client and its driver adapter are Node-only; keep them
  // out of the bundler so the native better-sqlite3 binding resolves at runtime.
  serverExternalPackages: ["@prisma/adapter-better-sqlite3", "better-sqlite3"],

  experimental: {
    serverActions: {
      // Uploads go through a Server Action. The largest accepted file is an 8 MB
      // PDF (see UPLOAD_LIMITS in lib/storage.ts); the rest is multipart overhead.
      bodySizeLimit: "10mb",
    },
  },

  images: {
    // Only the seeded sample content is remote. Anything added from the
    // dashboard is uploaded and served from this origin under /uploads.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },

  async redirects() {
    return [
      // /about and /resume were merged into one page. Permanent so search
      // engines transfer any ranking the old URL had.
      { source: "/resume", destination: "/about", permanent: true },
      // Browsers use the <link rel="icon"> tag, but some crawlers and RSS readers
      // still request /favicon.ico directly.
      { source: "/favicon.ico", destination: "/icon", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
