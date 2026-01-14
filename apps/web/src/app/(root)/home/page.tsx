"use client";

import { useRootFolder } from "@/src/features/folders/hooks";
import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
	const session = useSession();
	const router = useRouter();
	const { data: rootFolder, isLoading } = useRootFolder();

	useEffect(() => {
		if (session.isPending || isLoading) return;
		if (!session.data) {
			router.push("/login");
		} else if (rootFolder?.id) {
			router.push(`/f/${rootFolder.id}`);
		}
	}, [session.isPending, session.data, isLoading, rootFolder, router]);

	if (session.isPending || isLoading) {
		return (
			<div className="flex h-screen items-center justify-center text-white">
				Loading...
			</div>
		);
	}

	return <div>Something went wrong: No root folder found</div>;
}
