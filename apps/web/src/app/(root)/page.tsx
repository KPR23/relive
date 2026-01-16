'use client';

import { useFolders, useRootFolder } from '@/src/features/folders/hooks';
import { PhotosList } from '@/src/features/photos/components/PhotosList';
import { UploadButton } from '@/src/features/photos/components/UploadButton';
import { Folder } from '@/src/features/types';
import { signOut, useSession } from '@/src/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Root() {
  const router = useRouter();
  const session = useSession();
  const { data: rootFolder, isLoading: isRootFolderLoading } = useRootFolder();
  const { data: folders, isLoading: isFoldersLoading } = useFolders();

  if (!session?.data?.user) {
    return (
      <div>
        Unauthorized <br />
        <button
          onClick={() => router.push('/login')}
          className="m-4 cursor-pointer rounded-full bg-blue-900 p-2 px-4 text-white"
        >
          Log in
        </button>
      </div>
    );
  }

  if (session.isPending || isRootFolderLoading || isFoldersLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!rootFolder?.id) {
    return <div>Photos not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-800">Relive</h1>
      <button
        onClick={() => signOut()}
        className="m-4 cursor-pointer rounded-full bg-red-900 p-2 px-4 text-white"
      >
        Log out
      </button>
      {folders?.map((folder: Folder) => (
        <div key={folder.id}>{folder.name}</div>
      ))}
      <UploadButton folderId={rootFolder?.id} />
      <PhotosList folderId={rootFolder?.id} />
    </div>
  );
}
