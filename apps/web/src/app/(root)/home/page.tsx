"use client";

import { useRootFolder } from "@/src/features/folders/hooks";
import { useSession } from "@/src/lib/auth-client";
import { redirect } from "next/navigation";

export default function Home() {
	const session = useSession();
	const { data: rootFolder, isLoading } = useRootFolder();

	if (session.isPending || isLoading) {
		return (
			<div className="flex h-screen items-center justify-center text-white">
				Loading...
			</div>
		);
	}

	if (!session.data) {
		redirect("/login");
	}

	if (rootFolder?.id) {
		redirect(`/f/${rootFolder.id}`);
	}

	return <div>Something went wrong: No root folder found</div>;
}
