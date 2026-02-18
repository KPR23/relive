import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { photo, sharePermissionEnum } from '../db/schema.js';
import { dateFromString } from '../helpers/helpers.js';

export const photoSelectSchema = createSelectSchema(photo);
export const photoInsertSchema = createInsertSchema(photo);

export const requestUploadSchema = z.object({
  folderId: z.uuid(),
  mimeType: z.string(),
  originalName: z.string(),
});

export const listPhotosSchema = z.object({
  folderId: z.uuid(),
});

export const photoIdInputSchema = z.object({
  photoId: z.uuid(),
});

export const movePhotoToFolderInputSchema = z.object({
  photoId: z.uuid(),
  folderId: z.uuid(),
});

export const sharePhotoWithUserInputSchema = z.object({
  photoId: z.uuid(),
  targetUserEmail: z.email(),
  permission: z.enum(sharePermissionEnum),
});

export const revokePhotoShareInputSchema = z.object({
  photoId: z.uuid(),
  targetUserId: z.string().min(1),
});

export const createPendingPhotoSchema = z.object({
  id: z.uuid(),
  ownerId: z.string(),
  folderId: z.uuid(),
  filePath: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
});

export const confirmUploadPhotoSchema = z.object({
  photoId: z.uuid(),
  ownerId: z.string(),
});

export const photoListItemSchema = z.object({
  photoId: z.uuid(),
  folderId: z.uuid(),
  originalName: z.string(),
  ownerEmail: z.email().optional(),
  createdAt: dateFromString,
  takenAt: dateFromString,
  width: z.number().nullable(),
  height: z.number().nullable(),
  thumbnailUrl: z.string(),
  cameraMake: z.string().nullish(),
  cameraModel: z.string().nullish(),
  lensModel: z.string().nullish(),
  exposureTime: z.number().nullish(),
  fNumber: z.number().nullish(),
  iso: z.number().nullish(),
  focalLength: z.number().nullish(),
  focalLength35mm: z.number().nullish(),
  gpsLat: z.number().nullish(),
  gpsLng: z.number().nullish(),
  gpsAltitude: z.number().nullish(),
});

export const photoListSchema = z.array(photoListItemSchema);

export const sharedPhotosWithMeOutputSchema = z.object({
  photos: z.array(photoListItemSchema),
});

export const photoShareListItemSchema = z.object({
  id: z.uuid(),
  sharedWithId: z.string(),
  sharedWithEmail: z.email(),
  permission: z.enum(sharePermissionEnum),
  expiresAt: dateFromString,
});

export const requestUploadOutputSchema = z.object({
  uploadUrl: z.string(),
  photoId: z.uuid(),
});

export const confirmUploadOutputSchema = z.object({
  status: z.string(),
});

export const signedUrlOutputSchema = z.object({
  signedUrl: z.string(),
  expiresAt: z.date(),
});

export const exifSchema = z
  .object({
    cameraMake: z.string().optional(),
    cameraModel: z.string().optional(),
    lensModel: z.string().optional(),
    exposureTime: z.number().optional(),
    fNumber: z.number().optional(),
    iso: z.number().optional(),
    focalLength: z.number().optional(),
    focalLength35mm: z.number().optional(),
    gpsLat: z.number().optional(),
    gpsLng: z.number().optional(),
    gpsAltitude: z.number().optional(),
    takenAt: z.date().optional(),
  })
  .optional();

export type Photo = z.infer<typeof photoSelectSchema>;
export type PhotoListItem = z.infer<typeof photoListItemSchema>;
export type RequestUploadOutput = z.infer<typeof requestUploadOutputSchema>;
export type RequestUploadSchema = z.infer<typeof requestUploadSchema>;
export type CreatePendingPhoto = z.infer<typeof createPendingPhotoSchema>;
export type ConfirmUploadPhoto = z.infer<typeof confirmUploadPhotoSchema>;
export type ListPhotosSchema = z.infer<typeof listPhotosSchema>;
export type PhotoIdInputSchema = z.infer<typeof photoIdInputSchema>;
export type MovePhotoToFolderInputSchema = z.infer<
  typeof movePhotoToFolderInputSchema
>;
export type ExifSchema = z.infer<typeof exifSchema>;
export type SharePhotoWithUserInputSchema = z.infer<
  typeof sharePhotoWithUserInputSchema
>;
export type PhotoShareListItem = z.infer<typeof photoShareListItemSchema>;
export type RevokePhotoShareInputSchema = z.infer<
  typeof revokePhotoShareInputSchema
>;
