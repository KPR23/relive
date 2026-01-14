import Image from "next/image";
import { usePhotoUrl } from "../hooks";
import { Photo } from "../../types";

export function PhotoItem({ photo }: { photo: Photo }) {
	const { data, isLoading } = usePhotoUrl(photo.photoId);

	if (isLoading) return <div>Loading image…</div>;

	if (!data) return <div>Image not found</div>;

	return (
		<Image
			src={data.signedUrl}
			alt={photo.originalName}
			width={100}
			height={100}
		/>
	);
}
