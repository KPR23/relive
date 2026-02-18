'use client';

import { AddPasskey } from '@/src/components/AddPasskey';
import CreateFolderButton from '@/src/features/folders/components/CreateFolderButton';
import { ListAllFolders } from '@/src/features/folders/components/ListAllFolders';
import { ListSharedFolders } from '@/src/features/folders/components/ListSharedFolders';
import { useRootFolder } from '@/src/features/folders/hooks';
import { AllPhotosList } from '@/src/features/photos/components/AllPhotosList';
import { UploadButton } from '@/src/features/photos/components/UploadButton';
import { signOut, useSession } from '@/src/lib/auth/auth-client';
import { Icon } from '@iconify-icon/react';
import { useRouter } from 'next/navigation';

export default function Root() {
  const router = useRouter();
  const session = useSession();
  const { data: rootFolder, isLoading: isRootFolderLoading } = useRootFolder({
    enabled: !!session.data?.user,
  });

  if (session.isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-black dark:bg-black dark:text-white">
        Loading...
      </div>
    );
  }

  if (!session.data?.user) {
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

  if (isRootFolderLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-black dark:bg-black dark:text-white">
        Loading...
      </div>
    );
  }

  if (!rootFolder || !rootFolder.id) {
    return <div>Not found</div>;
  }

  return (
    <div className="min-h-screen bg-white p-6 text-black dark:bg-gray-950 dark:text-white">
      <div className="m-4 flex items-center gap-2">
        <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-400">
          Relive {session.data.user.name} ({session.data.user.email})
        </h1>
        <button
          onClick={() => signOut()}
          className="h-10 cursor-pointer rounded-full bg-red-900 p-2 px-4 text-white"
        >
          Log out
        </button>
        <AddPasskey />
      </div>
      <div className="m-4">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400">
          Folders
        </h2>
        <Icon icon="solar:gallery-bold" width="24" height="24" />{' '}
        <Icon icon="solar:gallery-wide-linear" width="24" height="24" />
        <ListAllFolders parentId={rootFolder.id} />
        <ListSharedFolders />
      </div>
      <div className="m-4">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400">
          Create folder
        </h2>
        <CreateFolderButton />
      </div>
      <div className="m-4">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400">
          Upload photos
        </h2>
        <UploadButton folderId={rootFolder.id} />
      </div>
      <div className="m-4">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400">
          Photos
        </h2>
        <AllPhotosList />
      </div>
    </div>
  );
}
