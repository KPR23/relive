'use client';

import { Folder } from '@/src/features/types';
import RemoveFolderButton from './RemoveFolderButton';
import { useFoldersByParentId } from '../hooks';

export function ListAllFolders({ parentId }: { parentId: string }) {
  const { data: folders } = useFoldersByParentId(parentId);

  return (
    <div>
      {folders?.map((folder: Folder) => (
        <div className="flex items-center" key={folder.id}>
          <a href={`/folder/${folder.id}`}>{folder.name}</a>
          <RemoveFolderButton folderId={folder.id} />
        </div>
      ))}
    </div>
  );
}
