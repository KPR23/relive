import { RouterInputs, RouterOutputs } from '../trpc/client';

export type Photo = RouterOutputs['photo']['listPhotosForFolder'][number];
export type SharedPhoto =
  RouterOutputs['photo']['sharedPhotosWithMe']['photos'][number];
export type Folder = RouterOutputs['folder']['getRootFolder'];

export type RequestUploadInput = RouterInputs['photo']['requestUpload'];
export type RequestUploadOutput = RouterOutputs['photo']['requestUpload'];

export type PhotoFile = RequestUploadInput & {
  photoId: string;
  uploadUrl: string;
};

export interface Session {
  session: {
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string;
    userAgent: string;
    userId: string;
    id: string;
  } | null;
  user: {
    name: string;
    email: string;
    emailVerified: boolean;
    image: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  } | null;
}
