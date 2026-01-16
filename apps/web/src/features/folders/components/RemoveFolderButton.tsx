import { useDeleteFolder } from '../hooks';

export default function RemoveFolderButton({ folderId }: { folderId: string }) {
  const removeFolder = useDeleteFolder();
  return (
    <button
      className="ml-2 cursor-pointer rounded-full bg-red-500 px-2 text-white"
      onClick={() => removeFolder.mutate({ id: folderId })}
    >
      X
    </button>
  );
}
