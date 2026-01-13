import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { folder } from 'src/db/schema';
import z from 'zod';

export const folderSchema = createSelectSchema(folder);

export const createFolderSchema = createInsertSchema(folder);

export type Folder = z.infer<typeof folderSchema>;
export type CreateFolderSchema = z.infer<typeof createFolderSchema>;
