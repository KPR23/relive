/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: process.env.STORAGE_HOSTNAME || 'localhost',
        protocol: 'https',
      },
    ],
  },
  rewrites: () => [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
    },
  ],
};

export default nextConfig;
