'use client';

import { Folder } from '@/src/lib/types';
import RemoveFolderButton from './RemoveFolderButton';
import { useFoldersByParentId } from '../hooks';
import Link from 'next/link';

export function ListAllFolders({ parentId }: { parentId: string }) {
  const { data: folders } = useFoldersByParentId(parentId);

  const foldersWithoutRoot = folders?.filter((folder) => !folder.isRoot);

  return (
    <div>
      {foldersWithoutRoot?.map((folder: Folder) => (
        <div className="flex items-center" key={folder.id}>
          <Link href={`/folder/${folder.id}`}>{folder.name}</Link>
          <RemoveFolderButton folderId={folder.id} />
        </div>
      ))}
    </div>
  );
}
