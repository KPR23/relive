import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { folder } from '../db/schema.js';

export const folderSelectSchema = createSelectSchema(folder);
export const folderInsertSchema = createInsertSchema(folder);

export const folderSchema = folderSelectSchema;

export type Folder = z.infer<typeof folderSelectSchema>;
export type CreateFolder = z.infer<typeof folderInsertSchema>;

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

export const getMoveableFoldersInputSchema = z
  .object({ currentFolderId: z.uuid().optional() })
  .optional()
  .default({});

export const moveFolderInputSchema = z.object({
  movingFolderId: z.uuid(),
  targetParentId: z.uuid(),
});

export const deleteFolderInputSchema = z.object({
  id: z.uuid(),
});

export type FolderSchema = z.infer<typeof folderSchema>;
export type CreateFolderSchema = z.infer<typeof createFolderSchema>;
export type ParentIdInputSchema = z.infer<typeof parentIdInputSchema>;
export type FolderIdInputSchema = z.infer<typeof folderIdInputSchema>;
export type GetMoveableFoldersInputSchema = z.infer<
  typeof getMoveableFoldersInputSchema
>;
export type MoveFolderInputSchema = z.infer<typeof moveFolderInputSchema>;
export type DeleteFolderInputSchema = z.infer<typeof deleteFolderInputSchema>;
