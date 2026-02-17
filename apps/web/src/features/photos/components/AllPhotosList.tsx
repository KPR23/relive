'use client';
import { useAllPhotos, useSharedPhotosWithMe } from '../hooks';
import { PhotoItem } from './PhotoItem';

export const AllPhotosList = () => {
  const { data, isLoading, error } = useAllPhotos();
  const {
    data: sharedPhotosWithMe,
    isLoading: isSharedPhotosWithMeLoading,
    error: sharedPhotosWithMeError,
  } = useSharedPhotosWithMe();

  if (isLoading || isSharedPhotosWithMeLoading) return <p>Loading…</p>;
  if (error || sharedPhotosWithMeError)
    return <p>{error?.message || sharedPhotosWithMeError?.message}</p>;

  return (
    <div className="flex flex-col gap-1">
      {!data && <p>No photos found</p>}
      {data &&
        data.map((photo) => <PhotoItem key={photo.photoId} photo={photo} />)}

      <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400">
        Photos shared with me
      </h2>
      {!sharedPhotosWithMe && <p>No shared photos with me</p>}
      {sharedPhotosWithMe && (
        <div className="flex flex-wrap gap-1">
          {sharedPhotosWithMe.map((photo) => (
            <PhotoItem key={photo.photoId} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
};
