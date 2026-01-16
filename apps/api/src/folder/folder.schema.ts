import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { folder } from '../db/schema.js';

export const folderSelectSchema = createSelectSchema(folder);
export const folderInsertSchema = createInsertSchema(folder);

export type Folder = z.infer<typeof folderSelectSchema>;
export type CreateFolder = z.infer<typeof folderInsertSchema>;

export const folderSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  ownerId: z.string(),
  parentId: z.string().nullable(),
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

export const createFolderSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  parentId: z.string(),
});

export type FolderSchema = z.infer<typeof folderSchema>;
export type CreateFolderSchema = z.infer<typeof createFolderSchema>;
