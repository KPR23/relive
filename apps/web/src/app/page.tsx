"use client";

import { trpc } from "../trpc/client";

export default function Home() {
	const mutation = trpc.photo.requestUpload.useMutation();

	const handleUpload = async (file: File, folderId: string) => {
		const { uploadUrl, photoId } = await mutation.mutateAsync({
			folderId,
			mimeType: file.type,
			originalName: file.name,
		});
		console.log("Upload URL:", uploadUrl, "Photo ID:", photoId);
	};

	return (
		<div>
			<h1>Relive</h1>
			<p>Upload your photos</p>
			{/* Example trigger */}
			<button
				onClick={() => {
					const dummyFile = new File(["test"], "test.png", {
						type: "image/png",
					});
					const dummyFolderId = "00000000-0000-0000-0000-000000000000";
					handleUpload(dummyFile, dummyFolderId);
				}}
				disabled={mutation.isLoading}
			>
				{mutation.isLoading ? "Uploading..." : "Test Upload"}
			</button>
		</div>
	);
}
