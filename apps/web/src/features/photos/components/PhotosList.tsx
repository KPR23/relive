'use client';
import { useFolderThumbnailUrls } from '../hooks';
import { PhotoItem } from './PhotoItem';

export const PhotosList = ({ folderId }: { folderId: string }) => {
  const { data, isLoading, error } = useFolderThumbnailUrls(folderId);

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error.message}</p>;
  if (!data || data.length === 0) return <p>No photos found</p>;

  return (
    <div>
      {data.map((photo) => (
        <PhotoItem key={photo.photoId} photo={photo} />
      ))}
    </div>
  );
};
