import { RouterInputs, RouterOutputs } from '../trpc/client';

export type Photo = RouterOutputs['photo']['listPhotos'][number];
export type Folder = RouterOutputs['folder']['getRootFolder'];

export type RequestUploadInput = RouterInputs['photo']['requestUpload'];
export type RequestUploadOutput = RouterOutputs['photo']['requestUpload'];

export type PhotoFile = RequestUploadInput & {
  photoId: string;
  uploadUrl: string;
};
