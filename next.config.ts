import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/content/:path*',
        destination: 'https://dmrafr2igetxh.cloudfront.net/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dmrafr2igetxh.cloudfront.net',
      },
    ],
  },
};

export default nextConfig;
