/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
	rewrites: () => {
		return [
			{
				source: "/trpc/:path*",
				destination: `${process.env.TRPC_URL || "http://localhost:8000/trpc"}/:path*`,
			},
		];
	},
};

export default nextConfig;
