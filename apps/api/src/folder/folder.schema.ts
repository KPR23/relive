import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { folder, sharePermissionEnum } from '../db/schema.js';
import { dateFromString } from '../helpers/helpers.js';

export const folderSelectSchema = createSelectSchema(folder);
export const folderInsertSchema = createInsertSchema(folder);

export const folderSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  ownerId: z.string(),
  parentId: z.uuid().nullable(),
  isRoot: z.boolean(),
  createdAt: z.preprocess(
    (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
    z.date(),
  ),
  updatedAt: z.preprocess(
    (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
    z.date(),
  ),
});

export const folderForShareLinkSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  description: z.string().optional().nullable(),
  parentId: z.uuid(),
});

export const parentIdInputSchema = z.object({
  parentId: z.uuid(),
});

export const folderIdInputSchema = z.object({
  folderId: z.uuid(),
});

export const getMoveableFoldersInputSchema = z.object({
  currentFolderId: z.uuid().optional(),
});

export const moveFolderInputSchema = z.object({
  movingFolderId: z.uuid(),
  targetParentId: z.uuid(),
});

export const deleteFolderInputSchema = z.object({
  id: z.uuid(),
});

export const shareFolderWithUserInputSchema = z.object({
  folderId: z.uuid(),
  targetUserEmail: z.email(),
  permission: z.enum(sharePermissionEnum),
  expiresAt: z.preprocess(
    (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
    z.date(),
  ),
});

export const revokeFolderShareInputSchema = z.object({
  folderId: z.uuid(),
  targetUserId: z.string().min(1, 'targetUserId is required'),
});

export const folderShareRecipientSchema = z.object({
  id: z.uuid(),
  folderId: z.uuid(),
  folderName: z.string(),
  sharedWithId: z.string(),
  sharedWithEmail: z.email(),
  permission: z.enum(sharePermissionEnum),
  status: z.enum(['ACTIVE', 'EXPIRED']),
  expiresAt: dateFromString,
});

export const folderSharedWithMeSchema = z.object({
  id: z.uuid(),
  folderId: z.uuid(),
  folderName: z.string(),
  sharedByName: z.string().optional(),
  permission: z.enum(sharePermissionEnum),
  expiresAt: dateFromString,
});

export type Folder = z.infer<typeof folderSelectSchema>;
export type CreateFolder = z.infer<typeof folderInsertSchema>;
export type FolderSchema = z.infer<typeof folderSchema>;
export type CreateFolderSchema = z.infer<typeof createFolderSchema>;
export type ParentIdInputSchema = z.infer<typeof parentIdInputSchema>;
export type FolderIdInputSchema = z.infer<typeof folderIdInputSchema>;
export type GetMoveableFoldersInputSchema = z.infer<
  typeof getMoveableFoldersInputSchema
>;
export type MoveFolderInputSchema = z.infer<typeof moveFolderInputSchema>;
export type DeleteFolderInputSchema = z.infer<typeof deleteFolderInputSchema>;
export type ShareFolderWithUserInputSchema = z.infer<
  typeof shareFolderWithUserInputSchema
>;
export type RevokeFolderShareInputSchema = z.infer<
  typeof revokeFolderShareInputSchema
>;
export type FolderShareRecipient = z.infer<typeof folderShareRecipientSchema>;
export type FolderSharedWithMe = z.infer<typeof folderSharedWithMeSchema>;
export type FolderForShareLink = z.infer<typeof folderForShareLinkSchema>;
