/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: process.env.STORAGE_HOSTNAME || 'localhost',
        protocol: 'https',
      },
      {
        hostname: process.env.STORAGE_HOSTNAME_2 || 'localhost',
        protocol: 'https',
      },
    ],
  },
  rewrites: () => [
    {
      source: '/api/:path*',
      destination: `${process.env.API_URL}/api/:path*`,
    },
  ],
};

export default nextConfig;
