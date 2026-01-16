import CreateFolderButton from '@/src/features/folders/components/CreateFolderButton';
import { ListAllFolders } from '@/src/features/folders/components/ListAllFolders';
import { Breadcrumbs } from '@/src/lib/components/breadcrumbs';

export default async function FolderPage(props: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await props.params;

  return (
    <div>
      Folder Page {folderId}
      <Breadcrumbs folderId={folderId} />
      <CreateFolderButton parentId={folderId} />
      <ListAllFolders parentId={folderId} />
    </div>
  );
}
