export default async function FolderPage(props: {
	params: Promise<{ folderId: string }>;
}) {
	const params = await props.params;

	return <div>Folder {params.folderId}</div>;
}
