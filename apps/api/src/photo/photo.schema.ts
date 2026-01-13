import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { photo } from '../db/schema.js';

export const photoSelectSchema = createSelectSchema(photo);
export const photoInsertSchema = createInsertSchema(photo);

export const requestUploadSchema = z.object({
  folderId: z.string().uuid(),
  mimeType: z.string(),
  originalName: z.string(),
});

export const createPendingPhotoSchema = z.object({
  id: z.uuid(),
  ownerId: z.string(),
  folderId: z.uuid(),
  filePath: z.string(),
  thumbPath: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.string(),
  status: z.literal('pending'),
});

export type Photo = z.infer<typeof photoSelectSchema>;
export type PhotoInsert = z.infer<typeof photoInsertSchema>;
export type RequestUploadSchema = z.infer<typeof requestUploadSchema>;
export type CreatePendingPhoto = z.infer<typeof createPendingPhotoSchema>;
