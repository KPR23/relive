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
    <>
      <div className="flex flex-wrap gap-1">
        {data && data.length > 0 ? (
          data.map((photo) => (
            <PhotoItem key={photo.photoId} photo={photo} source="folder" />
          ))
        ) : (
          <p>No photos found</p>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400">
          Photos shared with me
        </h2>
        {sharedPhotosWithMe && sharedPhotosWithMe.photos.length > 0 ? (
          sharedPhotosWithMe.photos.map((photo) => (
            <PhotoItem key={photo.photoId} photo={photo} source="shared" />
          ))
        ) : (
          <p>No shared photos found</p>
        )}
      </div>
    </>
  );
};
