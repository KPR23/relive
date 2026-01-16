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
    listPhotos: publicProcedure.input(z.object({
      folderId: z.uuid(),
    })).output(z.array(
      z.object({
        photoId: z.string(),
        originalName: z.string(),
        createdAt: z.date(),
        takenAt: z.date().nullable(),
        width: z.number().nullable(),
        height: z.number().nullable(),
      }),
    )).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPhotoUrl: publicProcedure.input(z.object({ photoId: z.string().uuid() })).output(z.object({
      signedUrl: z.string(),
      expiresAt: z.date(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    requestUpload: publicProcedure.input(z.object({
      folderId: z.uuid(),
      mimeType: z.string(),
      originalName: z.string(),
    })).output(z.object({
      uploadUrl: z.string(),
      photoId: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    confirmUpload: publicProcedure.input(z.object({ photoId: z.string() })).output(z.object({
      status: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  folder: t.router({
    getRootFolder: publicProcedure.output(z.object({
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
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getAllFolders: publicProcedure.output(z.array(z.object({
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
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getFolderChildren: publicProcedure.input(z.object({ parentId: z.string() })).output(z.array(z.object({
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
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createFolder: publicProcedure.input(z.object({
      name: z.string(),
      description: z.string().optional().nullable(),
      parentId: z.string(),
    })).output(z.object({
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
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    moveFolder: publicProcedure.input(z.object({ movingFolderId: z.string(), targetParentId: z.string() })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteFolder: publicProcedure.input(z.object({ id: z.string() })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

