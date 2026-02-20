import {
  folderShareLink,
  photoShareLink,
  sharePermissionEnum,
  type SharePermission,
} from '../db/schema.js';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const datePreprocess = z.preprocess(
  (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
  z.date(),
);

export const createPhotoShareLinkInputSchema = z.object({
  photoId: z.uuid(),
  permission: z.enum(sharePermissionEnum),
  expiresAt: datePreprocess,
  password: z.string().optional(),
});

export const createFolderShareLinkInputSchema = z.object({
  folderId: z.uuid(),
  permission: z.enum(sharePermissionEnum),
  expiresAt: datePreprocess,
  password: z.string().optional(),
});

export const createShareLinkOutputSchema = z.object({
  token: z.string(),
  expiresAt: z.date(),
  createdBy: z.string(),
});

export const photoShareLinkSelectSchema = createSelectSchema(
  photoShareLink,
).pick({
  token: true,
  expiresAt: true,
  createdBy: true,
});

export const folderShareLinkSelectSchema = createSelectSchema(
  folderShareLink,
).pick({
  token: true,
  expiresAt: true,
  createdBy: true,
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

export type PhotoShareLink = z.infer<typeof photoShareLinkSelectSchema>;
export type FolderShareLink = z.infer<typeof folderShareLinkSelectSchema>;

export type ShareLinkByToken =
  | {
      type: 'photo';
      photoId: string;
      createdBy: string;
      permission: SharePermission;
      passwordHash: string | null;
      expiresAt: Date;
      revokedAt: Date | null;
    }
  | {
      type: 'folder';
      folderId: string;
      createdBy: string;
      permission: SharePermission;
      passwordHash: string | null;
      expiresAt: Date;
      revokedAt: Date | null;
    };

export const getByTokenInputSchema = z.object({
  token: z.string(),
  password: z.string().optional(),
});

export const listFolderShareLinksInputSchema = z.object({
  folderId: z.uuid(),
});

export const listPhotoShareLinksInputSchema = z.object({
  photoId: z.uuid(),
});

export const revokeShareLinkInputSchema = z.object({
  token: z.string(),
});

const dateSchema = z.preprocess(
  (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
  z.date(),
);
const dateNullableSchema = z.preprocess(
  (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
  z.date().nullable(),
);

export const shareLinkListItemSchema = z.object({
  id: z.string(),
  token: z.string(),
  expiresAt: dateSchema,
  revokedAt: dateNullableSchema,
  permission: z.enum(sharePermissionEnum),
  createdAt: dateSchema,
  hasPassword: z.boolean(),
});

export type ShareLinkListItem = z.infer<typeof shareLinkListItemSchema>;

export const getShareLinkByTokenResponseSchema = z.discriminatedUnion(
  'requiresPassword',
  [
    z.object({
      requiresPassword: z.literal(true),
      type: z.enum(['photo', 'folder']),
    }),
    z.object({
      requiresPassword: z.literal(false),
      resourceId: z.string(),
      type: z.enum(['photo', 'folder']),
      permission: z.enum(sharePermissionEnum),
    }),
  ],
);

export type GetShareLinkByTokenResponse = z.infer<
  typeof getShareLinkByTokenResponseSchema
>;

export type GetByTokenInputSchema = z.infer<typeof getByTokenInputSchema>;
