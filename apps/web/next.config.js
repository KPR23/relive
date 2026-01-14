/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: process.env.STORAGE_HOSTNAME,
			},
		],
	},
	rewrites: () => {
		return [
			{
				source: "/api/:path*",
				destination: `${process.env.API_URL || "http://localhost:8000"}/api/:path*`,
			},
		];
	},
};

export default nextConfig;
