import { PhotosList } from "@/src/features/photos/components/PhotosList";

export default async function FolderPage(props: {
	params: Promise<{ folderId: string }>;
}) {
	const params = await props.params;

	return (
		<div>
			<h1>Folder {params.folderId}</h1>
			<PhotosList folderId={params.folderId} />
		</div>
	);
}
