import CreateFolderButton from '@/src/features/folders/components/CreateFolderButton';
import { ListAllFolders } from '@/src/features/folders/components/ListAllFolders';
import { PhotosList } from '@/src/features/photos/components/PhotosList';
import { UploadButton } from '@/src/features/photos/components/UploadButton';
import { Breadcrumbs } from '@/src/lib/components/breadcrumbs';
import Link from 'next/link';

export default async function FolderPage(props: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await props.params;

  return (
    <div>
      Folder Page {folderId} <br />
      <Link href="/" className="my-4 text-red-500">
        Go back to root
      </Link>
      <Breadcrumbs folderId={folderId} />
      <CreateFolderButton parentId={folderId} />
      <ListAllFolders parentId={folderId} />
      <UploadButton folderId={folderId} />
      <PhotosList folderId={folderId} />
    </div>
  );
}
