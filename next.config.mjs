/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/blog",
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
