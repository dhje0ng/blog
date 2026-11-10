/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/blog",
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'" }
      ]
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.giphy.com"
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com"
      },
      {
        protocol: "https",
        hostname: "staticmap.openstreetmap.de"
      }
    ]
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          destination: "https://resume-dhjeong.vercel.app/:path*",
          basePath: false
        }
      ]
    };
  }
};

export default nextConfig;
