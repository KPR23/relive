import { useDeleteFolder } from '../hooks';

export default function RemoveFolderButton({ folderId }: { folderId: string }) {
  const removeFolder = useDeleteFolder();
  return (
    <button
      className="ml-2 cursor-pointer rounded-full bg-red-500 px-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      disabled={removeFolder.isPending}
      onClick={() => {
        if (window.confirm('Are you sure you want to delete this folder?')) {
          removeFolder.mutate({ id: folderId });
        }
      }}
      aria-label="Delete folder"
    >
      X
    </button>
  );
}
