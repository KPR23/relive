'use client';

import CreateFolderButton from '@/src/features/folders/components/CreateFolderButton';
import { ListAllFolders } from '@/src/features/folders/components/ListAllFolders';
import { useRootFolder } from '@/src/features/folders/hooks';
import { PhotosList } from '@/src/features/photos/components/PhotosList';
import { UploadButton } from '@/src/features/photos/components/UploadButton';
import { signOut, useSession } from '@/src/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Root() {
  const router = useRouter();
  const session = useSession();
  const { data: rootFolder, isLoading: isRootFolderLoading } = useRootFolder({
    enabled: !!session.data?.user,
  });

  if (session.isPending) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
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
      <div className="flex h-screen items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!rootFolder || !rootFolder.id) {
    return <div>Not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-800">Relive</h1>
      <button
        onClick={() => signOut()}
        className="m-4 cursor-pointer rounded-full bg-red-900 p-2 px-4 text-white"
      >
        Logout
      </button>
      <ListAllFolders parentId={rootFolder.id} />
      <CreateFolderButton />
      <UploadButton folderId={rootFolder.id} />
      <PhotosList folderId={rootFolder.id} />
    </div>
  );
}
