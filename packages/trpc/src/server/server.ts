import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  todo: t.router({
    getTodoById: publicProcedure.input(z.object({ id: z.string() })).output(z.object({
      id: z.string(),
      name: z.string(),
      completed: z.boolean(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getAllTodos: publicProcedure.output(z.array(z.object({
      id: z.string(),
      name: z.string(),
      completed: z.boolean(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createTodo: publicProcedure.input(z.object({
      id: z.string(),
      name: z.string(),
      completed: z.boolean(),
    }).omit({ id: true })).output(z.object({
      id: z.string(),
      name: z.string(),
      completed: z.boolean(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateTodo: publicProcedure.input(z.object({
      id: z.string(), data: z.object({
        id: z.string(),
        name: z.string(),
        completed: z.boolean(),
      }).omit({ id: true }).partial()
    })).output(z.object({
      id: z.string(),
      name: z.string(),
      completed: z.boolean(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteTodo: publicProcedure.input(z.object({ id: z.string() })).output(z.boolean()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  photo: t.router({
    requestUpload: publicProcedure.input(createInsertSchema(pgTable(
      'photo',
      {
        id: text('id').primaryKey(),
        ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
        folderId: text('folder_id').notNull().references(() => folder.id, { onDelete: 'cascade' }),
        filePath: text('file_path').notNull(),
        thumbPath: text('thumb_path'),
        originalName: text('original_name').notNull(),
        mimeType: text('mime_type').notNull(),
        size: text('size'),
        takenAt: timestamp('taken_at'),
        width: text('width'),
        height: text('height'),
        exif: text('exif'),
        status: photoStatusEnum().notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
      },
      (table) => [
        index('photo_owner_idx').on(table.ownerId),
        index('photo_folder_idx').on(table.folderId),
      ],
    ), {
      folderId: z.uuid(),
    }).pick({
      folderId: true,
      mimeType: true,
      originalName: true,
    })).output(z.object({
      uploadUrl: z.string(),
      photoId: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

