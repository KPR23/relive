"use client";

import { useState, useEffect } from "react";
import { signIn, gitHubSignIn, useSession } from "@/src/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();
	const session = useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (session.data) {
			router.push("/home");
		}
	}, [session.data, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await signIn.email({
				email,
				password,
			});

			if (result.error) {
				setError(result.error.message || "Login failed");
			} else {
				router.push("/");
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center from-slate-900 via-purple-900 to-slate-900">
			<div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-white">Welcome Back</h1>
					<p className="mt-2 text-gray-300">Sign in to your account</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="p-3 text-sm text-red-200 bg-red-500/20 rounded-lg border border-red-500/30">
							{error}
						</div>
					)}

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-200"
						>
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="mt-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-200"
						>
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="mt-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
							placeholder="••••••••"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 px-4 from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>
				</form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-white/20"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-transparent text-gray-400">
							or continue with
						</span>
					</div>
				</div>

				<button
					type="button"
					onClick={() => gitHubSignIn()}
					className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 flex items-center justify-center gap-3"
				>
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
					</svg>
					Continue with GitHub
				</button>

				<p className="text-center text-gray-300">
					Don&apos;t have an account?{" "}
					<Link
						href="/register"
						className="text-purple-400 hover:text-purple-300 font-medium"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
