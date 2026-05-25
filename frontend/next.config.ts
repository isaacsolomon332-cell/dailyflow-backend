import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'https://dailyflow-backend-kwuc.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;