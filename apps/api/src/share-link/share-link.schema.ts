import { sharePermissionEnum } from 'src/db/schema.js';
import { z } from 'zod';

export const createPhotoShareLinkInputSchema = z.object({
  photoId: z.uuid(),
  permission: z.enum(sharePermissionEnum),
  expiresAt: z.date(),
  password: z.string().optional(),
});

export const createFolderShareLinkInputSchema = z.object({
  folderId: z.uuid(),
  permission: z.enum(sharePermissionEnum),
  expiresAt: z.date(),
  password: z.string().optional(),
});

export const createShareLinkOutputSchema = z.object({
  token: z.string(),
  expiresAt: z.date(),
  createdBy: z.string(),
});

export type CreatePhotoShareLinkInputSchema = z.infer<
  typeof createPhotoShareLinkInputSchema
>;

export type CreateFolderShareLinkInputSchema = z.infer<
  typeof createFolderShareLinkInputSchema
>;

export type CreateShareLinkOutputSchema = z.infer<
  typeof createShareLinkOutputSchema
>;
