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

  if (!rootFolderId) {
    return null;
  }

  const effectiveParentId = parentId ?? rootFolderId;

  return (
    <button
      className="m-4 cursor-pointer rounded-full bg-yellow-900 p-2 px-4 text-white"
      onClick={() => {
        if (!effectiveParentId) return;
        createFolder.mutate({
          name: 'New Folder',
          parentId: effectiveParentId,
        });
      }}
    >
      Create Folder
    </button>
  );
}
