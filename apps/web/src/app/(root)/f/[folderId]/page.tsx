import { PhotosList } from '@/src/features/photos/components/PhotosList';
import { UploadButton } from '@/src/features/photos/components/UploadButton';

export default async function FolderPage(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;

  return (
    <div>
      <h1>Folder {params.folderId}</h1>

      <UploadButton folderId={params.folderId} />
      <PhotosList folderId={params.folderId} />
    </div>
  );
}
