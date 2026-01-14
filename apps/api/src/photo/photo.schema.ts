import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { photo } from '../db/schema.js';

export const photoSelectSchema = createSelectSchema(photo);
export const photoInsertSchema = createInsertSchema(photo);

export const requestUploadSchema = z.object({
  folderId: z.uuid(),
  mimeType: z.string(),
  originalName: z.string(),
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
  photoId: z.string(),
  ownerId: z.string(),
});

export const listPhotosSchema = z.object({
  folderId: z.uuid(),
});

export type Photo = z.infer<typeof photoSelectSchema>;
export type RequestUploadSchema = z.infer<typeof requestUploadSchema>;
export type CreatePendingPhoto = z.infer<typeof createPendingPhotoSchema>;
export type ConfirmUploadPhoto = z.infer<typeof confirmUploadPhotoSchema>;
export type ListPhotosSchema = z.infer<typeof listPhotosSchema>;
