"use client";
import { usePhotos } from "../hooks";
import { PhotoItem } from "./PhotoItem";

export const PhotosList = ({ folderId }: { folderId: string }) => {
	const { data, isLoading, error } = usePhotos(folderId);

	if (isLoading) return <p>Loading…</p>;
	if (error) return <p>{error.message}</p>;

	return (
		<div>
			{data.map((photo) => (
				<PhotoItem key={photo.photoId} photo={photo} />
			))}
		</div>
	);
};
