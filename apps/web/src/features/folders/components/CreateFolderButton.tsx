'use client';

import { useState } from 'react';
import { useCreateFolder, useRootFolder } from '../hooks';

interface CreateFolderButtonProps {
  parentId?: string;
}

export default function CreateFolderButton({
  parentId,
}: CreateFolderButtonProps) {
  const createFolder = useCreateFolder();
  const rootFolderId = useRootFolder().data?.id;
  const [name, setName] = useState('');

  if (!rootFolderId) {
    return null;
  }

  const effectiveParentId = parentId ?? rootFolderId;

  return (
    <form className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        className="h-12 rounded-full border border-gray-300 bg-gray-200 px-4 py-2 text-black dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="m-4 h-12 cursor-pointer rounded-full bg-yellow-900 p-2 px-4 text-white"
        onClick={(e) => {
          e.preventDefault();
          if (!effectiveParentId) return;
          createFolder.mutate({
            name,
            parentId: effectiveParentId,
          });
        }}
      >
        Create Folder
      </button>
    </form>
  );
}
