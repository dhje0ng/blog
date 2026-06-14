/** @type {import('next').NextConfig} */
const nextConfig = {
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
      beforeFiles: [
        {
          source: "/resume",
          destination: "https://resume-dhjeong.vercel.app"
        },
        {
          source: "/resume/:path*",
          destination: "https://resume-dhjeong.vercel.app/:path*"
        }
      ]
    };
  }
};

export default nextConfig;
