'use client';
import { useAllParentsForFolder } from '@/src/features/folders/hooks';
import Link from 'next/link';

export function Breadcrumbs({ folderId }: { folderId: string }) {
  const { data: folder } = useAllParentsForFolder(folderId);

  return (
    <div className="flex">
      {folder?.map((folder, index) => (
        <div key={folder.id}>
          {'/'}
          <Link href={`/folder/${folder.id}`}>{folder.name}</Link>
        </div>
      ))}
    </div>
  );
}
