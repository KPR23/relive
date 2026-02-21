'use client';
import { useState } from 'react';
import { useAllPhotos, useRemovePhoto, useSharedPhotosWithMe } from '../hooks';
import { PhotoItem } from './PhotoItem';
import { Button } from '@/components/ui/button';
import { Photo } from '@/src/lib/types';

export const AllPhotosList = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const removePhoto = useRemovePhoto();
  const { data, isLoading, error } = useAllPhotos();
  const {
    data: sharedPhotosWithMe,
    isLoading: isSharedPhotosWithMeLoading,
    error: sharedPhotosWithMeError,
  } = useSharedPhotosWithMe();

  if (isLoading || isSharedPhotosWithMeLoading) return <p>Loading…</p>;
  if (error || sharedPhotosWithMeError)
    return <p>{error?.message || sharedPhotosWithMeError?.message}</p>;

  const handleRemovePhoto = (photo: Photo) =>
    removePhoto.mutateAsync({ photoId: photo.photoId });

  return (
    <>
      <div className="my-2 mb-4 flex gap-4">
        <Button
          variant="outline"
          onClick={() => setSelected(data?.map((photo) => photo.photoId) ?? [])}
        >
          Select all
        </Button>
        <Button variant="outline" onClick={() => setSelected([])}>
          Unselect all
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const photosToDelete = data?.filter((photo) =>
              selected.includes(photo.photoId),
            );
            if (photosToDelete) {
              const results = await Promise.allSettled(
                photosToDelete.map((photo) => handleRemovePhoto(photo)),
              );

              const failed = results.filter((r) => r.status === 'rejected');

              if (failed.length > 0) {
                failed.forEach((r) =>
                  console.error((r as PromiseRejectedResult).reason),
                );
                alert(
                  `${failed.length} of ${photosToDelete.length} photo(s) failed to delete`,
                );
              }

              setSelected([]);
            }
          }}
        >
          Delete selected
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {data && data.length > 0 ? (
          data.map((photo) => (
            <PhotoItem
              key={photo.photoId}
              photo={photo}
              source="folder"
              selected={selected}
              setSelected={setSelected}
            />
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
          <div className="flex flex-wrap gap-1">
            {sharedPhotosWithMe.photos.map((photo) => (
              <PhotoItem key={photo.photoId} photo={photo} source="shared" />
            ))}
          </div>
        ) : (
          <p>No shared photos found</p>
        )}
      </div>
    </>
  );
};
