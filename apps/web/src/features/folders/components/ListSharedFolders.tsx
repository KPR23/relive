import Link from 'next/link';
import { useListSharedFoldersWithMe } from '../hooks';

export function ListSharedFolders() {
  const { data: sharedFolders } = useListSharedFoldersWithMe();

  return (
    <div>
      <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400">
        Shared folders
      </h2>
      {sharedFolders?.map((sharedFolder) => (
        <Link key={sharedFolder.id} href={`/folder/${sharedFolder.id}`}>
          {sharedFolder.folderName} — shared by{' '}
          {sharedFolder.sharedBy ?? '(nieznany)'}
        </Link>
      ))}
    </div>
  );
}
