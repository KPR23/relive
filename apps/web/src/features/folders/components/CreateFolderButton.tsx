'use client';

import { useCreateFolder, useRootFolder } from '../hooks';

interface CreateFolderButtonProps {
  parentId?: string;
}

export default function CreateFolderButton({
  parentId,
}: CreateFolderButtonProps) {
  const createFolder = useCreateFolder();
  const rootFolderId = useRootFolder().data?.id;

  return (
    <button
      className="m-4 cursor-pointer rounded-full bg-yellow-900 p-2 px-4 text-white"
      onClick={() =>
        createFolder.mutate({
          name: 'New Folder',
          parentId: parentId ?? rootFolderId,
        })
      }
    >
      Create Folder
    </button>
  );
}
