import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  photo: t.router({
    listPhotosForFolder: publicProcedure.input(z.object({
      folderId: z.uuid(),
    })).output(z.array(z.object({
      photoId: z.string(),
      folderId: z.string(),
      originalName: z.string(),
      createdAt: z.preprocess((arg) => {
        if (arg === null || arg === undefined) return null;
        if (arg instanceof Date) return arg;
        if (typeof arg === 'string') return new Date(arg);
        return null;
      }, z.date().nullable()),
      takenAt: z.preprocess((arg) => {
        if (arg === null || arg === undefined) return null;
        if (arg instanceof Date) return arg;
        if (typeof arg === 'string') return new Date(arg);
        return null;
      }, z.date().nullable()),
      width: z.number().nullable(),
      height: z.number().nullable(),
      thumbnailUrl: z.string(),
      cameraMake: z.string().nullish(),
      cameraModel: z.string().nullish(),
      lensModel: z.string().nullish(),
      exposureTime: z.number().nullish(),
      fNumber: z.number().nullish(),
      iso: z.number().nullish(),
      focalLength: z.number().nullish(),
      focalLength35mm: z.number().nullish(),
      gpsLat: z.number().nullish(),
      gpsLng: z.number().nullish(),
      gpsAltitude: z.number().nullish(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    listAllPhotos: publicProcedure.output(z.array(z.object({
      photoId: z.string(),
      folderId: z.string(),
      originalName: z.string(),
      createdAt: z.preprocess((arg) => {
        if (arg === null || arg === undefined) return null;
        if (arg instanceof Date) return arg;
        if (typeof arg === 'string') return new Date(arg);
        return null;
      }, z.date().nullable()),
      takenAt: z.preprocess((arg) => {
        if (arg === null || arg === undefined) return null;
        if (arg instanceof Date) return arg;
        if (typeof arg === 'string') return new Date(arg);
        return null;
      }, z.date().nullable()),
      width: z.number().nullable(),
      height: z.number().nullable(),
      thumbnailUrl: z.string(),
      cameraMake: z.string().nullish(),
      cameraModel: z.string().nullish(),
      lensModel: z.string().nullish(),
      exposureTime: z.number().nullish(),
      fNumber: z.number().nullish(),
      iso: z.number().nullish(),
      focalLength: z.number().nullish(),
      focalLength35mm: z.number().nullish(),
      gpsLat: z.number().nullish(),
      gpsLng: z.number().nullish(),
      gpsAltitude: z.number().nullish(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getThumbnailUrl: publicProcedure.input(z.object({ photoId: z.string().uuid() })).output(z.object({
      signedUrl: z.string(),
      expiresAt: z.date(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPhotoUrl: publicProcedure.input(z.object({ photoId: z.string().uuid() })).output(z.object({
      signedUrl: z.string(),
      expiresAt: z.date(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    movePhotoToFolder: publicProcedure.input(z.object({ photoId: z.string(), folderId: z.string() })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    removePhoto: publicProcedure.input(z.object({ photoId: z.string() })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    removePhotoFromFolder: publicProcedure.input(z.object({ photoId: z.string() })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
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
    getAllParentsForFolder: publicProcedure.input(z.object({ folderId: z.string() })).output(z.array(z.object({
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
    getMoveableFolders: publicProcedure.input(z
      .object({ currentFolderId: z.string().optional() })
      .optional()
      .default({})).output(z.array(z.object({
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

