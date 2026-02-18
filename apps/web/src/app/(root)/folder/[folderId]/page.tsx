import CreateFolderButton from '@/src/features/folders/components/CreateFolderButton';
import { ListAllFolders } from '@/src/features/folders/components/ListAllFolders';
import ShareFolderButton from '@/src/features/folders/components/ShareFolderButton';
import { PhotosList } from '@/src/features/photos/components/PhotosList';
import { UploadButton } from '@/src/features/photos/components/UploadButton';
import { Breadcrumbs } from '@/src/components/breadcrumbs';
import Link from 'next/link';

export default async function FolderPage(props: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await props.params;

  return (
    <div>
      <Link href="/" className="my-4 text-red-500">
        Go back to root
      </Link>
      <Breadcrumbs folderId={folderId} />
      <div className="my-4 flex flex-wrap items-center gap-2">
        <CreateFolderButton parentId={folderId} />
        <ShareFolderButton folderId={folderId} />
      </div>
      <ListAllFolders parentId={folderId} />
      <UploadButton folderId={folderId} />
      <PhotosList folderId={folderId} />
    </div>
  );
}
