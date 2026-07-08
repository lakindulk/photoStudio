/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Prevent webpack from bundling these Node-only packages into any bundle.
  // They are required at runtime via Node's native require() instead.
  serverExternalPackages: ['firebase-admin', '@google-cloud/firestore', '@opentelemetry/api'],

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Let Next.js manage JS/CSS chunk caching (it sets immutable only for
        // content-hashed production builds). Only lock-cache static media/fonts.
        source: "/:path*.(woff2|png|jpg|jpeg|webp|avif|svg|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },

}

export default nextConfig
