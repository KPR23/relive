'use client';
import { useAllParentsForFolder } from '@/src/features/folders/hooks';
import Link from 'next/link';

export function Breadcrumbs({ folderId }: { folderId: string }) {
  const { data: folder } = useAllParentsForFolder(folderId);

  const folders = folder ?? [];

  return (
    <div className="flex items-center gap-1">
      <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
        Strona główna
      </Link>
      {folders.map((f) => (
        <span key={f.id} className="flex items-center gap-1">
          <span className="text-gray-500">/</span>
          <Link
            href={f.isRoot ? '/' : `/folder/${f.id}`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {f.name}
          </Link>
        </span>
      ))}
    </div>
  );
}
