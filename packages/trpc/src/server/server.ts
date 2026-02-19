import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  photo: t.router({
    listPhotosForFolder: publicProcedure.input(z.object({
      folderId: z.uuid(),
    })).output(z.array(z.object({
      photoId: z.uuid(),
      folderId: z.uuid(),
      originalName: z.string(),
      ownerName: z.string().nullish(),
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
      photoId: z.uuid(),
      folderId: z.uuid(),
      originalName: z.string(),
      ownerName: z.string().nullish(),
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
    listPhotoShares: publicProcedure.input(z.object({
      photoId: z.uuid(),
    })).output(z.array(z.object({
      id: z.uuid(),
      sharedWithId: z.string(),
      sharedWithEmail: z.email(),
      permission: z.enum({
        VIEW: 'VIEW',
        EDIT: 'EDIT',
      } as const),
      status: z.enum(['ACTIVE', 'EXPIRED']),
      expiresAt: z.preprocess((arg) => {
        if (arg === null || arg === undefined) return null;
        if (arg instanceof Date) return arg;
        if (typeof arg === 'string') return new Date(arg);
        return null;
      }, z.date().nullable()),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getThumbnailUrl: publicProcedure.input(z.object({
      photoId: z.uuid(),
    })).output(z.object({
      signedUrl: z.string(),
      expiresAt: z.date(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPhotoUrl: publicProcedure.input(z.object({
      photoId: z.uuid(),
    })).output(z.object({
      signedUrl: z.string(),
      expiresAt: z.date(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    sharedPhotosWithMe: publicProcedure.output(z.object({
      photos: z.array(z.object({
        photoId: z.uuid(),
        folderId: z.uuid(),
        originalName: z.string(),
        ownerName: z.string().nullish(),
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
      })),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    sharePhotoWithUser: publicProcedure.input(z.object({
      photoId: z.uuid(),
      targetUserEmail: z.email(),
      permission: z.enum({
        VIEW: 'VIEW',
        EDIT: 'EDIT',
      } as const),
      expiresAt: z.preprocess((arg) => {
        if (arg === null || arg === undefined) return undefined;
        if (arg instanceof Date) return arg;
        if (typeof arg === 'string') return new Date(arg);
        return undefined;
      }, z.date()),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    movePhotoToFolder: publicProcedure.input(z.object({
      photoId: z.uuid(),
      folderId: z.uuid(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    removePhoto: publicProcedure.input(z.object({
      photoId: z.uuid(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    removePhotoFromFolder: publicProcedure.input(z.object({
      photoId: z.uuid(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    revokePhotoShare: publicProcedure.input(z.object({
      photoId: z.uuid(),
      targetUserId: z.string().min(1),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    requestUpload: publicProcedure.input(z.object({
      folderId: z.uuid(),
      mimeType: z.string(),
      originalName: z.string(),
    })).output(z.object({
      uploadUrl: z.string(),
      photoId: z.uuid(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    confirmUpload: publicProcedure.input(z.object({
      photoId: z.uuid(),
    })).output(z.object({
      status: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  folder: t.router({
    getRootFolder: publicProcedure.output(z.object({
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
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getAllFolders: publicProcedure.output(z.array(z.object({
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
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getFolderChildren: publicProcedure.input(z.object({
      parentId: z.uuid(),
    })).output(z.array(z.object({
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
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getAllParentsForFolder: publicProcedure.input(z.object({
      folderId: z.uuid(),
    })).output(z.array(z.object({
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
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMoveableFolders: publicProcedure.input(z.object({
      currentFolderId: z.uuid().optional(),
    })).output(z.array(z.object({
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
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createFolder: publicProcedure.input(z.object({
      name: z.string().min(1, 'Folder name is required'),
      description: z.string().optional().nullable(),
      parentId: z.uuid(),
    })).output(z.object({
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
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    moveFolder: publicProcedure.input(z.object({
      movingFolderId: z.uuid(),
      targetParentId: z.uuid(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteFolder: publicProcedure.input(z.object({
      id: z.uuid(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    shareFolderWithUser: publicProcedure.input(z.object({
      folderId: z.uuid(),
      targetUserEmail: z.email(),
      permission: z.enum({
        VIEW: 'VIEW',
        EDIT: 'EDIT',
      } as const),
      expiresAt: z.preprocess(
        (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
        z.date(),
      ),
    })).output(z.object({ success: z.literal(true) })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    listFolderShares: publicProcedure.input(z.object({
      folderId: z.uuid(),
    })).output(z.array(z.object({
      id: z.uuid(),
      folderId: z.uuid(),
      folderName: z.string(),
      sharedWithId: z.string(),
      sharedWithEmail: z.email(),
      permission: z.enum({
        VIEW: 'VIEW',
        EDIT: 'EDIT',
      } as const),
      status: z.enum(['ACTIVE', 'EXPIRED']),
      expiresAt: z.preprocess((arg) => {
        if (arg === null || arg === undefined) return null;
        if (arg instanceof Date) return arg;
        if (typeof arg === 'string') return new Date(arg);
        return null;
      }, z.date().nullable()),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    listSharedFoldersWithMe: publicProcedure.output(z.array(z.object({
      id: z.uuid(),
      folderId: z.uuid(),
      folderName: z.string(),
      sharedByName: z.string().optional(),
      permission: z.enum({
        VIEW: 'VIEW',
        EDIT: 'EDIT',
      } as const),
      expiresAt: z.preprocess((arg) => {
        if (arg === null || arg === undefined) return null;
        if (arg instanceof Date) return arg;
        if (typeof arg === 'string') return new Date(arg);
        return null;
      }, z.date().nullable()),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

